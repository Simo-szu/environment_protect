-- Add multilingual content storage for crawled/manual content display.

CREATE TABLE IF NOT EXISTS social.content_i18n (
  content_id uuid NOT NULL,
  locale varchar(8) NOT NULL,
  title text NOT NULL,
  summary text,
  body text NOT NULL,
  is_machine_translated boolean NOT NULL DEFAULT false,
  translated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_content_i18n PRIMARY KEY (content_id, locale),
  CONSTRAINT fk_content_i18n_content FOREIGN KEY (content_id) REFERENCES social.content(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_i18n_locale ON social.content_i18n(locale);
