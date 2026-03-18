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
 * Source client for Kepuchina green-carbon wiki channel.
 */
@Slf4j
@Component
public class KepuchinaWikiSourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "kepuchina_wiki";
    private static final String LIST_URL_TEMPLATE =
        "https://cloud.kepuchina.cn/homePage/kphIndex?id=315&type=1&page=%d";
    private static final Pattern ID_PATTERN = Pattern.compile("[?&]id=(\\d+)");
    private static final Pattern DATE_PATTERN = Pattern.compile("(\\d{4}-\\d{2}-\\d{2})");
    private static final Pattern SOURCE_PATTERN =
        Pattern.compile("(?:Source|\\u6765\\u6e90|\\u93c9\\u6bbe\\u6e90)\\s*[:\\uff1a]\\s*([^\\s|\\u3000]+)");
    private static final int CONTENT_TYPE_WIKI = 4;

    private final HtmlSanitizerService htmlSanitizerService;

    public KepuchinaWikiSourceClient(HtmlSanitizerService htmlSanitizerService) {
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
            String listUrl = String.format(LIST_URL_TEMPLATE, page);
            try {
                Document document = fetchDocument(listUrl, requestTimeoutMs);
                var links = document.select("div.list-block._blockParma a._title[href], a[href*='/newSearch/imgText?id=']");
                for (Element link : links) {
                    String href = normalizeUrl(link.absUrl("href"));
                    if (isValidDetailUrl(href)) {
                        detailUrls.add(href);
                        if (detailUrls.size() >= maxArticles) {
                            break;
                        }
                    }
                }
            } catch (IOException e) {
                log.warn("Fetch kepuchina list failed, url={}", listUrl, e);
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
                log.warn("Fetch kepuchina detail failed, url={}", detailUrl, e);
            }
            sleepBetweenRequests(requestIntervalMs);
        }
        return articles;
    }

    private ExternalArticle fetchDetail(String detailUrl, int requestTimeoutMs) throws IOException {
        Document document = fetchDocument(detailUrl, requestTimeoutMs);
        String title = firstText(document, "h1, h2._title, ._title, .article-title");
        Element bodyNode = document.selectFirst("#content, .__imgtext-content, #article, .content#article");
        if (title == null || title.isBlank() || bodyNode == null) {
            log.debug("Skip kepuchina detail due missing title/body, url={}", detailUrl);
            return null;
        }

        bodyNode.select("script, style, noscript").remove();
        String bodyHtml = htmlSanitizerService.sanitize(bodyNode.html());
        if (bodyHtml.isBlank()) {
            return null;
        }

        String summary = firstText(bodyNode, "p");
        if (summary == null || summary.isBlank()) {
            summary = firstAttr(document, "meta[name='Description'], meta[name='description']", "content");
        }
        String coverUrl = firstAttr(bodyNode, "img[src]", "abs:src");
        String source = parseSource(document);
        LocalDateTime publishedAt = parseUploadedAt(document);
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }

        if (source != null && !source.isBlank()) {
            bodyHtml = bodyHtml + "<p><strong>Source:</strong> " + source + "</p>";
        }

        return ExternalArticle.builder()
            .sourceKey(SOURCE_KEY)
            .sourceUrl(canonicalDetailUrl(detailUrl))
            .type(CONTENT_TYPE_WIKI)
            .title(title)
            .summary(truncateText(summary, 220))
            .coverUrl(coverUrl)
            .body(bodyHtml)
            .publishedAt(publishedAt)
            .build();
    }

    private LocalDateTime parseUploadedAt(Document document) {
        String uploaded = firstText(document, "span._time");
        if (uploaded == null) {
            return null;
        }
        Matcher matcher = DATE_PATTERN.matcher(uploaded);
        if (!matcher.find()) {
            return null;
        }
        return parseDateTime(matcher.group(1));
    }

    private String parseSource(Document document) {
        for (Element p : document.select("p")) {
            String text = p.text();
            if (text == null || text.isBlank()) {
                continue;
            }
            Matcher matcher = SOURCE_PATTERN.matcher(text);
            if (matcher.find()) {
                return matcher.group(1).trim();
            }
        }
        return null;
    }

    private boolean isValidDetailUrl(String url) {
        return url != null
            && url.startsWith("https://cloud.kepuchina.cn/newSearch/imgText")
            && ID_PATTERN.matcher(url).find();
    }

    private String canonicalDetailUrl(String url) {
        Matcher matcher = ID_PATTERN.matcher(url);
        if (!matcher.find()) {
            return url;
        }
        return "https://cloud.kepuchina.cn/newSearch/imgText?id=" + matcher.group(1);
    }
}
