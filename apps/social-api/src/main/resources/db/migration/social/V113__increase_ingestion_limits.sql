-- Increase max_pages and max_articles for all sources to fetch more content.
UPDATE social.ingestion_source_config SET max_pages = 5, max_articles = 80,  updated_at = now() WHERE source_key = 'earth';
UPDATE social.ingestion_source_config SET max_pages = 5, max_articles = 80,  updated_at = now() WHERE source_key = 'ecoepn';
UPDATE social.ingestion_source_config SET max_pages = 5, max_articles = 60,  updated_at = now() WHERE source_key = 'kepuchina_wiki';
UPDATE social.ingestion_source_config SET max_pages = 5, max_articles = 80,  updated_at = now() WHERE source_key = 'inen_co2';
UPDATE social.ingestion_source_config SET max_pages = 6, max_articles = 80,  updated_at = now() WHERE source_key = 'sceex_market';
UPDATE social.ingestion_source_config SET max_pages = 5, max_articles = 80,  updated_at = now() WHERE source_key = 'tanpaifang_cases';
UPDATE social.ingestion_source_config SET max_pages = 3, max_articles = 100, updated_at = now() WHERE source_key = 'cteam_cases';
UPDATE social.ingestion_source_config SET max_pages = 5, max_articles = 60,  updated_at = now() WHERE source_key = 'iea_policy';
UPDATE social.ingestion_source_config SET max_pages = 3, max_articles = 50,  updated_at = now() WHERE source_key = 'owid_data_news';
UPDATE social.ingestion_source_config SET max_pages = 3, max_articles = 30,  updated_at = now() WHERE source_key = 'pudding_data_news';
