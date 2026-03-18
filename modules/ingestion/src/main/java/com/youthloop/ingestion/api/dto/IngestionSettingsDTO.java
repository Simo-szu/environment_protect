package com.youthloop.ingestion.api.dto;

import lombok.Data;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Ingestion runtime settings.
 */
@Data
public class IngestionSettingsDTO {

    private String cron;
    private String zone;
    private boolean enabled;
    private int publishStatus;
    private int requestTimeoutMs;
    private long requestIntervalMs;
    private SourceSettings earth;
    private SourceSettings ecoepn;
    private Map<String, SourceSettings> sources = new LinkedHashMap<>();

    @Data
    public static class SourceSettings {
        private boolean enabled;
        private int maxPages;
        private int maxArticles;
        private Long requestIntervalMs;
        private Integer contentType;
        private String placement;
    }
}
