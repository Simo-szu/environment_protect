package com.youthloop.ingestion.persistence.entity;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

/**
 * Persistence entity for social.carbon_market_sync_state.
 */
@Data
public class CarbonMarketSyncStateEntity {

    private Integer id;
    private OffsetDateTime lastSuccessAt;
    private LocalDate lastTradeDate;
    private LocalTime lastQuoteTime;
    private String lastError;
    private OffsetDateTime updatedAt;
}
