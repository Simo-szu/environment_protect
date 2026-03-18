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

    @Value("${ingestion.ai-cleaner.max-input-body-chars:14000}")
    private int maxInputBodyChars;

    @Value("${ingestion.ai-cleaner.max-summary-chars:220}")
    private int maxSummaryChars;

    public ExternalArticle clean(ExternalArticle article) {
        if (!enabled || !hasText(apiKey) || article == null || !hasText(article.getBody())) {
            return article;
        }

        try {
            String responseBody = callAi(article);
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

    private String callAi(ExternalArticle article) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofMillis(connectTimeoutMs))
            .build();

        String userPrompt = buildUserPrompt(article);
        String payload = buildRequestPayload(userPrompt);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(apiUrl))
            .timeout(Duration.ofMillis(readTimeoutMs))
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

    private String buildRequestPayload(String userPrompt) throws IOException {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("messages", objectMapper.createArrayNode()
            .add(objectMapper.createObjectNode()
                .put("role", "system")
                .put("content", SYSTEM_PROMPT))
            .add(objectMapper.createObjectNode()
                .put("role", "user")
                .put("content", userPrompt)));
        payload.put("temperature", 0.1);
        payload.put("max_tokens", 3200);
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
}
