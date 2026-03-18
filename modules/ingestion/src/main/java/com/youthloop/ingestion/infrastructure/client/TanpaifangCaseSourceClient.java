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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Source client for Tanpaifang case/news pages.
 */
@Slf4j
@Component
public class TanpaifangCaseSourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "tanpaifang_cases";
    private static final String START_URL = "http://www.tanpaifang.com/ditanhuanbao/";
    private static final Pattern DATE_PATTERN =
        Pattern.compile("(\\d{4}-\\d{2}-\\d{2}(?:\\s+\\d{2}:\\d{2}(?::\\d{2})?)?)");
    private static final Pattern SOURCE_PATTERN =
        Pattern.compile("(?:Source|\\u6765\\u6e90|\\u6587\\u7ae0\\u6765\\u6e90)\\s*[:\\uff1a]\\s*([^\\s<|\\u3000]+)");
    private static final int CONTENT_TYPE_DYNAMIC = 2;

    private final HtmlSanitizerService htmlSanitizerService;

    public TanpaifangCaseSourceClient(HtmlSanitizerService htmlSanitizerService) {
        this.htmlSanitizerService = htmlSanitizerService;
    }

    @Override
    public String sourceKey() {
        return SOURCE_KEY;
    }

    @Override
    public List<ExternalArticle> fetchLatest(int maxPages, int maxArticles, int requestTimeoutMs, long requestIntervalMs) {
        Set<String> detailUrls = new LinkedHashSet<>();
        String currentUrl = START_URL;
        int page = 1;
        while (currentUrl != null && page <= maxPages && detailUrls.size() < maxArticles) {
            try {
                Document document = fetchDocument(currentUrl, requestTimeoutMs);
                var links = document.select("h1 a.title[href], a[href*='/ditanhuanbao/'][href$='.html']");
                for (Element link : links) {
                    String href = normalizeUrl(link.absUrl("href"));
                    if (isValidDetailUrl(href)) {
                        detailUrls.add(href);
                        if (detailUrls.size() >= maxArticles) {
                            break;
                        }
                    }
                }
                currentUrl = nextPageUrl(document);
            } catch (IOException e) {
                log.warn("Fetch tanpaifang list failed, url={}", currentUrl, e);
                break;
            }
            page++;
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
                log.warn("Fetch tanpaifang detail failed, url={}", detailUrl, e);
            }
            sleepBetweenRequests(requestIntervalMs);
        }
        return articles;
    }

    private ExternalArticle fetchDetail(String detailUrl, int requestTimeoutMs) throws IOException {
        Document document = fetchDocument(detailUrl, requestTimeoutMs);
        String title = firstText(document, ".wenzhang_title h1, h1");
        Element bodyNode = document.selectFirst("#w_content, .wenzhang_box#w_content");
        if (title == null || bodyNode == null) {
            return null;
        }

        bodyNode.select("script, style, noscript").remove();
        String bodyHtml = htmlSanitizerService.sanitize(bodyNode.html());
        if (bodyHtml.isBlank()) {
            return null;
        }

        String summary = firstText(bodyNode, "p");
        String coverUrl = firstAttr(bodyNode, "img[src]", "abs:src");
        String meta = firstText(document, ".man_ll");
        LocalDateTime publishedAt = parsePublishedAt(meta);
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
        String source = parseSource(meta);
        if (source != null && !source.isBlank()) {
            bodyHtml = bodyHtml + "<p><strong>Source:</strong> " + source + "</p>";
        }

        return ExternalArticle.builder()
            .sourceKey(SOURCE_KEY)
            .sourceUrl(normalizeUrl(detailUrl))
            .type(CONTENT_TYPE_DYNAMIC)
            .title(title)
            .summary(truncateText(summary, 220))
            .coverUrl(coverUrl)
            .body(bodyHtml)
            .publishedAt(publishedAt)
            .build();
    }

    private String nextPageUrl(Document document) {
        Element nextLink = document.selectFirst(".pages a.next[href], .page a.next[href], a.next[href]");
        if (nextLink == null) {
            for (Element link : document.select("a[href]")) {
                String text = link.text();
                if (text == null) {
                    continue;
                }
                String normalized = text.trim().toLowerCase();
                if (normalized.contains("next") || text.contains("\u4e0b\u4e00\u9875")) {
                    nextLink = link;
                    break;
                }
            }
        }
        if (nextLink == null) {
            return null;
        }
        String next = normalizeUrl(nextLink.absUrl("href"));
        return next != null && !next.isBlank() ? next : null;
    }

    private LocalDateTime parsePublishedAt(String meta) {
        if (meta == null) {
            return null;
        }
        Matcher matcher = DATE_PATTERN.matcher(meta);
        if (!matcher.find()) {
            return null;
        }
        return parseDateTime(matcher.group(1));
    }

    private String parseSource(String meta) {
        if (meta == null) {
            return null;
        }
        Matcher matcher = SOURCE_PATTERN.matcher(meta);
        if (!matcher.find()) {
            return null;
        }
        return matcher.group(1).trim();
    }

    private boolean isValidDetailUrl(String url) {
        return url != null
            && url.startsWith("http://www.tanpaifang.com/ditanhuanbao/")
            && url.endsWith(".html");
    }
}
