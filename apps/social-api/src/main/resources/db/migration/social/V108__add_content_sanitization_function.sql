-- Add function to sanitize crawled content HTML in database
-- This is a one-time cleanup for existing dirty data

CREATE OR REPLACE FUNCTION social.sanitize_content_body(raw_html TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned_html TEXT;
BEGIN
    -- Basic HTML cleaning using regex patterns
    -- Remove common unwanted elements and attributes
    cleaned_html := raw_html;

    -- Remove script, style, noscript tags
    cleaned_html := regexp_replace(cleaned_html, '<script[^>]*>.*?</script>', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '<style[^>]*>.*?</style>', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '<noscript[^>]*>.*?</noscript>', '', 'gi');

    -- Remove class, id, style attributes
    cleaned_html := regexp_replace(cleaned_html, '\s+class="[^"]*"', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '\s+id="[^"]*"', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '\s+style="[^"]*"', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '\s+data-[a-z-]*="[^"]*"', '', 'gi');

    -- Remove common unwanted div elements
    cleaned_html := regexp_replace(cleaned_html, '<div[^>]*class="[^"]*wpcom_myimg_wrap[^"]*"[^>]*>.*?</div>', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '<div[^>]*class="[^"]*entry-action[^"]*"[^>]*>.*?</div>', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '<div[^>]*class="[^"]*entry-bar[^"]*"[^>]*>.*?</div>', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '<div[^>]*class="[^"]*entry-page[^"]*"[^>]*>.*?</div>', '', 'gi');
    cleaned_html := regexp_replace(cleaned_html, '<div[^>]*class="[^"]*entry-related[^"]*"[^>]*>.*?</div>', '', 'gi');

    RETURN cleaned_html;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment
COMMENT ON FUNCTION social.sanitize_content_body IS 'Sanitize HTML content by removing scripts, styles, classes, and unwanted elements';
