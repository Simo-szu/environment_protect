package com.youthloop.ingestion.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * Admin request for content backfill cleanup and localization.
 */
@Data
@Schema(description = "Backfill existing content with AI clean and localization")
public class BackfillContentRequest {

    @Schema(description = "Batch offset", example = "0")
    private Integer offset = 0;

    @Schema(description = "Batch size, max 500", example = "100")
    private Integer limit = 100;

    @Schema(description = "Optional status filter", example = "1")
    private Integer status;

    @Schema(description = "Optional source type filter", example = "2")
    private Integer sourceType;

    @Schema(description = "Only process content missing zh/en localization", example = "false")
    private Boolean onlyWithoutLocalization = false;
}
