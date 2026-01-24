-- ============================================================================
-- YouthLoop Social Schema Migration V001
-- Schema: social
-- Purpose: Content, Activity, Interaction, Points, Recommendation, Events
-- ============================================================================

-- === Host Profile ===
CREATE TABLE social.host_profile (
  user_id uuid PRIMARY KEY,
  display_name text,
  org_name text,
  org_logo_url text,
  intro text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_host_profile_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE
);

-- === Host Verification ===
CREATE TABLE social.host_verification (
  user_id uuid PRIMARY KEY,
  org_name text NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  doc_urls jsonb,
  status int NOT NULL DEFAULT 1, -- 1=pending 2=approved 3=rejected 4=revoked
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_host_verification_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE,
  CONSTRAINT fk_host_verification_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES shared.user(id) ON DELETE SET NULL
);

CREATE INDEX idx_host_verification_status ON social.host_verification(status, submitted_at);

-- === Home Banner ===
CREATE TABLE social.home_banner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  link_type int NOT NULL, -- 1=none 2=content 3=activity 4=url
  link_target text,
  sort_order int NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  start_at timestamptz,
  end_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_home_banner_enabled_sort ON social.home_banner(is_enabled, sort_order);
CREATE INDEX idx_home_banner_dates ON social.home_banner(start_at, end_at);

-- === Content ===
CREATE TABLE social.content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type int NOT NULL, -- 1=news 2=dynamic 3=policy 4=wiki
  title text NOT NULL,
  summary text,
  cover_url text,
  body text NOT NULL,
  source_type int NOT NULL, -- 1=manual 2=crawled
  source_url text UNIQUE,
  published_at timestamptz,
  status int NOT NULL DEFAULT 1, -- 1=published 2=draft 3=hidden
  fts tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_type_published ON social.content(type, published_at);
CREATE INDEX idx_content_status_published ON social.content(status, published_at);
CREATE INDEX idx_content_fts ON social.content USING gin(fts);

-- === Content Stats ===
CREATE TABLE social.content_stats (
  content_id uuid PRIMARY KEY,
  like_count int NOT NULL DEFAULT 0,
  fav_count int NOT NULL DEFAULT 0,
  down_count int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  hot_score bigint NOT NULL DEFAULT 0,
  hot_rule_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_content_stats_content FOREIGN KEY (content_id) REFERENCES social.content(id) ON DELETE CASCADE
);

CREATE INDEX idx_content_stats_hot_score ON social.content_stats(hot_score);
CREATE INDEX idx_content_stats_hot_rule ON social.content_stats(hot_rule_id);

-- === Activity ===
CREATE TABLE social.activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type int NOT NULL, -- 1=crawled 2=hosted
  title text NOT NULL,
  category int NOT NULL, -- 1..8
  topic text,
  signup_policy int NOT NULL DEFAULT 1, -- 1=auto_approve 2=manual_review
  start_time timestamptz,
  end_time timestamptz,
  location text,
  description text,
  poster_urls jsonb,
  source_url text UNIQUE,
  host_user_id uuid,
  status int NOT NULL DEFAULT 1, -- 1=published 2=hidden 3=ended
  fts tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_category_start ON social.activity(category, start_time);
CREATE INDEX idx_activity_host_created ON social.activity(host_user_id, created_at);
CREATE INDEX idx_activity_status_created ON social.activity(status, created_at);
CREATE INDEX idx_activity_fts ON social.activity USING gin(fts);

