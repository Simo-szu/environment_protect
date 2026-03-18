package com.youthloop.ingestion.persistence.entity;

import lombok.Data;

import java.time.OffsetDateTime;

/**
 * Persistence entity for social.ingestion_source_config.
 */
@Data
public class IngestionSourceConfigEntity {

    private String sourceKey;
    private Boolean isEnabled;
    private Integer maxPages;
    private Integer maxArticles;
    private Long requestIntervalMs;
    private Integer contentType;
    private String placement;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

