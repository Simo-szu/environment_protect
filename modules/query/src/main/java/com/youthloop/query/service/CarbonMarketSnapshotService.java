package com.youthloop.query.service;

import com.youthloop.query.dto.CarbonMarketSnapshotDTO;
import com.youthloop.query.dto.CarbonMarketTrendPointDTO;
import com.youthloop.query.mapper.CarbonMarketQueryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Reads the latest carbon market snapshot from the database.
 */
@Service
@RequiredArgsConstructor
public class CarbonMarketSnapshotService {

    private static final String SOURCE_URL = "https://www.cneeex.com/zhhq/quotshown.html";
    private static final String SOURCE_NAME = "China Emissions Exchange";
    private static final ZoneId ASIA_SHANGHAI = ZoneId.of("Asia/Shanghai");

    private final CarbonMarketQueryMapper carbonMarketQueryMapper;

    @Transactional(readOnly = true)
    public CarbonMarketSnapshotDTO getSnapshot() {
        Map<String, Object> latestRow = carbonMarketQueryMapper.selectLatestRealtimeSnapshot();
        if (latestRow == null || latestRow.isEmpty()) {
            return null;
        }

        List<Map<String, Object>> trendRows = carbonMarketQueryMapper.selectLatestDailyKlines(20);

        CarbonMarketSnapshotDTO dto = new CarbonMarketSnapshotDTO();
        dto.setSourceUrl(SOURCE_URL);
        dto.setSourceName(SOURCE_NAME);
        dto.setTradeDate(toLocalDate(latestRow.get("trade_date")));
        dto.setQuoteTime(toLocalTime(latestRow.get("quote_time")));
        dto.setMarketStatus(resolveMarketStatus(dto.getTradeDate(), dto.getQuoteTime()));
        dto.setClosingPrice(toBigDecimal(latestRow.get("last_price")));
        dto.setClosingChangePercent(toBigDecimal(latestRow.get("change_percent")));
        dto.setPreviousClosePrice(toBigDecimal(latestRow.get("previous_close_price")));
        dto.setOpenPrice(toBigDecimal(latestRow.get("open_price")));
        dto.setHighPrice(toBigDecimal(latestRow.get("high_price")));
        dto.setLowPrice(toBigDecimal(latestRow.get("low_price")));
        dto.setPriceUp(dto.getClosingChangePercent() != null ? dto.getClosingChangePercent().signum() >= 0 : null);
        dto.setDailyVolume(toLong(latestRow.get("daily_volume_tons")));
        dto.setDailyTurnover(toBigDecimal(latestRow.get("daily_turnover_cny")));
        dto.setCumulativeVolume(toLong(latestRow.get("cumulative_volume_tons")));
        dto.setCumulativeTurnover(toBigDecimal(latestRow.get("cumulative_turnover_cny")));
        dto.setDailyVolumeText((String) latestRow.get("daily_volume_text"));
        dto.setDailyTurnoverText((String) latestRow.get("daily_turnover_text"));
        dto.setCumulativeVolumeText((String) latestRow.get("cumulative_volume_text"));
        dto.setCumulativeTurnoverText((String) latestRow.get("cumulative_turnover_text"));
        dto.setSyncedAt(toLocalDateTime(latestRow.get("synced_at")));
        dto.setTrendPoints(trendRows.stream()
            .map(this::toTrendPoint)
            .sorted(Comparator.comparing(CarbonMarketTrendPointDTO::getTradeDate))
            .collect(Collectors.toList()));
        return dto;
    }

    private CarbonMarketTrendPointDTO toTrendPoint(Map<String, Object> row) {
        CarbonMarketTrendPointDTO point = new CarbonMarketTrendPointDTO();
        point.setTradeDate(toLocalDate(row.get("trade_date")));
        point.setPreviousClosePrice(null);
        point.setClosingPrice(toBigDecimal(row.get("close_price")));
        point.setLowPrice(toBigDecimal(row.get("low_price")));
        point.setHighPrice(toBigDecimal(row.get("high_price")));
        point.setVolume(toLong(row.get("volume_tons")));
        return point;
    }

    private String resolveMarketStatus(LocalDate tradeDate, LocalTime quoteTime) {
        LocalDate nowDate = LocalDate.now(ASIA_SHANGHAI);
        LocalTime nowTime = LocalTime.now(ASIA_SHANGHAI);

        if (tradeDate == null || quoteTime == null) {
            return "UNKNOWN";
        }
        if (tradeDate.isBefore(nowDate)) {
            return "CLOSED";
        }
        if (tradeDate.isAfter(nowDate)) {
            return "UNKNOWN";
        }
        if (nowTime.isBefore(LocalTime.of(9, 30))) {
            return "PRE_OPEN";
        }
        if ((nowTime.isAfter(LocalTime.of(9, 29)) && nowTime.isBefore(LocalTime.of(11, 31)))
            || (nowTime.isAfter(LocalTime.of(12, 59)) && nowTime.isBefore(LocalTime.of(15, 1)))) {
            return quoteTime.equals(LocalTime.of(15, 0)) ? "CLOSED" : "TRADING";
        }
        return "CLOSED";
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof java.sql.Date date) {
            return date.toLocalDate();
        }
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        return null;
    }

    private LocalTime toLocalTime(Object value) {
        if (value instanceof java.sql.Time time) {
            return time.toLocalTime();
        }
        if (value instanceof LocalTime localTime) {
            return localTime;
        }
        return null;
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        if (value instanceof java.time.OffsetDateTime offsetDateTime) {
            return offsetDateTime.toLocalDateTime();
        }
        return null;
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return null;
    }

    private Long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }
}
