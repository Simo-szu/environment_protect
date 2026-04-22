package com.youthloop.ingestion.infrastructure.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * HTTP client for official national carbon market JSON endpoints.
 */
@Component
@RequiredArgsConstructor
public class CarbonMarketSourceClient extends BaseWebSourceClient {

    public static final String REALTIME_BASE_URL = "https://www.cneeex.com/zhhq/";
    public static final String REALTIME_QUOTE_PAGE_URL = "https://www.cneeex.com/zhhq/quotshown.html";
    public static final String SITE_HOME_URL = "https://www.cneeex.com/";
    public static final String PROD_INFO_URL = "https://www.cneeex.com/zhhq/jsonData/prodinf.json";
    public static final String INTRADAY_URL = "https://www.cneeex.com/zhhq/jsonData/kline.json";
    public static final String DAILY_KLINE_URL = "https://www.cneeex.com/zhhq/jsonData/hiskline.json";
    public static final String DAILY_OVERVIEW_URL = "https://shyx.cneeex.com/assets/json/dailyov.json";
    public static final String ECO_TRANSACTION_DYNAMICS_URL = "https://www.eco.gov.cn/subclass/transaction_dynamics.html";

    private static final Pattern DAILY_PRICE_PATTERN = Pattern.compile(
        "开盘价([0-9.,]+)元/吨，最高价([0-9.,]+)元/吨，最低价([0-9.,]+)元/吨，收盘价([0-9.,]+)元/吨，收盘价较前一日(上涨|下跌)([0-9.,]+)%"
    );
    private static final Pattern DAILY_TOTAL_PATTERN = Pattern.compile(
        "今日全国碳排放配额总成交量([0-9,]+)吨，总成交额([0-9.,]+)元"
    );
    private static final Pattern CUMULATIVE_TOTAL_PATTERN = Pattern.compile(
        "截至([0-9]{4})年([0-9]{1,2})月([0-9]{1,2})日，全国碳市场碳排放配额累计成交量([0-9,]+)吨，累计成交额([0-9.,]+)元"
    );

    private final ObjectMapper objectMapper;

    public JsonNode fetchJson(String url) throws IOException, InterruptedException {
        Connection.Response response = Jsoup.connect(url)
            .timeout((int) Duration.ofSeconds(8).toMillis())
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                + "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
            .header("Accept", "application/json,text/plain,*/*")
            .header("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
            .header("Referer", REALTIME_QUOTE_PAGE_URL)
            .header("Origin", SITE_HOME_URL.substring(0, SITE_HOME_URL.length() - 1))
            .ignoreContentType(true)
            .method(Connection.Method.GET)
            .execute();
        if (response.statusCode() >= 400) {
            throw new IOException("Carbon market source request failed for " + url + " with status " + response.statusCode());
        }
        return objectMapper.readTree(response.body());
    }

    public DailyArticleSnapshot fetchLatestDailyArticleSnapshot() throws IOException {
        Document listDocument = fetchDocument(ECO_TRANSACTION_DYNAMICS_URL, (int) Duration.ofSeconds(8).toMillis());
        Element latestArticleLink = listDocument.select("a[href]")
            .stream()
            .filter(element -> {
                String text = element.text();
                String href = element.attr("href");
                return text.contains("全国碳市场每日综合价格行情及成交信息")
                    && text.contains("CEA")
                    && href.contains("/news_info/");
            })
            .findFirst()
            .orElseThrow(() -> new IOException("No latest official carbon market daily article link found"));

        String articleUrl = latestArticleLink.absUrl("href");
        if (articleUrl == null || articleUrl.isBlank()) {
            throw new IOException("Latest official carbon market daily article URL is empty");
        }

        Document articleDocument = fetchDocument(articleUrl, (int) Duration.ofSeconds(8).toMillis());
        String content = articleDocument.text();

        Matcher dailyPriceMatcher = DAILY_PRICE_PATTERN.matcher(content);
        if (!dailyPriceMatcher.find()) {
            throw new IOException("Official carbon market daily article price section is missing");
        }

        Matcher dailyTotalMatcher = DAILY_TOTAL_PATTERN.matcher(content);
        if (!dailyTotalMatcher.find()) {
            throw new IOException("Official carbon market daily article total section is missing");
        }

        Matcher cumulativeTotalMatcher = CUMULATIVE_TOTAL_PATTERN.matcher(content);
        if (!cumulativeTotalMatcher.find()) {
            throw new IOException("Official carbon market daily article cumulative section is missing");
        }

        LocalDate tradeDate = LocalDate.of(
            Integer.parseInt(cumulativeTotalMatcher.group(1)),
            Integer.parseInt(cumulativeTotalMatcher.group(2)),
            Integer.parseInt(cumulativeTotalMatcher.group(3))
        );

        String publishedText = articleDocument.text().contains("发布时间：")
            ? articleDocument.text().substring(articleDocument.text().indexOf("发布时间："))
            : null;
        LocalDateTime publishedAt = parsePublishedAt(publishedText, tradeDate);

        return new DailyArticleSnapshot(
            articleUrl,
            tradeDate,
            LocalTime.of(15, 0),
            decimalOf(dailyPriceMatcher.group(1)),
            decimalOf(dailyPriceMatcher.group(2)),
            decimalOf(dailyPriceMatcher.group(3)),
            decimalOf(dailyPriceMatcher.group(4)),
            signedPercentOf(dailyPriceMatcher.group(5), dailyPriceMatcher.group(6)),
            longOf(dailyTotalMatcher.group(1)),
            decimalOf(dailyTotalMatcher.group(2)),
            longOf(cumulativeTotalMatcher.group(4)),
            decimalOf(cumulativeTotalMatcher.group(5)),
            publishedAt
        );
    }

    private LocalDateTime parsePublishedAt(String publishedText, LocalDate tradeDate) {
        if (publishedText == null || publishedText.isBlank()) {
            return tradeDate.atTime(18, 0);
        }
        Matcher matcher = Pattern.compile("发布时间：([0-9]{4}-[0-9]{2}-[0-9]{2})").matcher(publishedText);
        if (!matcher.find()) {
            return tradeDate.atTime(18, 0);
        }
        return LocalDate.parse(matcher.group(1), DateTimeFormatter.ISO_LOCAL_DATE).atTime(18, 0);
    }

    private java.math.BigDecimal decimalOf(String value) {
        return new java.math.BigDecimal(value.replace(",", "").trim());
    }

    private Long longOf(String value) {
        return Long.parseLong(value.replace(",", "").trim());
    }

    private java.math.BigDecimal signedPercentOf(String direction, String value) {
        java.math.BigDecimal percent = decimalOf(value);
        return "下跌".equals(direction) ? percent.negate() : percent;
    }

    @Value
    public static class DailyArticleSnapshot {
        String sourceUrl;
        LocalDate tradeDate;
        LocalTime quoteTime;
        java.math.BigDecimal openPrice;
        java.math.BigDecimal highPrice;
        java.math.BigDecimal lowPrice;
        java.math.BigDecimal closePrice;
        java.math.BigDecimal changePercent;
        Long dailyVolume;
        java.math.BigDecimal dailyTurnover;
        Long cumulativeVolume;
        java.math.BigDecimal cumulativeTurnover;
        LocalDateTime publishedAt;
    }
}
