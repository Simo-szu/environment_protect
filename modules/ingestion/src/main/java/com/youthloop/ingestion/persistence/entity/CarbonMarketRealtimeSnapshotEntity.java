package com.youthloop.ingestion.persistence.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Persistence entity for social.carbon_market_realtime_snapshot.
 */
@Data
public class CarbonMarketRealtimeSnapshotEntity {

    private UUID id;
    private LocalDate tradeDate;
    private LocalTime quoteTime;
    private BigDecimal lastPrice;
    private BigDecimal changePercent;
    private BigDecimal openPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal previousClosePrice;
    private Long dailyVolumeTons;
    private BigDecimal dailyTurnoverCny;
    private Long cumulativeVolumeTons;
    private BigDecimal cumulativeTurnoverCny;
    private String dailyVolumeText;
    private String dailyTurnoverText;
    private String cumulativeVolumeText;
    private String cumulativeTurnoverText;
    private String sourceCurrDate;
    private String sourceCurrTime;
    private OffsetDateTime syncedAt;
}
