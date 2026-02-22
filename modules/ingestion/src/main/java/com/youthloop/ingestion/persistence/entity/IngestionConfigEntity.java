package com.youthloop.ingestion.persistence.entity;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Persistence entity for social.ingestion_config.
 */
@Data
public class IngestionConfigEntity {

    private Integer id;
    private String cron;
    private String zoneId;
    private Boolean isEnabled;
    private Integer publishStatus;
    private Integer requestTimeoutMs;
    private Long requestIntervalMs;
    private Boolean earthEnabled;
    private Integer earthMaxPages;
    private Integer earthMaxArticles;
    private Boolean ecoepnEnabled;
    private Integer ecoepnMaxPages;
    private Integer ecoepnMaxArticles;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
