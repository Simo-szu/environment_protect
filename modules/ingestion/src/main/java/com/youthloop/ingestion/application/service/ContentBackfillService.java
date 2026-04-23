package com.youthloop.ingestion.application.service;

import com.youthloop.content.persistence.entity.ContentEntity;
import com.youthloop.content.persistence.mapper.ContentMapper;
import com.youthloop.ingestion.api.dto.BackfillContentRequest;
import com.youthloop.ingestion.api.dto.BackfillContentSummary;
import com.youthloop.ingestion.application.dto.ExternalArticle;
import com.youthloop.ingestion.persistence.mapper.ContentBackfillMapper;
import com.youthloop.ingestion.persistence.mapper.ContentI18nMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Backfill service for historical content AI clean and localization.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentBackfillService {

    private static final int DEFAULT_LIMIT = 100;
    private static final int MAX_LIMIT = 500;

    private final ContentBackfillMapper contentBackfillMapper;
    private final ContentMapper contentMapper;
    private final ContentI18nMapper contentI18nMapper;
    private final AiContentCleanerService aiContentCleanerService;

    @Transactional
    public BackfillContentSummary backfill(BackfillContentRequest request) {
        LocalDateTime startedAt = LocalDateTime.now();
        int offset = Math.max(0, request != null && request.getOffset() != null ? request.getOffset() : 0);
        int limit = normalizeLimit(request != null ? request.getLimit() : null);
        Integer status = request != null ? request.getStatus() : null;
        Integer sourceType = request != null ? request.getSourceType() : null;
        boolean onlyWithoutLocalization = request != null
            && Boolean.TRUE.equals(request.getOnlyWithoutLocalization());

        long totalCandidates = contentBackfillMapper.countCandidates(status, sourceType, onlyWithoutLocalization);
        List<ContentEntity> candidates = contentBackfillMapper.selectCandidates(
            status,
            sourceType,
            onlyWithoutLocalization,
            offset,
            limit
        );

        int scanned = candidates.size();
        int updated = 0;
        int localized = 0;
        int skipped = 0;
        int failed = 0;

        for (ContentEntity entity : candidates) {
            if (entity == null || !hasText(entity.getTitle()) || !hasText(entity.getBody())) {
                skipped++;
                continue;
            }

            try {
                ExternalArticle article = ExternalArticle.builder()
                    .sourceKey("admin_backfill")
                    .sourceUrl(entity.getSourceUrl())
                    .type(entity.getType())
                    .title(entity.getTitle())
                    .summary(entity.getSummary())
                    .coverUrl(entity.getCoverUrl())
                    .body(entity.getBody())
                    .publishedAt(entity.getPublishedAt())
                    .build();

                ExternalArticle cleaned = aiContentCleanerService.clean(article);
                ExternalArticle localizedArticle = aiContentCleanerService.enrichLocalization(cleaned);

                if (!hasText(localizedArticle.getTitle()) || !hasText(localizedArticle.getBody())) {
                    skipped++;
                    continue;
                }

                if (needsMainContentUpdate(entity, localizedArticle)) {
                    ContentEntity update = new ContentEntity();
                    update.setId(entity.getId());
                    update.setTitle(localizedArticle.getTitle());
                    update.setSummary(localizedArticle.getSummary());
                    update.setBody(localizedArticle.getBody());
                    update.setUpdatedAt(LocalDateTime.now());
                    contentMapper.update(update);
                    updated++;
                }

                localized += persistLocalizedContent(entity.getId(), localizedArticle);
            } catch (Exception e) {
                failed++;
                log.error("Backfill failed for contentId={}", entity.getId(), e);
            }
        }

        return BackfillContentSummary.builder()
            .startedAt(startedAt)
            .finishedAt(LocalDateTime.now())
            .totalCandidates(totalCandidates)
            .scanned(scanned)
            .updated(updated)
            .localized(localized)
            .skipped(skipped)
            .failed(failed)
            .nextOffset(onlyWithoutLocalization ? offset : offset + scanned)
            .build();
    }

    private int normalizeLimit(Integer input) {
        if (input == null) {
            return DEFAULT_LIMIT;
        }
        return Math.min(MAX_LIMIT, Math.max(1, input));
    }

    private boolean needsMainContentUpdate(ContentEntity entity, ExternalArticle article) {
        return !equalsNullable(trim(entity.getTitle()), trim(article.getTitle()))
            || !equalsNullable(trim(entity.getSummary()), trim(article.getSummary()))
            || !equalsNullable(entity.getBody(), article.getBody());
    }

    private int persistLocalizedContent(UUID contentId, ExternalArticle article) {
        if (contentId == null || article == null) {
            return 0;
        }

        int affected = 0;
        String originalLocale = normalizeLocale(article.getOriginalLocale());
        if ("zh".equals(originalLocale)) {
            affected += upsertLocale(contentId, "zh", article.getZhTitle(), article.getZhSummary(), article.getZhBody(), false);
            affected += upsertLocale(contentId, "en", article.getEnTitle(), article.getEnSummary(), article.getEnBody(), true);
            return affected;
        }

        affected += upsertLocale(contentId, "en", article.getEnTitle(), article.getEnSummary(), article.getEnBody(), false);
        affected += upsertLocale(contentId, "zh", article.getZhTitle(), article.getZhSummary(), article.getZhBody(), true);
        return affected;
    }

    private int upsertLocale(
        UUID contentId,
        String locale,
        String title,
        String summary,
        String body,
        boolean isMachineTranslated
    ) {
        if (!hasText(title) || !hasText(body)) {
            return 0;
        }
        return contentI18nMapper.upsertLocalizedContent(
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

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private boolean equalsNullable(String left, String right) {
        if (left == null) {
            return right == null;
        }
        return left.equals(right);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
