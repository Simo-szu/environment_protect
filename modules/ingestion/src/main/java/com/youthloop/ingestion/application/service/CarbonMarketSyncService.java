package com.youthloop.ingestion.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.youthloop.ingestion.infrastructure.client.CarbonMarketSourceClient;
import com.youthloop.ingestion.persistence.entity.CarbonMarketDailyKlineEntity;
import com.youthloop.ingestion.persistence.entity.CarbonMarketRealtimeSnapshotEntity;
import com.youthloop.ingestion.persistence.entity.CarbonMarketSyncStateEntity;
import com.youthloop.ingestion.persistence.mapper.CarbonMarketDailyKlineMapper;
import com.youthloop.ingestion.persistence.mapper.CarbonMarketRealtimeSnapshotMapper;
import com.youthloop.ingestion.persistence.mapper.CarbonMarketSyncStateMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Synchronizes official national carbon market JSON data into the database.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CarbonMarketSyncService {

    private static final int SYNC_STATE_ID = 1;
    private static final DateTimeFormatter BASIC_DATE = DateTimeFormatter.BASIC_ISO_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final CarbonMarketSourceClient sourceClient;
    private final CarbonMarketRealtimeSnapshotMapper realtimeSnapshotMapper;
    private final CarbonMarketDailyKlineMapper dailyKlineMapper;
    private final CarbonMarketSyncStateMapper syncStateMapper;
    private final CarbonMarketSyncStateService carbonMarketSyncStateService;

    @Transactional
    public void syncOfficialData() {
        try {
            JsonNode prodInfoNode = sourceClient.fetchJson(CarbonMarketSourceClient.PROD_INFO_URL);
            JsonNode intradayNode = sourceClient.fetchJson(CarbonMarketSourceClient.INTRADAY_URL);
            JsonNode dailyKlineNode = sourceClient.fetchJson(CarbonMarketSourceClient.DAILY_KLINE_URL);
            JsonNode dailyOverviewNode = sourceClient.fetchJson(CarbonMarketSourceClient.DAILY_OVERVIEW_URL);

            CarbonMarketRealtimeSnapshotEntity latestSnapshot =
                buildRealtimeSnapshot(prodInfoNode, intradayNode, dailyOverviewNode);
            List<CarbonMarketDailyKlineEntity> dailyKlines = buildDailyKlines(dailyKlineNode);

            realtimeSnapshotMapper.upsert(latestSnapshot);
            if (!dailyKlines.isEmpty()) {
                dailyKlineMapper.upsertBatch(dailyKlines);
            }

            carbonMarketSyncStateService.markSuccess(
                latestSnapshot.getSyncedAt(),
                latestSnapshot.getTradeDate(),
                latestSnapshot.getQuoteTime()
            );
        } catch (Exception e) {
            log.warn("Failed to sync official carbon market data", e);
            carbonMarketSyncStateService.markFailure(
                truncate(e.getMessage(), 1000),
                OffsetDateTime.now(ZoneOffset.UTC)
            );
            throw new IllegalStateException("Carbon market sync failed", e);
        }
    }

    private CarbonMarketRealtimeSnapshotEntity buildRealtimeSnapshot(
        JsonNode prodInfoNode,
        JsonNode intradayNode,
        JsonNode dailyOverviewNode
    ) {
        if (prodInfoNode == null || intradayNode == null || !intradayNode.isArray() || intradayNode.isEmpty()) {
            throw new IllegalStateException("Official carbon market realtime payload is empty");
        }

        JsonNode latestPoint = intradayNode.get(intradayNode.size() - 1);
        if (latestPoint == null || !latestPoint.isArray() || latestPoint.size() < 9) {
            throw new IllegalStateException("Official carbon market latest intraday point is invalid");
        }

        OffsetDateTime syncedAt = OffsetDateTime.now(ZoneOffset.UTC);
        CarbonMarketRealtimeSnapshotEntity entity = new CarbonMarketRealtimeSnapshotEntity();
        entity.setId(UUID.randomUUID());
        entity.setTradeDate(parseBasicDate(readText(prodInfoNode, "currDate")));
        entity.setQuoteTime(parseTime(readText(prodInfoNode, "currTime")));
        entity.setLastPrice(parseDecimal(readArrayText(latestPoint, 1)));
        entity.setChangePercent(parsePercent(readArrayText(latestPoint, 8)));
        entity.setOpenPrice(parseDecimal(readArrayText(latestPoint, 2)));
        entity.setHighPrice(parseDecimal(readArrayText(latestPoint, 3)));
        entity.setLowPrice(parseDecimal(readArrayText(latestPoint, 4)));
        entity.setPreviousClosePrice(parseDecimal(readText(prodInfoNode, "lastPrice")));
        entity.setDailyVolumeTons(parseLong(readArrayText(latestPoint, 6)));
        entity.setDailyTurnoverCny(parseDecimal(readArrayText(latestPoint, 7)));
        entity.setCumulativeVolumeTons(parseChineseQuantity(readText(dailyOverviewNode, "totalQty")));
        entity.setCumulativeTurnoverCny(parseChineseAmount(readText(dailyOverviewNode, "totalAmt")));
        entity.setDailyVolumeText(readText(dailyOverviewNode, "todayQty"));
        entity.setDailyTurnoverText(readText(dailyOverviewNode, "todayAmt"));
        entity.setCumulativeVolumeText(readText(dailyOverviewNode, "totalQty"));
        entity.setCumulativeTurnoverText(readText(dailyOverviewNode, "totalAmt"));
        entity.setSourceCurrDate(readText(prodInfoNode, "currDate"));
        entity.setSourceCurrTime(readText(prodInfoNode, "currTime"));
        entity.setSyncedAt(syncedAt);

        if (entity.getTradeDate() == null || entity.getQuoteTime() == null || entity.getLastPrice() == null) {
            throw new IllegalStateException("Official carbon market latest snapshot is incomplete");
        }
        return entity;
    }

    private List<CarbonMarketDailyKlineEntity> buildDailyKlines(JsonNode dailyKlineNode) {
        if (dailyKlineNode == null || !dailyKlineNode.isArray()) {
            return List.of();
        }

        OffsetDateTime syncedAt = OffsetDateTime.now(ZoneOffset.UTC);
        List<CarbonMarketDailyKlineEntity> items = new ArrayList<>();
        for (JsonNode item : dailyKlineNode) {
            if (!item.isArray() || item.size() < 6) {
                continue;
            }

            CarbonMarketDailyKlineEntity entity = new CarbonMarketDailyKlineEntity();
            entity.setTradeDate(parseDashedDate(readArrayText(item, 0)));
            entity.setOpenPrice(parseDecimal(readArrayText(item, 1)));
            entity.setClosePrice(parseDecimal(readArrayText(item, 2)));
            entity.setLowPrice(parseDecimal(readArrayText(item, 3)));
            entity.setHighPrice(parseDecimal(readArrayText(item, 4)));
            entity.setVolumeTons(parseLong(readArrayText(item, 5)));
            entity.setSyncedAt(syncedAt);

            if (entity.getTradeDate() != null && entity.getClosePrice() != null) {
                items.add(entity);
            }
        }

        items.sort(Comparator.comparing(CarbonMarketDailyKlineEntity::getTradeDate));
        return items;
    }

    private String readText(JsonNode node, String fieldName) {
        JsonNode child = node.get(fieldName);
        if (child == null || child.isNull()) {
            return null;
        }
        return child.asText();
    }

    private String readArrayText(JsonNode node, int index) {
        JsonNode child = node.get(index);
        if (child == null || child.isNull()) {
            return null;
        }
        return child.asText();
    }

    private LocalDate parseBasicDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDate.parse(value.trim(), BASIC_DATE);
    }

    private LocalDate parseDashedDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDate.parse(value.trim());
    }

    private LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalTime.parse(value.trim(), TIME_FORMATTER);
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return new BigDecimal(value.replace(",", "").replace("%", "").trim());
    }

    private BigDecimal parsePercent(String value) {
        return parseDecimal(value);
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return new BigDecimal(value.replace(",", "").trim()).longValue();
    }

    private Long parseChineseQuantity(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.replace(",", "").trim();
        BigDecimal multiplier = BigDecimal.ONE;
        if (normalized.contains("亿吨")) {
            multiplier = new BigDecimal("100000000");
        } else if (normalized.contains("万吨")) {
            multiplier = new BigDecimal("10000");
        }
        String numericPart = normalized
            .replace("亿吨", "")
            .replace("万吨", "")
            .replace("吨", "")
            .trim();
        return new BigDecimal(numericPart).multiply(multiplier).longValue();
    }

    private BigDecimal parseChineseAmount(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.replace(",", "").trim();
        BigDecimal multiplier = BigDecimal.ONE;
        if (normalized.contains("亿元")) {
            multiplier = new BigDecimal("100000000");
            normalized = normalized.replace("亿元", "");
        } else if (normalized.contains("万元")) {
            multiplier = new BigDecimal("10000");
            normalized = normalized.replace("万元", "");
        } else if (normalized.contains("元")) {
            normalized = normalized.replace("元", "");
        }
        return new BigDecimal(normalized.trim()).multiply(multiplier);
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
