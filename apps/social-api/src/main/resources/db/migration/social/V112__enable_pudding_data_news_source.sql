-- Enable pudding_data_news source that was disabled during initial setup.
UPDATE social.ingestion_source_config
SET is_enabled = true,
    updated_at = now()
WHERE source_key = 'pudding_data_news';
