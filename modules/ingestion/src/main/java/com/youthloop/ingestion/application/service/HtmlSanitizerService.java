package com.youthloop.ingestion.application.service;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;

/**
 * HTML sanitizer service that cleans crawled HTML content.
 * Removes unwanted elements, ads, scripts, and preserves only clean article content.
 */
@Slf4j
@Service
public class HtmlSanitizerService {

    private static final Safelist CONTENT_SAFELIST = createContentSafelist();

    /**
     * Clean and sanitize HTML content for safe storage and display.
     *
     * @param rawHtml raw HTML content from crawled source
     * @return cleaned HTML with only essential content elements
     */
    public String sanitize(String rawHtml) {
        if (rawHtml == null || rawHtml.isBlank()) {
            return "";
        }

        try {
            Document doc = Jsoup.parse(rawHtml);

            // Remove unwanted elements
            removeUnwantedElements(doc);

            // Clean attributes and classes
            cleanAttributes(doc);

            // Sanitize with safelist
            String cleaned = Jsoup.clean(doc.body().html(), CONTENT_SAFELIST);

            return cleaned.trim();
        } catch (Exception e) {
            log.warn("Failed to sanitize HTML, returning empty string", e);
            return "";
        }
    }

    /**
     * Remove unwanted elements like ads, share buttons, navigation, etc.
     */
    private void removeUnwantedElements(Document doc) {
        // Remove scripts, styles, noscript
        doc.select("script, style, noscript, iframe").remove();

        // Remove advertisement elements
        doc.select(".wpcom_myimg_wrap, .ad, .ads, .advertisement, [class*='ad-'], [id*='ad-']").remove();
        doc.select("[class*='adv'], [id*='adv'], [class*='sponsor'], [id*='sponsor']").remove();

        // Remove share/social buttons
        doc.select(".share, .social, .entry-action, .btn-zan, .j-heart, .j-mobile-share").remove();
        doc.select("[class*='share'], [class*='social'], [data-share]").remove();

        // Remove navigation elements
        doc.select(".entry-page, .entry-page-prev, .entry-page-next").remove();
        doc.select(".entry-related-posts, .entry-related, .related").remove();

        // Remove header/footer elements within content
        doc.select(".entry-head, .entry-title, .entry-info, .entry-date, .entry-meta").remove();
        doc.select(".entry-bar, .entry-tag, .entry-category, .entry-specials").remove();

        // Remove copyright notices
        doc.select(".entry-copyright, .copyright").remove();

        // Remove lazy load placeholders - process before cleaning attributes
        doc.select("img[data-original]").forEach(img -> {
            String original = img.attr("data-original");
            String currentSrc = img.attr("src");
            // Only replace src if data-original exists and current src is placeholder
            if (!original.isEmpty() && (currentSrc.isEmpty() || currentSrc.contains("lazy"))) {
                img.attr("src", original);
            }
            img.removeAttr("data-original");
        });

        // Remove empty elements
        doc.select("div:empty, span:empty, p:empty").remove();
    }

    /**
     * Clean attributes and classes from elements.
     */
    private void cleanAttributes(Document doc) {
        // Remove all class and id attributes (they reference external styles)
        doc.select("[class], [id]").forEach(element -> {
            element.removeAttr("class");
            element.removeAttr("id");
        });

        // Remove data attributes
        doc.select("[data-href], [data-id], [data-index], [data-width], [data-height]").forEach(element -> {
            element.attributes().asList().removeIf(attr -> attr.getKey().startsWith("data-"));
        });

        // Remove style attributes
        doc.select("[style]").forEach(element -> element.removeAttr("style"));

        // Clean image attributes - keep only src and alt
        doc.select("img").forEach(img -> {
            String src = img.attr("src");
            String alt = img.attr("alt");
            img.clearAttributes();
            if (!src.isEmpty()) {
                img.attr("src", src);
            }
            if (!alt.isEmpty()) {
                img.attr("alt", alt);
            }
        });

        // Clean link attributes - keep only href
        doc.select("a").forEach(link -> {
            String href = link.attr("href");
            link.clearAttributes();
            if (!href.isEmpty()) {
                link.attr("href", href);
            }
        });
    }

    /**
     * Create safelist for allowed HTML elements and attributes.
     */
    private static Safelist createContentSafelist() {
        return new Safelist()
            // Basic text formatting
            .addTags("p", "br", "strong", "b", "em", "i", "u", "del", "ins", "mark", "small", "sub", "sup")

            // Headings
            .addTags("h1", "h2", "h3", "h4", "h5", "h6")

            // Lists
            .addTags("ul", "ol", "li")

            // Links and images
            .addTags("a", "img")
            .addAttributes("a", "href")
            .addAttributes("img", "src", "alt")

            // Block elements
            .addTags("div", "blockquote", "pre", "code")

            // Tables
            .addTags("table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption")

            // Preserve line breaks
            .preserveRelativeLinks(false);
    }
}
