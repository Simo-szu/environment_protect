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
 * Source client for The Pudding stories.
 */
@Slf4j
@Component
public class PuddingDataNewsSourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "pudding_data_news";
    private static final String START_URL = "https://pudding.cool/";
    private static final int CONTENT_TYPE_NEWS = 1;

    private final HtmlSanitizerService htmlSanitizerService;

    public PuddingDataNewsSourceClient(HtmlSanitizerService htmlSanitizerService) {
        this.htmlSanitizerService = htmlSanitizerService;
    }

    @Override
    public String sourceKey() {
        return SOURCE_KEY;
    }

    @Override
    public List<ExternalArticle> fetchLatest(int maxPages, int maxArticles, int requestTimeoutMs, long requestIntervalMs) {
        Set<String> detailUrls = new LinkedHashSet<>();
        try {
            Document document = fetchDocument(START_URL, requestTimeoutMs);
            for (Element link : document.select("a[href]")) {
                String href = normalizeUrl(link.absUrl("href"));
                if (isStoryUrl(href)) {
                    detailUrls.add(href);
                    if (detailUrls.size() >= maxArticles) {
                        break;
                    }
                }
            }
        } catch (IOException e) {
            log.warn("Fetch Pudding list failed, url={}", START_URL, e);
        }

        List<ExternalArticle> articles = new ArrayList<>();
        for (String detailUrl : detailUrls) {
            try {
                ExternalArticle article = fetchDetail(detailUrl, requestTimeoutMs);
                if (article != null) {
                    articles.add(article);
                }
            } catch (Exception e) {
                log.warn("Fetch Pudding detail failed, url={}", detailUrl, e);
            }
            sleepBetweenRequests(requestIntervalMs);
        }
        return articles;
    }

    private ExternalArticle fetchDetail(String detailUrl, int requestTimeoutMs) throws IOException {
        Document document = fetchDocument(detailUrl, requestTimeoutMs);
        String title = firstAttr(document, "meta[property='og:title']", "content");
        if (title == null || title.isBlank()) {
            title = firstText(document, "h1, title");
        }
        if (title == null || title.isBlank()) {
            return null;
        }

        String description = firstAttr(document, "meta[name='description']", "content");
        String coverUrl = firstAttr(document, "meta[property='og:image']", "content");
        String canonical = firstAttr(document, "link[rel='canonical']", "href");
        String sourceUrl = canonical != null && !canonical.isBlank() ? normalizeUrl(canonical) : detailUrl;

        String bodyHtml;
        Element bodyNode = document.selectFirst("article, main, [id='content']");
        if (bodyNode != null) {
            bodyNode.select("script, style, noscript").remove();
            bodyHtml = htmlSanitizerService.sanitize(bodyNode.html());
        } else {
            bodyHtml = "";
        }
        if (bodyHtml.isBlank()) {
            bodyHtml = "<p>" + (description == null ? "Data story from The Pudding." : description) + "</p>"
                + "<p><a href=\"" + sourceUrl + "\">Read the full story</a></p>";
        }

        LocalDateTime publishedAt = parseDateTime(firstAttr(document, "meta[property='article:published_time']", "content"));
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }

        return ExternalArticle.builder()
            .sourceKey(SOURCE_KEY)
            .sourceUrl(sourceUrl)
            .type(CONTENT_TYPE_NEWS)
            .title(title)
            .summary(truncateText(description, 220))
            .coverUrl(coverUrl)
            .body(bodyHtml)
            .publishedAt(publishedAt)
            .build();
    }

    private boolean isStoryUrl(String url) {
        if (url == null || !url.startsWith("https://pudding.cool/")) {
            return false;
        }
        if (url.equals("https://pudding.cool") || url.equals(START_URL.substring(0, START_URL.length() - 1))) {
            return false;
        }
        return !url.contains("/common/")
            && !url.contains("/assets/")
            && !url.endsWith(".js")
            && !url.endsWith(".css")
            && !url.endsWith(".svg")
            && !url.endsWith(".png")
            && !url.endsWith(".jpg")
            && url.split("/").length >= 6;
    }
}
