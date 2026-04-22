package com.youthloop.ingestion.infrastructure.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * HTTP client for official national carbon market JSON endpoints.
 */
@Component
@RequiredArgsConstructor
public class CarbonMarketSourceClient {

    public static final String REALTIME_BASE_URL = "https://www.cneeex.com/zhhq/";
    public static final String PROD_INFO_URL = "https://www.cneeex.com/zhhq/jsonData/prodinf.json";
    public static final String INTRADAY_URL = "https://www.cneeex.com/zhhq/jsonData/kline.json";
    public static final String DAILY_KLINE_URL = "https://www.cneeex.com/zhhq/jsonData/hiskline.json";
    public static final String DAILY_OVERVIEW_URL = "https://shyx.cneeex.com/assets/json/dailyov.json";

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

    public JsonNode fetchJson(String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(15))
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                + "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
            .header("Accept", "application/json,text/plain,*/*")
            .header("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
            .header("Referer", REALTIME_BASE_URL)
            .GET()
            .build();

        HttpResponse<String> response = httpClient.send(
            request,
            HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
        );
        if (response.statusCode() >= 400) {
            throw new IOException("Unexpected status code: " + response.statusCode());
        }
        return objectMapper.readTree(response.body());
    }
}
