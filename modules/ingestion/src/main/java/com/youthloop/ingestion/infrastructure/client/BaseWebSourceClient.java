package com.youthloop.ingestion.infrastructure.client;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

/**
 * Shared HTTP/parse helpers for web source clients.
 */
@Slf4j
public abstract class BaseWebSourceClient {

    protected Document fetchDocument(String url, int requestTimeoutMs) throws IOException {
        return Jsoup.connect(url)
            .timeout(requestTimeoutMs)
            .userAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            )
            .referrer("https://www.google.com/")
            .get();
    }

    protected void sleepBetweenRequests(long intervalMs) {
        if (intervalMs <= 0) {
            return;
        }
        try {
            Thread.sleep(intervalMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    protected String normalizeUrl(String url) {
        if (url == null) {
            return null;
        }
        String normalized = url.trim();
        int hashIndex = normalized.indexOf('#');
        if (hashIndex >= 0) {
            normalized = normalized.substring(0, hashIndex);
        }
        if (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    protected String firstText(Element root, String selectors) {
        if (root == null) {
            return null;
        }
        Element node = root.selectFirst(selectors);
        return node != null ? node.text().trim() : null;
    }

    protected String firstAttr(Element root, String selectors, String attr) {
        if (root == null) {
            return null;
        }
        Element node = root.selectFirst(selectors);
        if (node == null) {
            return null;
        }
        String value = node.attr(attr);
        return value != null ? value.trim() : null;
    }

    protected String truncateText(String text, int maxLength) {
        if (text == null) {
            return null;
        }
        String normalized = text.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= maxLength) {
            return normalized;
        }
        return normalized.substring(0, maxLength);
    }

    protected LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String raw = value.trim();
        try {
            return OffsetDateTime.parse(raw).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }
        try {
            return ZonedDateTime.parse(raw).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(raw, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException ignored) {
        }

        List<DateTimeFormatter> localDateTimeFormatters = List.of(
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm"),
            DateTimeFormatter.ofPattern("yyyy年M月d日 HH:mm")
        );
        for (DateTimeFormatter formatter : localDateTimeFormatters) {
            try {
                return LocalDateTime.parse(raw, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        List<DateTimeFormatter> localDateFormatters = List.of(
            DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("yyyy年M月d日"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd")
        );
        for (DateTimeFormatter formatter : localDateFormatters) {
            try {
                return LocalDate.parse(raw, formatter).atStartOfDay();
            } catch (DateTimeParseException ignored) {
            }
        }

        log.debug("Failed to parse datetime: {}", raw);
        return null;
    }
}
