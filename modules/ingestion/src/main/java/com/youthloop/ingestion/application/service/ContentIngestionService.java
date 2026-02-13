package com.youthloop.ingestion.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.content.api.dto.CreateContentRequest;
import com.youthloop.content.api.facade.ContentCommandFacade;
import com.youthloop.ingestion.api.dto.DailyIngestionSummary;
import com.youthloop.ingestion.api.dto.IngestionReport;
import com.youthloop.ingestion.application.dto.ExternalArticle;
import com.youthloop.ingestion.config.IngestionProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Orchestrates daily ingestion flow for all configured sources.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentIngestionService {

    private static final int SOURCE_TYPE_CRAWLED = 2;

    private final IngestionProperties properties;
    private final ContentCommandFacade contentCommandFacade;
    private final List<ContentSourceClient> contentSourceClients;

    public DailyIngestionSummary ingestDaily() {
        LocalDateTime startedAt = LocalDateTime.now();
        List<IngestionReport> reports = new ArrayList<>();

        if (!properties.isEnabled()) {
            log.info("Content ingestion is disabled by configuration.");
            return DailyIngestionSummary.builder()
                .startedAt(startedAt)
                .finishedAt(LocalDateTime.now())
                .reports(reports)
                .build();
        }

        for (ContentSourceClient client : contentSourceClients) {
            reports.add(ingestOneSource(client));
        }

        return DailyIngestionSummary.builder()
            .startedAt(startedAt)
            .finishedAt(LocalDateTime.now())
            .reports(reports)
            .build();
    }

    private IngestionReport ingestOneSource(ContentSourceClient client) {
        String sourceKey = client.sourceKey();
        IngestionProperties.SourceProperties sourceProperties = resolveSourceProperties(sourceKey);
        if (!sourceProperties.isEnabled()) {
            log.info("Skip source {} because it is disabled.", sourceKey);
            return IngestionReport.builder()
                .sourceKey(sourceKey)
                .fetched(0)
                .created(0)
                .skipped(0)
                .failed(0)
                .build();
        }

        int fetched = 0;
        int created = 0;
        int skipped = 0;
        int failed = 0;

        List<ExternalArticle> articles = client.fetchLatest(
            sourceProperties.getMaxPages(),
            sourceProperties.getMaxArticles()
        );
        fetched = articles.size();

        for (ExternalArticle article : articles) {
            if (!isValidArticle(article)) {
                skipped++;
                continue;
            }

            try {
                CreateContentRequest request = new CreateContentRequest();
                request.setType(article.getType());
                request.setTitle(article.getTitle());
                request.setSummary(article.getSummary());
                request.setCoverUrl(article.getCoverUrl());
                request.setBody(article.getBody());
                request.setSourceType(SOURCE_TYPE_CRAWLED);
                request.setSourceUrl(article.getSourceUrl());
                request.setPublishedAt(article.getPublishedAt());
                request.setStatus(properties.getPublishStatus());
                contentCommandFacade.createContent(request);
                created++;
            } catch (BizException e) {
                if (Objects.equals(e.getCode(), ErrorCode.RESOURCE_ALREADY_EXISTS.getCode())) {
                    skipped++;
                } else {
                    failed++;
                    log.warn("Create content failed for sourceUrl={}, code={}, message={}",
                        article.getSourceUrl(), e.getCode(), e.getMessage());
                }
            } catch (Exception e) {
                failed++;
                log.error("Create content failed for sourceUrl={}", article.getSourceUrl(), e);
            }
        }

        log.info("Ingestion source={} fetched={} created={} skipped={} failed={}",
            sourceKey, fetched, created, skipped, failed);

        return IngestionReport.builder()
            .sourceKey(sourceKey)
            .fetched(fetched)
            .created(created)
            .skipped(skipped)
            .failed(failed)
            .build();
    }

    private IngestionProperties.SourceProperties resolveSourceProperties(String sourceKey) {
        return switch (sourceKey) {
            case "earth" -> properties.getEarth();
            case "ecoepn" -> properties.getEcoepn();
            default -> new IngestionProperties.SourceProperties();
        };
    }

    private boolean isValidArticle(ExternalArticle article) {
        if (article == null) {
            return false;
        }
        return hasText(article.getTitle())
            && hasText(article.getBody())
            && hasText(article.getSourceUrl())
            && article.getType() != null;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}

