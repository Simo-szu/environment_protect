package com.youthloop.ingestion.infrastructure.client;

import com.youthloop.ingestion.application.dto.ExternalArticle;
import com.youthloop.ingestion.application.service.ContentSourceClient;
import com.youthloop.ingestion.application.service.HtmlSanitizerService;
import com.youthloop.ingestion.config.IngestionProperties;
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
 * Earth climate change source client.
 */
@Slf4j
@Component
public class EarthClimateSourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "earth";
    private static final String BASE_URL = "https://earth.org/climate-change/";
    private static final int CONTENT_TYPE_NEWS = 1;

    private final HtmlSanitizerService htmlSanitizerService;

    public EarthClimateSourceClient(IngestionProperties properties, HtmlSanitizerService htmlSanitizerService) {
        super(properties);
        this.htmlSanitizerService = htmlSanitizerService;
    }

    @Override
    public String sourceKey() {
        return SOURCE_KEY;
    }

    @Override
    public List<ExternalArticle> fetchLatest(int maxPages, int maxArticles) {
        Set<String> detailUrls = new LinkedHashSet<>();
        for (int page = 1; page <= maxPages && detailUrls.size() < maxArticles; page++) {
            String listUrl = page == 1 ? BASE_URL : BASE_URL + "page/" + page + "/";
            try {
                Document document = fetchDocument(listUrl);
                var articleLinks = document.select("article a[href], .image_article a[href], .hero_article a[href], h2 a[href], h3 a[href]");
                log.debug("Earth list parsed: url={}, articleLinks={}, allLinks={}",
                    listUrl, articleLinks.size(), document.select("a[href]").size());
                boolean fallbackToAllLinks = articleLinks.isEmpty();
                var links = fallbackToAllLinks ? document.select("a[href]") : articleLinks;
                for (Element link : links) {
                    String href = normalizeUrl(link.absUrl("href"));
                    if (isValidDetailUrl(href)) {
                        if (fallbackToAllLinks && !hasEnoughHyphens(href, 3)) {
                            continue;
                        }
                        detailUrls.add(href);
                        if (detailUrls.size() >= maxArticles) {
                            break;
                        }
                    }
                }
            } catch (IOException e) {
                log.warn("Fetch earth list failed, url={}", listUrl, e);
            }
            sleepBetweenRequests();
        }

        List<ExternalArticle> articles = new ArrayList<>();
        for (String detailUrl : detailUrls) {
            try {
                ExternalArticle article = fetchDetail(detailUrl);
                if (article != null) {
                    articles.add(article);
                }
            } catch (Exception e) {
                log.warn("Fetch earth detail failed, url={}", detailUrl, e);
            }
            sleepBetweenRequests();
        }
        return articles;
    }

    private ExternalArticle fetchDetail(String detailUrl) throws IOException {
        ExternalArticle renderedArticle = tryFetchRenderedDetail(detailUrl);
        if (renderedArticle != null) {
            return renderedArticle;
        }
        Document document = fetchDocument(detailUrl);
        return mapDetailDocument(document, detailUrl);
    }

    private ExternalArticle tryFetchRenderedDetail(String detailUrl) {
        String renderedUrl = detailUrl.contains("?")
            ? detailUrl + "&output=1"
            : detailUrl + "/?output=1";
        try {
            Document renderedDocument = fetchDocument(renderedUrl);
            return mapDetailDocument(renderedDocument, detailUrl);
        } catch (IOException e) {
            log.debug("Fetch earth rendered detail failed, url={}", renderedUrl, e);
            return null;
        }
    }

    private ExternalArticle mapDetailDocument(Document document, String detailUrl) {
        String title = firstText(document, "h1.entry-title, h1");

        // Try to select content container, prioritize specific content divs
        // Do NOT fallback to entire article/main elements to avoid grabbing headers/footers
        Element bodyNode = document.selectFirst(".entry-content, .post-content, .single-content");
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
            datetimeRaw = firstText(document, "time, .entry-date, .post-date");
        }
        LocalDateTime publishedAt = parseDateTime(datetimeRaw);
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }

        return ExternalArticle.builder()
            .sourceKey(SOURCE_KEY)
            .sourceUrl(detailUrl)
            .type(CONTENT_TYPE_NEWS)
            .title(title)
            .summary(truncateText(summary, 220))
            .coverUrl(coverUrl)
            .body(cleanedBodyHtml)
            .publishedAt(publishedAt)
            .build();
    }

    private boolean isValidDetailUrl(String url) {
        if (url == null || !url.startsWith("https://earth.org/")) {
            return false;
        }
        if ("https://earth.org/climate-change".equals(url) || "https://earth.org/climate-change/".equals(url)) {
            return false;
        }
        if (url.contains("/tag/") || url.contains("/category/") || url.contains("/author/")) {
            return false;
        }
        if (url.contains("/climate-change/page/")) {
            return false;
        }
        if (url.contains("/wp-json/") || url.contains("/feed/") || url.contains("?")) {
            return false;
        }
        String slug = url.substring("https://earth.org/".length());
        if (slug.isBlank() || slug.contains("/")) {
            return false;
        }
        if (!slug.contains("-")) {
            return false;
        }
        return !Set.of(
            "climate-change",
            "energy",
            "pollution",
            "policy-and-economics",
            "oceans",
            "biodiversity",
            "conservation",
            "solutions",
            "act"
        ).contains(slug);
    }

    private boolean hasEnoughHyphens(String url, int minHyphenCount) {
        String slug = url.substring("https://earth.org/".length());
        int hyphenCount = 0;
        for (char c : slug.toCharArray()) {
            if (c == '-') {
                hyphenCount++;
            }
        }
        return hyphenCount >= minHyphenCount;
    }
}
