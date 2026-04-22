package com.youthloop.ingestion.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

/**
 * Result payload for one manual carbon market sync trigger.
 */
@Data
@Builder
public class CarbonMarketManualSyncResultDTO {

    private OffsetDateTime requestedAt;
    private OffsetDateTime finishedAt;
    private boolean success;
    private String sourceType;
    private String sourceUrl;
    private LocalDate tradeDate;
    private LocalTime quoteTime;
    private OffsetDateTime syncedAt;
    private String message;
    private String lastError;
}
