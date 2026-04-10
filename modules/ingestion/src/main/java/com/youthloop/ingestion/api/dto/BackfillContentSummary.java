package com.youthloop.ingestion.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Summary for one backfill run.
 */
@Data
@Builder
@Schema(description = "Backfill summary")
public class BackfillContentSummary {

    @Schema(description = "Start time")
    private LocalDateTime startedAt;

    @Schema(description = "Finish time")
    private LocalDateTime finishedAt;

    @Schema(description = "Total candidates under current filters")
    private long totalCandidates;

    @Schema(description = "Number of rows selected in current batch")
    private int scanned;

    @Schema(description = "Number of main content rows updated")
    private int updated;

    @Schema(description = "Number of localization rows upserted")
    private int localized;

    @Schema(description = "Number of skipped rows")
    private int skipped;

    @Schema(description = "Number of failed rows")
    private int failed;

    @Schema(description = "Next offset for subsequent call")
    private int nextOffset;
}
