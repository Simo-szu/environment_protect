package com.youthloop.ingestion.application.service;

import com.youthloop.content.api.dto.CreateContentRequest;
import com.youthloop.content.api.facade.ContentCommandFacade;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.ingestion.api.dto.DailyIngestionSummary;
import com.youthloop.ingestion.api.dto.IngestionSettingsDTO;
import com.youthloop.ingestion.api.dto.IngestionReport;
import com.youthloop.ingestion.api.facade.IngestionSettingsFacade;
import com.youthloop.ingestion.application.dto.ExternalArticle;
import com.youthloop.ingestion.persistence.mapper.ContentI18nMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Orchestrates daily ingestion flow for all configured sources.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentIngestionService {

    private static final int SOURCE_TYPE_CRAWLED = 2;

    private final IngestionSettingsFacade ingestionSettingsFacade;
    private final ContentCommandFacade contentCommandFacade;
    private final List<ContentSourceClient> contentSourceClients;
    private final AiContentCleanerService aiContentCleanerService;
    private final ContentI18nMapper contentI18nMapper;

    public DailyIngestionSummary ingestDaily() {
        IngestionSettingsDTO settings = ingestionSettingsFacade.getSettings();
        LocalDateTime startedAt = LocalDateTime.now();
        List<IngestionReport> reports = new ArrayList<>();

        if (!settings.isEnabled()) {
            log.info("Content ingestion is disabled by configuration.");
            return DailyIngestionSummary.builder()
                .startedAt(startedAt)
                .finishedAt(LocalDateTime.now())
                .reports(reports)
                .build();
        }

        ExecutorService executor = Executors.newFixedThreadPool(
            Math.min(contentSourceClients.size(), 5));
        try {
            List<CompletableFuture<IngestionReport>> futures = contentSourceClients.stream()
                .map(client -> CompletableFuture.supplyAsync(
                    () -> ingestOneSource(client, settings), executor))
                .toList();

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            for (CompletableFuture<IngestionReport> future : futures) {
                reports.add(future.join());
            }
        } finally {
            executor.shutdown();
        }

        return DailyIngestionSummary.builder()
            .startedAt(startedAt)
            .finishedAt(LocalDateTime.now())
            .reports(reports)
            .build();
    }

    private IngestionReport ingestOneSource(ContentSourceClient client, IngestionSettingsDTO settings) {
        String sourceKey = client.sourceKey();
        IngestionSettingsDTO.SourceSettings sourceProperties = resolveSourceSettings(sourceKey, settings);
        if (sourceProperties == null) {
            log.info("Skip source {} because no settings found.", sourceKey);
            return IngestionReport.builder()
                .sourceKey(sourceKey)
                .fetched(0)
                .created(0)
                .skipped(0)
                .failed(0)
                .build();
        }
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
            sourceProperties.getMaxArticles(),
            settings.getRequestTimeoutMs(),
            sourceProperties.getRequestIntervalMs() != null
                ? sourceProperties.getRequestIntervalMs()
                : settings.getRequestIntervalMs()
        );
        fetched = articles.size();

        for (ExternalArticle article : articles) {
            ExternalArticle cleanedArticle = aiContentCleanerService.clean(article);
            ExternalArticle localizedArticle = aiContentCleanerService.enrichLocalization(cleanedArticle);

            if (!isValidArticle(localizedArticle)) {
                skipped++;
                continue;
            }

            try {
                CreateContentRequest request = new CreateContentRequest();
                request.setType(sourceProperties.getContentType() != null
                    ? sourceProperties.getContentType()
                    : localizedArticle.getType());
                request.setTitle(localizedArticle.getTitle());
                request.setSummary(localizedArticle.getSummary());
                request.setCoverUrl(localizedArticle.getCoverUrl());
                request.setBody(localizedArticle.getBody());
                request.setSourceType(SOURCE_TYPE_CRAWLED);
                request.setSourceUrl(localizedArticle.getSourceUrl());
                request.setPublishedAt(localizedArticle.getPublishedAt());
                request.setStatus(settings.getPublishStatus());
                UUID contentId = contentCommandFacade.createContent(request);
                persistLocalizedContent(contentId, localizedArticle);
                created++;
            } catch (BizException e) {
                if (Objects.equals(e.getCode(), ErrorCode.RESOURCE_ALREADY_EXISTS.getCode())) {
                    skipped++;
                    UUID existingContentId = contentCommandFacade.findContentIdBySourceUrl(localizedArticle.getSourceUrl());
                    if (existingContentId != null) {
                        persistLocalizedContent(existingContentId, localizedArticle);
                    } else {
                        log.warn("Skip localization backfill because existing content is not found by sourceUrl={}",
                            localizedArticle.getSourceUrl());
                    }
                } else {
                    failed++;
                    log.warn("Create content failed for sourceUrl={}, code={}, message={}",
                        localizedArticle.getSourceUrl(), e.getCode(), e.getMessage());
                }
            } catch (Exception e) {
                failed++;
                log.error("Create content failed for sourceUrl={}", localizedArticle.getSourceUrl(), e);
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

    private IngestionSettingsDTO.SourceSettings resolveSourceSettings(String sourceKey, IngestionSettingsDTO settings) {
        Map<String, IngestionSettingsDTO.SourceSettings> sources = settings.getSources();
        if (sources == null || sources.isEmpty()) {
            return null;
        }
        return sources.get(sourceKey);
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

    private void persistLocalizedContent(UUID contentId, ExternalArticle article) {
        if (contentId == null || article == null) {
            return;
        }

        String originalLocale = normalizeLocale(article.getOriginalLocale());
        if ("zh".equals(originalLocale)) {
            upsertLocale(contentId, "zh", article.getZhTitle(), article.getZhSummary(), article.getZhBody(), false);
            upsertLocale(contentId, "en", article.getEnTitle(), article.getEnSummary(), article.getEnBody(), true);
            return;
        }

        upsertLocale(contentId, "en", article.getEnTitle(), article.getEnSummary(), article.getEnBody(), false);
        upsertLocale(contentId, "zh", article.getZhTitle(), article.getZhSummary(), article.getZhBody(), true);
    }

    private void upsertLocale(
        UUID contentId,
        String locale,
        String title,
        String summary,
        String body,
        boolean isMachineTranslated
    ) {
        if (!hasText(title) || !hasText(body)) {
            return;
        }
        contentI18nMapper.upsertLocalizedContent(
            contentId,
            locale,
            title.trim(),
            hasText(summary) ? summary.trim() : null,
            body,
            isMachineTranslated,
            isMachineTranslated ? LocalDateTime.now() : null
        );
    }

    private String normalizeLocale(String locale) {
        if (!hasText(locale)) {
            return "en";
        }
        String normalized = locale.trim().toLowerCase();
        if (normalized.startsWith("zh")) {
            return "zh";
        }
        return "en";
    }
}
