package com.youthloop.ingestion.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Admin request to update ingestion settings.
 */
@Data
public class UpdateIngestionSettingsRequest {

    @NotBlank
    private String cron;

    @NotBlank
    private String zone;

    @NotNull
    private Boolean enabled;

    @NotNull
    @Min(0)
    private Integer publishStatus;

    @NotNull
    @Min(1)
    private Integer requestTimeoutMs;

    @NotNull
    @Min(0)
    private Long requestIntervalMs;

    @NotNull
    @Valid
    private SourceSettingsRequest earth;

    @NotNull
    @Valid
    private SourceSettingsRequest ecoepn;

    @Data
    public static class SourceSettingsRequest {
        @NotNull
        private Boolean enabled;

        @NotNull
        @Min(1)
        private Integer maxPages;

        @NotNull
        @Min(1)
        private Integer maxArticles;
    }
}
