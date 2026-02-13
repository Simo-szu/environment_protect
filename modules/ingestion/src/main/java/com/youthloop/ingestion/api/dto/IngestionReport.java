package com.youthloop.ingestion.api.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Ingestion report for one source.
 */
@Data
@Builder
public class IngestionReport {
    private String sourceKey;
    private int fetched;
    private int created;
    private int skipped;
    private int failed;
}

