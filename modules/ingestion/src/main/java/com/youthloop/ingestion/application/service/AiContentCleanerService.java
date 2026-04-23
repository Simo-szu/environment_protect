package com.youthloop.ingestion.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.ingestion.application.dto.ExternalArticle;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Optional AI post-processing for crawled content quality.
 * This service is fail-safe: when AI fails, original content is kept.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiContentCleanerService {

    private static final String SYSTEM_PROMPT = """
        You are a professional content-cleaning assistant for environmental science websites.
        Clean OCR/encoding noise, duplicated sections, broken symbols, and malformed wording.
        Keep facts unchanged, never invent claims, links, numbers, names, or dates.
        Return strict JSON only with keys:
        {"title":"...", "summary":"...", "bodyHtml":"..."}
        Rules:
        1) title: concise and readable, original language.
        2) summary: 1-2 sentences, <= 220 chars when possible.
        3) bodyHtml: keep valid readable HTML blocks (<p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <a>, <img>, <strong>, <em>).
        4) Remove duplicated intro lines if they repeat the same message.
        5) Do not output markdown fences or explanations.
        """;

    private static final String LOCALIZATION_SYSTEM_PROMPT = """
        You are a bilingual editor for Chinese and English environmental science content.
        Keep facts unchanged, never invent claims, links, numbers, names, or dates.
        Return strict JSON only with keys:
        {
          "detectedLocale":"zh|en",
          "zhTitle":"...",
          "zhSummary":"...",
          "zhBodyHtml":"...",
          "enTitle":"...",
          "enSummary":"...",
          "enBodyHtml":"..."
        }
        Rules:
        1) Preserve factual meaning and numeric values.
        2) Keep body HTML readable and valid (<p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <a>, <img>, <strong>, <em>).
        3) Keep summary concise (1-2 sentences), ideally <= 220 chars.
        4) If source is Chinese, provide natural English translation; if source is English, provide natural Chinese translation.
        5) Do not output markdown fences or explanations.
        """;

    private static final String TARGETED_LOCALIZATION_SYSTEM_PROMPT = """
        You are a bilingual editor for Chinese and English environmental science content.
        Keep facts unchanged, never invent claims, links, numbers, names, or dates.
        Return strict JSON only. If targetLocale is zh, return keys:
        {"detectedLocale":"en","zhTitle":"...","zhSummary":"...","zhBodyHtml":"..."}
        If targetLocale is en, return keys:
        {"detectedLocale":"zh","enTitle":"...","enSummary":"...","enBodyHtml":"..."}
        Rules:
        1) Translate only into the requested targetLocale.
        2) Preserve factual meaning and numeric values.
        3) Keep body HTML readable and valid (<p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <a>, <img>, <strong>, <em>).
        4) Keep summary concise (1-2 sentences), ideally <= 220 chars.
        5) Do not output markdown fences or explanations.
        """;

    private final ObjectMapper objectMapper;
    private final HtmlSanitizerService htmlSanitizerService;

    @Value("${ingestion.ai-cleaner.enabled:false}")
    private boolean enabled;

    @Value("${ingestion.ai-cleaner.api-url:https://api.deepseek.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${ingestion.ai-cleaner.api-key:}")
    private String apiKey;

    @Value("${ingestion.ai-cleaner.model:deepseek-chat}")
    private String model;

    @Value("${ingestion.ai-cleaner.connect-timeout-ms:5000}")
    private int connectTimeoutMs;

    @Value("${ingestion.ai-cleaner.read-timeout-ms:20000}")
    private int readTimeoutMs;

    @Value("${ingestion.ai-cleaner.localization-read-timeout-ms:60000}")
    private int localizationReadTimeoutMs;

    @Value("${ingestion.ai-cleaner.max-input-body-chars:14000}")
    private int maxInputBodyChars;

    @Value("${ingestion.ai-cleaner.max-summary-chars:220}")
    private int maxSummaryChars;

    public ExternalArticle clean(ExternalArticle article) {
        if (!enabled || !hasText(apiKey) || article == null || !hasText(article.getBody())) {
            return article;
        }

        try {
            String responseBody = callAiForCleaning(article);
            CleanedContent cleaned = parseCleanedContent(responseBody);
            if (cleaned == null) {
                return article;
            }

            String cleanedBody = htmlSanitizerService.sanitize(cleaned.bodyHtml());
            if (!hasText(cleanedBody)) {
                cleanedBody = article.getBody();
            }

            return ExternalArticle.builder()
                .sourceKey(article.getSourceKey())
                .sourceUrl(article.getSourceUrl())
                .type(article.getType())
                .title(normalizeText(orElse(cleaned.title(), article.getTitle())))
                .summary(truncate(normalizeText(orElse(cleaned.summary(), article.getSummary())), maxSummaryChars))
                .coverUrl(article.getCoverUrl())
                .body(cleanedBody)
                .publishedAt(article.getPublishedAt())
                .build();
        } catch (Exception e) {
            log.warn("AI cleaner fallback to original content. sourceUrl={}, reason={}",
                article.getSourceUrl(), e.getMessage());
            return article;
        }
    }

    public ExternalArticle enrichLocalization(ExternalArticle article) {
        if (article == null) {
            return null;
        }

        ExternalArticle localized = seedLocalizedFields(article);
        if (!enabled || !hasText(apiKey) || !hasText(localized.getBody()) || !hasText(localized.getTitle())) {
            return localized;
        }

        try {
            String responseBody = callAi(
                TARGETED_LOCALIZATION_SYSTEM_PROMPT,
                buildTargetedLocalizationPrompt(localized),
                8000,
                localizationReadTimeoutMs
            );
            LocalizedContent content = parseLocalizedContent(responseBody);
            if (content == null) {
                return localized;
            }
            return mergeLocalizedContent(localized, content);
        } catch (Exception e) {
            log.warn("AI localization fallback to original content. sourceUrl={}, reason={}",
                article.getSourceUrl(), e.getMessage());
            return localized;
        }
    }

    private String callAiForCleaning(ExternalArticle article) throws IOException, InterruptedException {
        return callAi(SYSTEM_PROMPT, buildUserPrompt(article), 3200);
    }

    private String callAi(String systemPrompt, String userPrompt, int maxTokens) throws IOException, InterruptedException {
        return callAi(systemPrompt, userPrompt, maxTokens, readTimeoutMs);
    }

    private String callAi(
        String systemPrompt,
        String userPrompt,
        int maxTokens,
        int requestReadTimeoutMs
    ) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofMillis(connectTimeoutMs))
            .build();
        String payload = buildRequestPayload(systemPrompt, userPrompt, maxTokens);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(apiUrl))
            .timeout(Duration.ofMillis(requestReadTimeoutMs))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Unexpected status: " + response.statusCode());
        }
        return response.body();
    }

    private String buildRequestPayload(String systemPrompt, String userPrompt, int maxTokens) throws IOException {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("messages", objectMapper.createArrayNode()
            .add(objectMapper.createObjectNode()
                .put("role", "system")
                .put("content", systemPrompt))
            .add(objectMapper.createObjectNode()
                .put("role", "user")
                .put("content", userPrompt)));
        payload.put("temperature", 0.1);
        payload.put("max_tokens", maxTokens);
        payload.set("response_format", objectMapper.createObjectNode().put("type", "json_object"));
        return objectMapper.writeValueAsString(payload);
    }

    private String buildUserPrompt(ExternalArticle article) {
        String body = article.getBody();
        if (body.length() > maxInputBodyChars) {
            body = body.substring(0, maxInputBodyChars);
        }

        return """
            sourceKey: %s
            sourceUrl: %s
            title: %s
            summary: %s
            bodyHtml:
            %s
            """.formatted(
            sanitizePromptValue(article.getSourceKey()),
            sanitizePromptValue(article.getSourceUrl()),
            sanitizePromptValue(article.getTitle()),
            sanitizePromptValue(article.getSummary()),
            body
        );
    }

    private String buildLocalizationPrompt(ExternalArticle article) {
        String body = article.getBody();
        if (body.length() > maxInputBodyChars) {
            body = body.substring(0, maxInputBodyChars);
        }
        return """
            sourceKey: %s
            sourceUrl: %s
            originalLocale: %s
            title: %s
            summary: %s
            bodyHtml:
            %s
            """.formatted(
            sanitizePromptValue(article.getSourceKey()),
            sanitizePromptValue(article.getSourceUrl()),
            sanitizePromptValue(article.getOriginalLocale()),
            sanitizePromptValue(article.getTitle()),
            sanitizePromptValue(article.getSummary()),
            body
        );
    }

    private String buildTargetedLocalizationPrompt(ExternalArticle article) {
        String body = article.getBody();
        if (body.length() > maxInputBodyChars) {
            body = body.substring(0, maxInputBodyChars);
        }
        String targetLocale = "zh".equals(article.getOriginalLocale()) ? "en" : "zh";
        return """
            sourceKey: %s
            sourceUrl: %s
            originalLocale: %s
            targetLocale: %s
            title: %s
            summary: %s
            bodyHtml:
            %s
            """.formatted(
            sanitizePromptValue(article.getSourceKey()),
            sanitizePromptValue(article.getSourceUrl()),
            sanitizePromptValue(article.getOriginalLocale()),
            targetLocale,
            sanitizePromptValue(article.getTitle()),
            sanitizePromptValue(article.getSummary()),
            body
        );
    }

    private CleanedContent parseCleanedContent(String rawResponse) throws IOException {
        JsonNode root = objectMapper.readTree(rawResponse);
        JsonNode messageNode = root.path("choices").path(0).path("message").path("content");
        if (!messageNode.isTextual() || messageNode.asText().isBlank()) {
            return null;
        }

        String message = stripJsonFence(messageNode.asText());
        JsonNode cleaned = objectMapper.readTree(message);
        return new CleanedContent(
            normalizeText(cleaned.path("title").asText(null)),
            normalizeText(cleaned.path("summary").asText(null)),
            cleaned.path("bodyHtml").asText(null)
        );
    }

    private LocalizedContent parseLocalizedContent(String rawResponse) throws IOException {
        JsonNode root = objectMapper.readTree(rawResponse);
        JsonNode messageNode = root.path("choices").path(0).path("message").path("content");
        if (!messageNode.isTextual() || messageNode.asText().isBlank()) {
            return null;
        }

        String message = stripJsonFence(messageNode.asText());
        JsonNode localized = objectMapper.readTree(message);
        return new LocalizedContent(
            normalizeLocale(localized.path("detectedLocale").asText(null)),
            normalizeText(localized.path("zhTitle").asText(null)),
            normalizeText(localized.path("zhSummary").asText(null)),
            localized.path("zhBodyHtml").asText(null),
            normalizeText(localized.path("enTitle").asText(null)),
            normalizeText(localized.path("enSummary").asText(null)),
            localized.path("enBodyHtml").asText(null)
        );
    }

    private ExternalArticle mergeLocalizedContent(ExternalArticle article, LocalizedContent localizedContent) {
        String detectedLocale = hasText(localizedContent.detectedLocale())
            ? localizedContent.detectedLocale()
            : article.getOriginalLocale();

        String zhBody = htmlSanitizerService.sanitize(orElse(localizedContent.zhBodyHtml(), article.getZhBody()));
        String enBody = htmlSanitizerService.sanitize(orElse(localizedContent.enBodyHtml(), article.getEnBody()));

        return ExternalArticle.builder()
            .sourceKey(article.getSourceKey())
            .sourceUrl(article.getSourceUrl())
            .type(article.getType())
            .title(article.getTitle())
            .summary(article.getSummary())
            .coverUrl(article.getCoverUrl())
            .body(article.getBody())
            .originalLocale(detectedLocale)
            .zhTitle(normalizeText(orElse(localizedContent.zhTitle(), article.getZhTitle())))
            .zhSummary(truncate(normalizeText(orElse(localizedContent.zhSummary(), article.getZhSummary())), maxSummaryChars))
            .zhBody(hasText(zhBody) ? zhBody : article.getZhBody())
            .enTitle(normalizeText(orElse(localizedContent.enTitle(), article.getEnTitle())))
            .enSummary(truncate(normalizeText(orElse(localizedContent.enSummary(), article.getEnSummary())), maxSummaryChars))
            .enBody(hasText(enBody) ? enBody : article.getEnBody())
            .publishedAt(article.getPublishedAt())
            .build();
    }

    private ExternalArticle seedLocalizedFields(ExternalArticle article) {
        String originalLocale = inferLocale(article.getTitle(), article.getSummary(), article.getBody());
        String title = normalizeText(article.getTitle());
        String summary = truncate(normalizeText(article.getSummary()), maxSummaryChars);
        String body = article.getBody();

        ExternalArticle.ExternalArticleBuilder builder = ExternalArticle.builder()
            .sourceKey(article.getSourceKey())
            .sourceUrl(article.getSourceUrl())
            .type(article.getType())
            .title(title)
            .summary(summary)
            .coverUrl(article.getCoverUrl())
            .body(body)
            .originalLocale(originalLocale)
            .publishedAt(article.getPublishedAt());

        if ("zh".equals(originalLocale)) {
            builder
                .zhTitle(title)
                .zhSummary(summary)
                .zhBody(body);
        } else {
            builder
                .enTitle(title)
                .enSummary(summary)
                .enBody(body);
        }
        return builder.build();
    }

    private String inferLocale(String title, String summary, String body) {
        String sample = (orElse(title, "") + " " + orElse(summary, "") + " " + orElse(body, ""));
        return containsChinese(sample) ? "zh" : "en";
    }

    private boolean containsChinese(String value) {
        if (!hasText(value)) {
            return false;
        }
        for (int i = 0; i < value.length(); i++) {
            Character.UnicodeScript script = Character.UnicodeScript.of(value.charAt(i));
            if (script == Character.UnicodeScript.HAN) {
                return true;
            }
        }
        return false;
    }

    private String normalizeLocale(String locale) {
        if (!hasText(locale)) {
            return null;
        }
        String normalized = locale.trim().toLowerCase();
        if (normalized.startsWith("zh")) {
            return "zh";
        }
        if (normalized.startsWith("en")) {
            return "en";
        }
        return null;
    }

    private String stripJsonFence(String content) {
        String value = content.trim();
        if (value.startsWith("```")) {
            value = value.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
        }
        return value;
    }

    private String sanitizePromptValue(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\u0000", "").trim();
    }

    private String truncate(String value, int maxLength) {
        if (!hasText(value)) {
            return value;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private String normalizeText(String value) {
        if (!hasText(value)) {
            return value;
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private String orElse(String value, String fallback) {
        return hasText(value) ? value : fallback;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private record CleanedContent(String title, String summary, String bodyHtml) {
    }

    private record LocalizedContent(
        String detectedLocale,
        String zhTitle,
        String zhSummary,
        String zhBodyHtml,
        String enTitle,
        String enSummary,
        String enBodyHtml
    ) {
    }
}
