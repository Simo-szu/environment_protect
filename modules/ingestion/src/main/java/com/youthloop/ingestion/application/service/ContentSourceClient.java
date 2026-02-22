package com.youthloop.ingestion.application.service;

import com.youthloop.ingestion.application.dto.ExternalArticle;

import java.util.List;

/**
 * Source client abstraction for external content websites.
 */
public interface ContentSourceClient {

    String sourceKey();

    List<ExternalArticle> fetchLatest(int maxPages, int maxArticles, int requestTimeoutMs, long requestIntervalMs);
}
