package com.youthloop.ingestion.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Summary for one daily ingestion run.
 */
@Data
@Builder
public class DailyIngestionSummary {
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private List<IngestionReport> reports;
}

