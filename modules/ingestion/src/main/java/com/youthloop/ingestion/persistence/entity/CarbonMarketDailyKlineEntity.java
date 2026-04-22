package com.youthloop.ingestion.persistence.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Persistence entity for social.carbon_market_daily_kline.
 */
@Data
public class CarbonMarketDailyKlineEntity {

    private LocalDate tradeDate;
    private BigDecimal openPrice;
    private BigDecimal closePrice;
    private BigDecimal lowPrice;
    private BigDecimal highPrice;
    private Long volumeTons;
    private OffsetDateTime syncedAt;
}
