package com.youthloop.ingestion.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for HtmlSanitizerService.
 */
class HtmlSanitizerServiceTest {

    private HtmlSanitizerService htmlSanitizerService;

    @BeforeEach
    void setUp() {
        htmlSanitizerService = new HtmlSanitizerService();
    }

    @Test
    void shouldRemoveScriptsAndStyles() {
        String dirtyHtml = """
            <div>
                <script>alert('xss')</script>
                <style>.test { color: red; }</style>
                <p>Clean content</p>
            </div>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        assertThat(cleaned).doesNotContain("<script>");
        assertThat(cleaned).doesNotContain("<style>");
        assertThat(cleaned).contains("Clean content");
    }

    @Test
    void shouldRemoveAdsAndShareButtons() {
        String dirtyHtml = """
            <div class="entry-content">
                <div class="wpcom_myimg_wrap">
                    <a href="ad-link"><img src="ad.jpg"></a>
                </div>
                <p>Article content here</p>
                <div class="entry-action">
                    <div class="btn-zan">Like</div>
                </div>
                <div class="entry-bar">
                    <a class="j-mobile-share">Share</a>
                </div>
            </div>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        assertThat(cleaned).doesNotContain("wpcom_myimg_wrap");
        assertThat(cleaned).doesNotContain("entry-action");
        assertThat(cleaned).doesNotContain("btn-zan");
        assertThat(cleaned).doesNotContain("entry-bar");
        assertThat(cleaned).contains("Article content here");
    }

    @Test
    void shouldRemoveClassAndIdAttributes() {
        String dirtyHtml = """
            <div class="wrapper" id="main">
                <p class="text" id="para">Content</p>
            </div>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        assertThat(cleaned).doesNotContain("class=");
        assertThat(cleaned).doesNotContain("id=");
        assertThat(cleaned).contains("Content");
    }

    @Test
    void shouldPreserveBasicTextFormatting() {
        String dirtyHtml = """
            <p>Regular text</p>
            <p><strong>Bold text</strong></p>
            <p><em>Italic text</em></p>
            <p><a href="https://example.com">Link text</a></p>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        assertThat(cleaned).contains("<p>Regular text</p>");
        assertThat(cleaned).contains("<strong>Bold text</strong>");
        assertThat(cleaned).contains("<em>Italic text</em>");
        assertThat(cleaned).contains("<a href=\"https://example.com\">Link text</a>");
    }

    @Test
    void shouldPreserveImages() {
        String dirtyHtml = """
            <p>Text before image</p>
            <img src="https://example.com/image.jpg" alt="Test image" class="lazy" data-original="other.jpg">
            <p>Text after image</p>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        assertThat(cleaned).contains("<img");
        assertThat(cleaned).contains("src=\"https://example.com/image.jpg\"");
        assertThat(cleaned).contains("alt=\"Test image\"");
        assertThat(cleaned).doesNotContain("class=");
        assertThat(cleaned).doesNotContain("data-original");
    }

    @Test
    void shouldPreserveHeadings() {
        String dirtyHtml = """
            <h1 class="title">Heading 1</h1>
            <h2 id="section">Heading 2</h2>
            <h3>Heading 3</h3>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        assertThat(cleaned).contains("<h1>Heading 1</h1>");
        assertThat(cleaned).contains("<h2>Heading 2</h2>");
        assertThat(cleaned).contains("<h3>Heading 3</h3>");
        assertThat(cleaned).doesNotContain("class=");
        assertThat(cleaned).doesNotContain("id=");
    }

    @Test
    void shouldPreserveLists() {
        String dirtyHtml = """
            <ul class="list">
                <li>Item 1</li>
                <li>Item 2</li>
            </ul>
            <ol class="numbered">
                <li>First</li>
                <li>Second</li>
            </ol>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        assertThat(cleaned).contains("<ul>");
        assertThat(cleaned).contains("<ol>");
        assertThat(cleaned).contains("<li>Item 1</li>");
        assertThat(cleaned).contains("<li>First</li>");
        assertThat(cleaned).doesNotContain("class=");
    }

    @Test
    void shouldRemoveNavigationAndRelatedContent() {
        String dirtyHtml = """
            <div class="entry-content">
                <p>Main content</p>
            </div>
            <div class="entry-page">
                <div class="entry-page-prev">Previous article</div>
                <div class="entry-page-next">Next article</div>
            </div>
            <div class="entry-related-posts">
                <h3>Related posts</h3>
            </div>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        assertThat(cleaned).contains("Main content");
        assertThat(cleaned).doesNotContain("entry-page");
        assertThat(cleaned).doesNotContain("Previous article");
        assertThat(cleaned).doesNotContain("Related posts");
    }

    @Test
    void shouldHandleEmptyInput() {
        assertThat(htmlSanitizerService.sanitize(null)).isEmpty();
        assertThat(htmlSanitizerService.sanitize("")).isEmpty();
        assertThat(htmlSanitizerService.sanitize("   ")).isEmpty();
    }

    @Test
    void shouldHandleComplexRealWorldExample() {
        String dirtyHtml = """
            <div class="entry-main">
                <div class="wpcom_myimg_wrap __single_0">
                    <a href="ad-link"><img src="ad.jpg"></a>
                </div>
                <div class="entry-head">
                    <h1 class="entry-title">World Meteorological Day</h1>
                    <div class="entry-info">
                        <time datetime="2024-09-25T10:17:58+08:00">2024-09-25</time>
                    </div>
                </div>
                <div class="entry-content">
                    <article>
                        <p class="contentFont">World Meteorological Day is celebrated on March 23.</p>
                        <p class="contentImage">
                            <img class="j-lazy" src="lazy.png" data-original="real-image.jpg" alt="Weather">
                        </p>
                    </article>
                </div>
                <div class="entry-action">
                    <div class="btn-zan">Like (0)</div>
                </div>
                <div class="entry-bar">
                    <div class="info-item share">
                        <a class="j-mobile-share">Share</a>
                    </div>
                </div>
            </div>
            """;

        String cleaned = htmlSanitizerService.sanitize(dirtyHtml);

        // Should contain clean content
        assertThat(cleaned).contains("World Meteorological Day is celebrated on March 23");
        assertThat(cleaned).contains("<img");

        // Should NOT contain unwanted elements
        assertThat(cleaned).doesNotContain("wpcom_myimg_wrap");
        assertThat(cleaned).doesNotContain("entry-head");
        assertThat(cleaned).doesNotContain("entry-action");
        assertThat(cleaned).doesNotContain("btn-zan");
        assertThat(cleaned).doesNotContain("entry-bar");
        assertThat(cleaned).doesNotContain("j-mobile-share");

        // Should NOT contain attributes
        assertThat(cleaned).doesNotContain("class=");
        assertThat(cleaned).doesNotContain("data-original");
    }
}
