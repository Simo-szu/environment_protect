package com.youthloop.ingestion.infrastructure.client;

import com.youthloop.ingestion.application.dto.ExternalArticle;
import com.youthloop.ingestion.application.service.ContentSourceClient;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Source client for SCEEX international market quotes.
 */
@Slf4j
@Component
public class SceexMarketSourceClient extends BaseWebSourceClient implements ContentSourceClient {

    private static final String SOURCE_KEY = "sceex_market";
    private static final String URL_TEMPLATE =
        "https://ets.sceex.com.cn/history.htm?k=guo_ji_xing_qing&url=mrhq_gj&pageSize=10&pageIndex=%d";
    private static final int CONTENT_TYPE_DYNAMIC = 2;

    @Override
    public String sourceKey() {
        return SOURCE_KEY;
    }

    @Override
    public List<ExternalArticle> fetchLatest(int maxPages, int maxArticles, int requestTimeoutMs, long requestIntervalMs) {
        List<ExternalArticle> articles = new ArrayList<>();
        for (int page = 1; page <= maxPages && articles.size() < maxArticles; page++) {
            String listUrl = String.format(URL_TEMPLATE, page);
            try {
                Document document = fetchDocument(listUrl, requestTimeoutMs);
                for (Element row : document.select("table.tan_every_table tr")) {
                    if (!row.select("th").isEmpty()) {
                        continue;
                    }
                    var cells = row.select("td");
                    if (cells.size() < 4) {
                        continue;
                    }
                    String tradeDate = cells.get(0).text().trim();
                    String exchange = cells.get(1).text().trim();
                    String product = cells.get(2).text().trim();
                    String closePrice = cells.get(3).text().trim();
                    String volume = cells.size() > 4 ? cells.get(4).text().trim() : "-";
                    if (tradeDate.isBlank() || product.isBlank()) {
                        continue;
                    }
                    articles.add(toArticle(tradeDate, exchange, product, closePrice, volume));
                    if (articles.size() >= maxArticles) {
                        break;
                    }
                }
            } catch (IOException e) {
                log.warn("Fetch sceex list failed, url={}", listUrl, e);
            }
            sleepBetweenRequests(requestIntervalMs);
        }
        return articles;
    }

    private ExternalArticle toArticle(
        String tradeDate,
        String exchange,
        String product,
        String closePrice,
        String volume
    ) {
        LocalDateTime publishedAt = parseDateTime(tradeDate);
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
        String sourceUrl = "https://ets.sceex.com.cn/history.htm?k=guo_ji_xing_qing&url=mrhq_gj"
            + "&tradeDate=" + encode(tradeDate)
            + "&product=" + encode(product);

        String title = String.format("International Carbon Market: %s %s", product, tradeDate);
        String summary = String.format(
            "Exchange: %s | Product: %s | Close: %s | Volume: %s",
            exchange, product, closePrice, volume
        );
        String body = "<p>Daily market snapshot from SCEEX international market board.</p>"
            + "<table><thead><tr><th>Trade Date</th><th>Exchange</th><th>Product</th><th>Close</th><th>Volume</th></tr></thead>"
            + "<tbody><tr><td>" + tradeDate + "</td><td>" + exchange + "</td><td>" + product + "</td><td>"
            + closePrice + "</td><td>" + volume + "</td></tr></tbody></table>";

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

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}