-- === Activity Session ===
CREATE TABLE social.activity_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  title text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  capacity int,
  status int NOT NULL DEFAULT 1, -- 1=enabled 2=disabled
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_activity_session_activity FOREIGN KEY (activity_id) REFERENCES social.activity(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_session_activity_start ON social.activity_session(activity_id, start_time);

-- === Activity Stats ===
CREATE TABLE social.activity_stats (
  activity_id uuid PRIMARY KEY,
  like_count int NOT NULL DEFAULT 0,
  fav_count int NOT NULL DEFAULT 0,
  down_count int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  hot_score bigint NOT NULL DEFAULT 0,
  hot_rule_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_activity_stats_activity FOREIGN KEY (activity_id) REFERENCES social.activity(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_stats_hot_score ON social.activity_stats(hot_score);
CREATE INDEX idx_activity_stats_hot_rule ON social.activity_stats(hot_rule_id);

-- === Activity Signup ===
CREATE TABLE social.activity_signup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  session_id uuid,
  user_id uuid,
  email text,
  nickname text,
  real_name text NOT NULL,
  phone text NOT NULL,
  join_time timestamptz,
  status int NOT NULL DEFAULT 1, -- 1=pending 2=approved 3=rejected 4=canceled
  audited_by uuid,
  audited_at timestamptz,
  audit_note text,
  canceled_at timestamptz,
  cancel_note text,
  dedup_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_activity_signup_activity FOREIGN KEY (activity_id) REFERENCES social.activity(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_signup_session FOREIGN KEY (session_id) REFERENCES social.activity_session(id) ON DELETE SET NULL,
  CONSTRAINT uq_activity_signup_dedup UNIQUE (activity_id, dedup_key)
);

CREATE INDEX idx_activity_signup_activity_created ON social.activity_signup(activity_id, created_at);
CREATE INDEX idx_activity_signup_activity_status ON social.activity_signup(activity_id, status, created_at);
CREATE INDEX idx_activity_signup_session ON social.activity_signup(session_id);

-- === Comment ===
CREATE TABLE social.comment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type int NOT NULL, -- 1=content 2=activity
  target_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_id uuid,
  root_id uuid,
  depth int NOT NULL DEFAULT 0,
  body text NOT NULL,
  status int NOT NULL DEFAULT 1, -- 1=visible 2=hidden
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comment_target ON social.comment(target_type, target_id, created_at);
CREATE INDEX idx_comment_root ON social.comment(root_id, created_at);
CREATE INDEX idx_comment_parent ON social.comment(parent_id, created_at);
CREATE INDEX idx_comment_user ON social.comment(user_id, created_at);

-- === Comment Stats ===
CREATE TABLE social.comment_stats (
  comment_id uuid PRIMARY KEY,
  like_count int NOT NULL DEFAULT 0,
  down_count int NOT NULL DEFAULT 0,
  reply_count int NOT NULL DEFAULT 0,
  hot_score bigint NOT NULL DEFAULT 0,
  hot_rule_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_comment_stats_comment FOREIGN KEY (comment_id) REFERENCES social.comment(id) ON DELETE CASCADE
);

CREATE INDEX idx_comment_stats_hot_score ON social.comment_stats(hot_score);
CREATE INDEX idx_comment_stats_hot_rule ON social.comment_stats(hot_rule_id);

-- === Hot Score Rule ===
CREATE TABLE social.hot_score_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type int NOT NULL, -- 1=content 2=activity 3=comment
  name text NOT NULL,
  version int NOT NULL DEFAULT 1,
  formula_json jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_hot_score_rule_target_active ON social.hot_score_rule(target_type, is_active);

-- === Reaction ===
CREATE TABLE social.reaction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_type int NOT NULL, -- 1=content 2=activity 3=comment
  target_id uuid NOT NULL,
  reaction_type int NOT NULL, -- 1=like 2=fav 3=downvote
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_reaction_user_target_type UNIQUE (user_id, target_type, target_id, reaction_type)
);

CREATE INDEX idx_reaction_target ON social.reaction(target_type, target_id, created_at);
CREATE INDEX idx_reaction_user ON social.reaction(user_id, created_at);

-- === Notification ===
CREATE TABLE social.notification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type int NOT NULL, -- 1=comment_reply 2=comment_mention 3=system
  actor_user_id uuid,
  target_type int,
  target_id uuid,
  comment_id uuid,
  root_comment_id uuid,
  meta jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_user_read ON social.notification(user_id, read_at, created_at);
CREATE INDEX idx_notification_comment ON social.notification(comment_id);

-- === Points Account ===
CREATE TABLE social.points_account (
  user_id uuid PRIMARY KEY,
  balance bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- === Points Ledger ===
CREATE TABLE social.points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta int NOT NULL,
  reason int NOT NULL, -- 1=signin 2=task 3=quiz 4=admin 5=other
  ref_type int,
  ref_id uuid,
  memo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_points_ledger_user ON social.points_ledger(user_id, created_at);

-- === Signin Record ===
CREATE TABLE social.signin_record (
  user_id uuid NOT NULL,
  signin_date date NOT NULL,
  is_signed boolean NOT NULL DEFAULT true,
  signed_at timestamptz NOT NULL,
  is_makeup boolean NOT NULL DEFAULT false,
  streak_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, signin_date)
);

CREATE INDEX idx_signin_record_user_signed ON social.signin_record(user_id, signed_at);

-- === Daily Task ===
CREATE TABLE social.daily_task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  rule_json jsonb NOT NULL,
  points int NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- === Daily Task Progress ===
CREATE TABLE social.daily_task_progress (
  user_id uuid NOT NULL,
  task_date date NOT NULL,
  task_id uuid NOT NULL,
  progress int NOT NULL DEFAULT 0,
  target int NOT NULL DEFAULT 1,
  status int NOT NULL DEFAULT 1, -- 1=doing 2=claimable 3=done
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, task_date, task_id)
);

-- === Daily Quiz ===
CREATE TABLE social.daily_quiz (
  quiz_date date PRIMARY KEY,
  question jsonb NOT NULL,
  answer jsonb NOT NULL,
  points int NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- === Daily Quiz Record ===
CREATE TABLE social.daily_quiz_record (
  user_id uuid NOT NULL,
  quiz_date date NOT NULL,
  user_answer jsonb NOT NULL,
  is_correct boolean NOT NULL,
  points int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quiz_date)
);

-- === Badge ===
CREATE TABLE social.badge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series int NOT NULL, -- 1=points 2=signin
  name text NOT NULL,
  threshold jsonb NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- === User Badge ===
CREATE TABLE social.user_badge (
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id),
  CONSTRAINT fk_user_badge_badge FOREIGN KEY (badge_id) REFERENCES social.badge(id) ON DELETE CASCADE
);

-- === User Event ===
CREATE TABLE social.user_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  target_type int,
  target_id uuid,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_event_user ON social.user_event(user_id, created_at);
CREATE INDEX idx_user_event_type ON social.user_event(event_type, created_at);

-- === Weekly Recommendation ===
CREATE TABLE social.weekly_recommendation (
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  items jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);

-- === Outbox Event ===
CREATE TABLE social.outbox_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status int NOT NULL DEFAULT 1, -- 1=pending 2=processing 3=done 4=dead
  retry_count int NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_outbox_event_status ON social.outbox_event(status, created_at);
CREATE INDEX idx_outbox_event_retry ON social.outbox_event(next_retry_at);
