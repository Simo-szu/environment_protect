package com.youthloop.ingestion.infrastructure.client;

import com.youthloop.ingestion.application.dto.ExternalArticle;
import com.youthloop.ingestion.application.service.ContentSourceClient;
import com.youthloop.ingestion.application.service.HtmlSanitizerService;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Source client for OWID data-news page.
 */
@Slf4j
@Component
public class OwidDataNewsSourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "owid_data_news";
    private static final String DATA_NEWS_FEED_URL = "https://ourworldindata.org/atom-data-insights.xml";
    private static final int CONTENT_TYPE_NEWS = 1;

    private final HtmlSanitizerService htmlSanitizerService;

    public OwidDataNewsSourceClient(HtmlSanitizerService htmlSanitizerService) {
        this.htmlSanitizerService = htmlSanitizerService;
    }

    @Override
    public String sourceKey() {
        return SOURCE_KEY;
    }

    @Override
    public List<ExternalArticle> fetchLatest(int maxPages, int maxArticles, int requestTimeoutMs, long requestIntervalMs) {
        List<ExternalArticle> articles = new ArrayList<>();
        try {
            Document feed = fetchDocument(DATA_NEWS_FEED_URL, requestTimeoutMs);
            var entries = feed.select("entry");
            log.debug("OWID feed parsed: entries={}", entries.size());

            for (Element entry : entries) {
                if (articles.size() >= maxArticles) {
                    break;
                }
                ExternalArticle article = parseEntry(entry);
                if (article != null) {
                    articles.add(article);
                }
            }
        } catch (IOException e) {
            log.warn("Fetch OWID data news failed, url={}", DATA_NEWS_FEED_URL, e);
        }
        return articles;
    }

    private ExternalArticle parseEntry(Element entry) {
        String title = firstText(entry, "title");
        if (title == null || title.isBlank()) {
            return null;
        }

        String sourceUrl = firstAttr(entry, "link[rel=alternate]", "href");
        if (sourceUrl == null || sourceUrl.isBlank()) {
            sourceUrl = firstText(entry, "id");
        }
        if (sourceUrl == null || sourceUrl.isBlank()) {
            return null;
        }

        String rawContent = firstText(entry, "content");
        String bodyHtml = "";
        String summary = null;
        String coverUrl = null;
        if (rawContent != null && !rawContent.isBlank()) {
            Document contentDoc = Jsoup.parse(rawContent);
            Element bodyNode = contentDoc.body();
            bodyNode.select("script, style, noscript").remove();
            bodyHtml = htmlSanitizerService.sanitize(bodyNode.html());
            summary = firstText(bodyNode, "p");
            coverUrl = firstAttr(bodyNode, "img", "src");
        }

        if (bodyHtml.isBlank()) {
            bodyHtml = "<p>" + title + "</p>"
                + "<p><a href=\"" + sourceUrl + "\">Read the full story</a></p>";
        }
        if (summary == null || summary.isBlank()) {
            summary = "Data insight from Our World in Data.";
        }

        LocalDateTime publishedAt = parseDateTime(firstText(entry, "published"));
        if (publishedAt == null) {
            publishedAt = parseDateTime(firstText(entry, "updated"));
        }
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }

        return ExternalArticle.builder()
            .sourceKey(SOURCE_KEY)
            .sourceUrl(sourceUrl)
            .type(CONTENT_TYPE_NEWS)
            .title(title)
            .summary(truncateText(summary, 220))
            .coverUrl(coverUrl)
            .body(bodyHtml)
            .publishedAt(publishedAt)
            .build();
    }
}
