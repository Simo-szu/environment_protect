package com.youthloop.ingestion.infrastructure.client;

import com.youthloop.ingestion.application.dto.ExternalArticle;
import com.youthloop.ingestion.application.service.ContentSourceClient;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Source client for CTeam enterprise climate action case library.
 */
@Slf4j
@Component
public class CteamCaseSourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "cteam_cases";
    private static final String LIST_URL = "https://www.cteam.org.cn/?page_id=117";
    private static final int CONTENT_TYPE_DYNAMIC = 2;

    @Override
    public String sourceKey() {
        return SOURCE_KEY;
    }

    @Override
    public List<ExternalArticle> fetchLatest(int maxPages, int maxArticles, int requestTimeoutMs, long requestIntervalMs) {
        List<ExternalArticle> articles = new ArrayList<>();
        try {
            Document document = fetchDocument(LIST_URL, requestTimeoutMs);
            for (Element row : document.select("table.cteam-table tbody tr")) {
                var cells = row.select("td");
                if (cells.size() < 6) {
                    continue;
                }
                String year = cells.get(1).text().trim();
                String company = cells.get(2).text().trim();
                String title = cells.get(3).text().trim();
                String direction = cells.get(4).text().trim();
                String downloadUrl = firstAttr(cells.get(5), "a[href]", "abs:href");

                if (title.isBlank()) {
                    continue;
                }
                articles.add(toArticle(year, company, title, direction, downloadUrl));
                if (articles.size() >= maxArticles) {
                    break;
                }
            }
        } catch (IOException e) {
            log.warn("Fetch cteam list failed, url={}", LIST_URL, e);
        }
        return articles;
    }

    private ExternalArticle toArticle(
        String year,
        String company,
        String caseTitle,
        String direction,
        String downloadUrl
    ) {
        LocalDateTime publishedAt = parsePublishedAt(year);
        String sourceUrl = (downloadUrl != null && !downloadUrl.isBlank())
            ? normalizeUrl(downloadUrl)
            : "https://www.cteam.org.cn/?page_id=117&title=" + caseTitle.hashCode();

        String title = caseTitle;
        String summary = String.format("Company: %s | Direction: %s | Year: %s", company, direction, year);
        String body = "<p>Case entry from CTeam climate action library.</p>"
            + "<ul><li><strong>Company:</strong> " + company + "</li>"
            + "<li><strong>Direction:</strong> " + direction + "</li>"
            + "<li><strong>Year:</strong> " + year + "</li></ul>"
            + (downloadUrl == null || downloadUrl.isBlank()
                ? ""
                : "<p><a href=\"" + downloadUrl + "\">Download case PDF</a></p>");

        return ExternalArticle.builder()
            .sourceKey(SOURCE_KEY)
            .sourceUrl(sourceUrl)
            .type(CONTENT_TYPE_DYNAMIC)
            .title(title)
            .summary(summary)
            .body(body)
            .publishedAt(publishedAt)
            .build();
    }

    private LocalDateTime parsePublishedAt(String year) {
        if (year == null || year.isBlank()) {
            return LocalDateTime.now();
        }
        LocalDateTime parsed = parseDateTime(year + "-01-01");
        return parsed != null ? parsed : LocalDateTime.now();
    }
}

