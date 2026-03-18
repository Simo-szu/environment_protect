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
 * Source client for IEA policy pages.
 */
@Slf4j
@Component
public class IeaPolicySourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "iea_policy";
    private static final String BASE_URL = "https://www.iea.org/policies";
    private static final int CONTENT_TYPE_POLICY = 3;

    private final HtmlSanitizerService htmlSanitizerService;

    public IeaPolicySourceClient(HtmlSanitizerService htmlSanitizerService) {
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
            String listUrl = page == 1 ? BASE_URL : BASE_URL + "?page=" + page;
            try {
                Document document = fetchDocument(listUrl, requestTimeoutMs);
                for (Element link : document.select("a[href]")) {
                    String href = normalizeUrl(link.absUrl("href"));
                    if (isPolicyDetailUrl(href)) {
                        detailUrls.add(href);
                        if (detailUrls.size() >= maxArticles) {
                            break;
                        }
                    }
                }
            } catch (IOException e) {
                log.warn("Fetch IEA policy list failed, url={}", listUrl, e);
                break;
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
                log.warn("Fetch IEA policy detail failed, url={}", detailUrl, e);
            }
            sleepBetweenRequests(requestIntervalMs);
        }
        return articles;
    }

    private ExternalArticle fetchDetail(String detailUrl, int requestTimeoutMs) throws IOException {
        Document document = fetchDocument(detailUrl, requestTimeoutMs);
        String title = firstText(document, "h1");
        if (title == null || title.isBlank()) {
            title = firstAttr(document, "meta[property='og:title']", "content");
        }
        Element bodyNode = document.selectFirst(
            ".o-policy__content, .m-article__content, .article-content, main article, main .article, .wysiwyg"
        );
        if (title == null || title.isBlank() || bodyNode == null) {
            log.debug("Skip IEA detail due missing title/body, url={}", detailUrl);
            return null;
        }

        bodyNode.select("script, style, noscript").remove();
        String bodyHtml = htmlSanitizerService.sanitize(bodyNode.html());
        if (bodyHtml.isBlank()) {
            return null;
        }

        String summary = firstText(bodyNode, "p, li");
        if (summary == null || summary.isBlank()) {
            summary = firstAttr(document, "meta[name='description']", "content");
        }
        String coverUrl = firstAttr(document, "meta[property='og:image']", "content");
        LocalDateTime publishedAt = parseDateTime(firstAttr(document, "meta[property='article:published_time']", "content"));
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }

        return ExternalArticle.builder()
            .sourceKey(SOURCE_KEY)
            .sourceUrl(normalizeUrl(detailUrl))
            .type(CONTENT_TYPE_POLICY)
            .title(title)
            .summary(truncateText(summary, 220))
            .coverUrl(coverUrl)
            .body(bodyHtml)
            .publishedAt(publishedAt)
            .build();
    }

    private boolean isPolicyDetailUrl(String url) {
        if (url == null || !url.startsWith("https://www.iea.org/policies/")) {
            return false;
        }
        return !url.equals(BASE_URL) && !url.startsWith(BASE_URL + "?");
    }
}
