package com.youthloop.ingestion.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configurations for daily content ingestion.
 */
@Data
@Component
@ConfigurationProperties(prefix = "ingestion.content")
public class IngestionProperties {

    private boolean enabled = true;
    private int publishStatus = 1;
    private int requestTimeoutMs = 10_000;
    private long requestIntervalMs = 300L;

    private SourceProperties earth = new SourceProperties();
    private SourceProperties ecoepn = new SourceProperties();

    @Data
    public static class SourceProperties {
        private boolean enabled = true;
        private int maxPages = 2;
        private int maxArticles = 30;
    }
}

