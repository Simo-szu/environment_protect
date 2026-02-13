package com.youthloop.ingestion.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Normalized article model from external websites.
 */
@Data
@Builder
public class ExternalArticle {
    private String sourceKey;
    private String sourceUrl;
    private Integer type;
    private String title;
    private String summary;
    private String coverUrl;
    private String body;
    private LocalDateTime publishedAt;
}

