package com.youthloop.ingestion.infrastructure.client;

import com.youthloop.ingestion.application.dto.ExternalArticle;
import com.youthloop.ingestion.application.service.ContentSourceClient;
import com.youthloop.ingestion.application.service.HtmlSanitizerService;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * EcoEPN wiki source client.
 */
@Slf4j
@Component
public class EcoepnWikiSourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "ecoepn";
    private static final String BASE_URL =
        "https://www.ecoepn.com/?special=%e7%8e%af%e4%bf%9d%e7%99%be%e7%a7%91";
    private static final int CONTENT_TYPE_WIKI = 4;

    private final HtmlSanitizerService htmlSanitizerService;

    public EcoepnWikiSourceClient(HtmlSanitizerService htmlSanitizerService) {
        this.htmlSanitizerService = htmlSanitizerService;
    }

    @Override
    public String sourceKey() {
        return SOURCE_KEY;
    }

    @Override
    public List<ExternalArticle> fetchLatest(int maxPages, int maxArticles, int requestTimeoutMs, long requestIntervalMs) {
        Set<String> detailUrls = new LinkedHashSet<>();
        for (int page = 1; page <= maxPages && detailUrls.size() < maxArticles; page++) {
            String listUrl = page == 1 ? BASE_URL : BASE_URL + "&paged=" + page;
            try {
                Document document = fetchDocument(listUrl, requestTimeoutMs);
                for (Element link : document.select("a[href]")) {
                    String href = normalizeUrl(link.absUrl("href"));
                    if (isValidDetailUrl(href)) {
                        detailUrls.add(href);
                        if (detailUrls.size() >= maxArticles) {
                            break;
                        }
                    }
                }
            } catch (IOException e) {
                log.warn("Fetch ecoepn list failed, url={}", listUrl, e);
            }
            sleepBetweenRequests(requestIntervalMs);
        }

        List<ExternalArticle> articles = new ArrayList<>();
        for (String detailUrl : detailUrls) {
            try {
                ExternalArticle article = fetchDetail(detailUrl, requestTimeoutMs);
                if (article != null) {
                    articles.add(article);
                }
            } catch (Exception e) {
                log.warn("Fetch ecoepn detail failed, url={}", detailUrl, e);
            }
            sleepBetweenRequests(requestIntervalMs);
        }
        return articles;
    }

    private ExternalArticle fetchDetail(String detailUrl, int requestTimeoutMs) throws IOException {
        Document document = fetchDocument(detailUrl, requestTimeoutMs);
        String title = firstText(document, "h1.entry-title, h1");

        // Try to select .entry-content first, then fallback to .post-content
        // Do NOT fallback to entire article element to avoid grabbing headers/footers
        Element bodyNode = document.selectFirst(".entry-content, .post-content");
        if (title == null || bodyNode == null) {
            return null;
        }

        bodyNode.select("script, style, noscript").remove();
        String bodyHtml = bodyNode.html();
        if (bodyHtml == null || bodyHtml.isBlank()) {
            return null;
        }

        // Sanitize HTML content to remove ads, share buttons, and unwanted elements
        String cleanedBodyHtml = htmlSanitizerService.sanitize(bodyHtml);
        if (cleanedBodyHtml.isBlank()) {
            log.warn("Sanitized body is empty for url={}", detailUrl);
            return null;
        }

        String summary = firstAttr(document, "meta[name=description]", "content");
        if (summary == null || summary.isBlank()) {
            summary = firstText(bodyNode, "p");
        }

        String coverUrl = firstAttr(document, "meta[property=og:image]", "content");
        if (coverUrl == null || coverUrl.isBlank()) {
            coverUrl = firstAttr(bodyNode, "img[src]", "abs:src");
        }

        String datetimeRaw = firstAttr(document, "time[datetime]", "datetime");
        if (datetimeRaw == null || datetimeRaw.isBlank()) {
            datetimeRaw = firstText(document, "time, .entry-date, .post-date, .meta-date");
        }
        LocalDateTime publishedAt = parseDateTime(datetimeRaw);
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }

        return ExternalArticle.builder()
            .sourceKey(SOURCE_KEY)
            .sourceUrl(detailUrl)
            .type(CONTENT_TYPE_WIKI)
            .title(title)
            .summary(truncateText(summary, 220))
            .coverUrl(coverUrl)
            .body(cleanedBodyHtml)
            .publishedAt(publishedAt)
            .build();
    }

    private boolean isValidDetailUrl(String url) {
        if (url == null || !url.startsWith("https://www.ecoepn.com/")) {
            return false;
        }
        if (url.contains("special=") || url.contains("page_id=") || url.contains("paged=")) {
            return false;
        }
        return url.contains("?p=") || url.matches(".*/\\d{4}/\\d{2}/.*");
    }
}
