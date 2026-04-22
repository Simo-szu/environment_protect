package com.youthloop.ingestion.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.youthloop.ingestion.api.dto.CarbonMarketManualSyncResultDTO;
import com.youthloop.ingestion.infrastructure.client.CarbonMarketSourceClient;
import com.youthloop.ingestion.persistence.entity.CarbonMarketDailyKlineEntity;
import com.youthloop.ingestion.persistence.entity.CarbonMarketRealtimeSnapshotEntity;
import com.youthloop.ingestion.persistence.entity.CarbonMarketSyncStateEntity;
import com.youthloop.ingestion.persistence.mapper.CarbonMarketDailyKlineMapper;
import com.youthloop.ingestion.persistence.mapper.CarbonMarketRealtimeSnapshotMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
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

    private static final ZoneId ASIA_SHANGHAI = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter BASIC_DATE = DateTimeFormatter.BASIC_ISO_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final Duration FAILURE_COOLDOWN = Duration.ofMinutes(30);
    private static final LocalTime MORNING_SYNC_START = LocalTime.of(9, 20);
    private static final LocalTime MORNING_SYNC_END = LocalTime.of(11, 35);
    private static final LocalTime AFTERNOON_SYNC_START = LocalTime.of(12, 55);
    private static final LocalTime AFTERNOON_SYNC_END = LocalTime.of(15, 10);

    private final CarbonMarketSourceClient sourceClient;
    private final CarbonMarketRealtimeSnapshotMapper realtimeSnapshotMapper;
    private final CarbonMarketDailyKlineMapper dailyKlineMapper;
    private final CarbonMarketSyncStateService carbonMarketSyncStateService;

    public boolean shouldSyncNow() {
        ZonedDateTime now = ZonedDateTime.now(ASIA_SHANGHAI);
        if (!isTradingDay(now.getDayOfWeek()) || !isWithinSyncWindow(now.toLocalTime())) {
            return false;
        }

        CarbonMarketSyncStateEntity syncState = carbonMarketSyncStateService.getState();
        if (syncState == null || syncState.getUpdatedAt() == null || syncState.getLastError() == null || syncState.getLastError().isBlank()) {
            return true;
        }
        if (syncState.getLastSuccessAt() != null && !syncState.getUpdatedAt().isAfter(syncState.getLastSuccessAt())) {
            return true;
        }

        OffsetDateTime nowUtc = now.toOffsetDateTime().withOffsetSameInstant(ZoneOffset.UTC);
        return !syncState.getUpdatedAt().plus(FAILURE_COOLDOWN).isAfter(nowUtc);
    }

    @Transactional
    public CarbonMarketManualSyncResultDTO syncOfficialData() {
        OffsetDateTime requestedAt = OffsetDateTime.now(ZoneOffset.UTC);
        try {
            return syncFromRealtimeSource(requestedAt);
        } catch (Exception e) {
            log.info("Primary carbon market realtime source unavailable, falling back to official daily article: {}", e.getMessage());
            return syncFromDailyArticleSource(e, requestedAt);
        }
    }

    public CarbonMarketManualSyncResultDTO triggerManualSync() {
        OffsetDateTime requestedAt = OffsetDateTime.now(ZoneOffset.UTC);
        try {
            return syncOfficialData();
        } catch (Exception e) {
            CarbonMarketSyncStateEntity syncState = carbonMarketSyncStateService.getState();
            return CarbonMarketManualSyncResultDTO.builder()
                .requestedAt(requestedAt)
                .finishedAt(OffsetDateTime.now(ZoneOffset.UTC))
                .success(false)
                .message("Carbon market sync failed")
                .lastError(syncState != null && syncState.getLastError() != null ? syncState.getLastError() : e.getMessage())
                .syncedAt(syncState != null ? syncState.getLastSuccessAt() : null)
                .tradeDate(syncState != null ? syncState.getLastTradeDate() : null)
                .quoteTime(syncState != null ? syncState.getLastQuoteTime() : null)
                .build();
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

    private boolean isTradingDay(DayOfWeek dayOfWeek) {
        return dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY;
    }

    private boolean isWithinSyncWindow(LocalTime now) {
        boolean inMorningWindow = !now.isBefore(MORNING_SYNC_START) && !now.isAfter(MORNING_SYNC_END);
        boolean inAfternoonWindow = !now.isBefore(AFTERNOON_SYNC_START) && !now.isAfter(AFTERNOON_SYNC_END);
        return inMorningWindow || inAfternoonWindow;
    }

    private CarbonMarketManualSyncResultDTO syncFromRealtimeSource(OffsetDateTime requestedAt) throws Exception {
        JsonNode prodInfoNode = sourceClient.fetchJson(CarbonMarketSourceClient.PROD_INFO_URL);
        JsonNode intradayNode = sourceClient.fetchJson(CarbonMarketSourceClient.INTRADAY_URL);
        JsonNode dailyKlineNode = sourceClient.fetchJson(CarbonMarketSourceClient.DAILY_KLINE_URL);
        JsonNode dailyOverviewNode = sourceClient.fetchJson(CarbonMarketSourceClient.DAILY_OVERVIEW_URL);

        CarbonMarketRealtimeSnapshotEntity latestSnapshot =
            buildRealtimeSnapshot(prodInfoNode, intradayNode, dailyOverviewNode);
        List<CarbonMarketDailyKlineEntity> dailyKlines = buildDailyKlines(dailyKlineNode);

        persistSnapshot(latestSnapshot, dailyKlines);
        return buildSuccessResult(
            requestedAt,
            latestSnapshot,
            "REALTIME_JSON",
            CarbonMarketSourceClient.REALTIME_BASE_URL,
            "Carbon market sync completed from realtime source"
        );
    }

    private CarbonMarketManualSyncResultDTO syncFromDailyArticleSource(Exception primaryException, OffsetDateTime requestedAt) {
        try {
            CarbonMarketSourceClient.DailyArticleSnapshot fallbackSnapshot = sourceClient.fetchLatestDailyArticleSnapshot();
            CarbonMarketRealtimeSnapshotEntity realtimeSnapshot = buildRealtimeSnapshotFromDailyArticle(fallbackSnapshot);
            List<CarbonMarketDailyKlineEntity> dailyKlines = List.of(buildDailyKlineFromDailyArticle(fallbackSnapshot));
            persistSnapshot(realtimeSnapshot, dailyKlines);
            log.info("Carbon market sync fell back to official daily article source: {}", fallbackSnapshot.getSourceUrl());
            return buildSuccessResult(
                requestedAt,
                realtimeSnapshot,
                "OFFICIAL_DAILY_ARTICLE",
                fallbackSnapshot.getSourceUrl(),
                "Carbon market sync completed from official daily article"
            );
        } catch (Exception fallbackException) {
            String combinedError = truncate(
                primaryException.getMessage() + " | fallback: " + fallbackException.getMessage(),
                1000
            );
            carbonMarketSyncStateService.markFailure(
                combinedError,
                OffsetDateTime.now(ZoneOffset.UTC)
            );
            throw new IllegalStateException(combinedError, primaryException);
        }
    }

    private void persistSnapshot(
        CarbonMarketRealtimeSnapshotEntity latestSnapshot,
        List<CarbonMarketDailyKlineEntity> dailyKlines
    ) {
        realtimeSnapshotMapper.upsert(latestSnapshot);
        if (!dailyKlines.isEmpty()) {
            dailyKlineMapper.upsertBatch(dailyKlines);
        }

        carbonMarketSyncStateService.markSuccess(
            latestSnapshot.getSyncedAt(),
            latestSnapshot.getTradeDate(),
            latestSnapshot.getQuoteTime()
        );
    }

    private CarbonMarketRealtimeSnapshotEntity buildRealtimeSnapshotFromDailyArticle(
        CarbonMarketSourceClient.DailyArticleSnapshot fallbackSnapshot
    ) {
        OffsetDateTime syncedAt = toUtcOffsetDateTime(fallbackSnapshot.getPublishedAt());

        CarbonMarketRealtimeSnapshotEntity entity = new CarbonMarketRealtimeSnapshotEntity();
        entity.setId(UUID.randomUUID());
        entity.setTradeDate(fallbackSnapshot.getTradeDate());
        entity.setQuoteTime(fallbackSnapshot.getQuoteTime());
        entity.setLastPrice(fallbackSnapshot.getClosePrice());
        entity.setChangePercent(fallbackSnapshot.getChangePercent());
        entity.setOpenPrice(fallbackSnapshot.getOpenPrice());
        entity.setHighPrice(fallbackSnapshot.getHighPrice());
        entity.setLowPrice(fallbackSnapshot.getLowPrice());
        entity.setPreviousClosePrice(null);
        entity.setDailyVolumeTons(fallbackSnapshot.getDailyVolume());
        entity.setDailyTurnoverCny(fallbackSnapshot.getDailyTurnover());
        entity.setCumulativeVolumeTons(fallbackSnapshot.getCumulativeVolume());
        entity.setCumulativeTurnoverCny(fallbackSnapshot.getCumulativeTurnover());
        entity.setDailyVolumeText(null);
        entity.setDailyTurnoverText(null);
        entity.setCumulativeVolumeText(null);
        entity.setCumulativeTurnoverText(null);
        entity.setSourceCurrDate(fallbackSnapshot.getTradeDate().format(BASIC_DATE));
        entity.setSourceCurrTime(fallbackSnapshot.getQuoteTime().format(TIME_FORMATTER));
        entity.setSyncedAt(syncedAt);
        return entity;
    }

    private CarbonMarketDailyKlineEntity buildDailyKlineFromDailyArticle(
        CarbonMarketSourceClient.DailyArticleSnapshot fallbackSnapshot
    ) {
        CarbonMarketDailyKlineEntity entity = new CarbonMarketDailyKlineEntity();
        entity.setTradeDate(fallbackSnapshot.getTradeDate());
        entity.setOpenPrice(fallbackSnapshot.getOpenPrice());
        entity.setClosePrice(fallbackSnapshot.getClosePrice());
        entity.setLowPrice(fallbackSnapshot.getLowPrice());
        entity.setHighPrice(fallbackSnapshot.getHighPrice());
        entity.setVolumeTons(fallbackSnapshot.getDailyVolume());
        entity.setSyncedAt(toUtcOffsetDateTime(fallbackSnapshot.getPublishedAt()));
        return entity;
    }

    private OffsetDateTime toUtcOffsetDateTime(LocalDateTime localDateTime) {
        return localDateTime.atZone(ASIA_SHANGHAI).withZoneSameInstant(ZoneOffset.UTC).toOffsetDateTime();
    }

    private CarbonMarketManualSyncResultDTO buildSuccessResult(
        OffsetDateTime requestedAt,
        CarbonMarketRealtimeSnapshotEntity latestSnapshot,
        String sourceType,
        String sourceUrl,
        String message
    ) {
        return CarbonMarketManualSyncResultDTO.builder()
            .requestedAt(requestedAt)
            .finishedAt(OffsetDateTime.now(ZoneOffset.UTC))
            .success(true)
            .sourceType(sourceType)
            .sourceUrl(sourceUrl)
            .tradeDate(latestSnapshot.getTradeDate())
            .quoteTime(latestSnapshot.getQuoteTime())
            .syncedAt(latestSnapshot.getSyncedAt())
            .message(message)
            .lastError(null)
            .build();
    }
}
