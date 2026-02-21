-- ============================================================================
-- YouthLoop Game Schema Migration V001
-- Schema: game
-- Purpose: Initialize game session and action tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pond_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  score bigint NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_action_at timestamptz NOT NULL DEFAULT now(),
  status integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game.game_action (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action_type integer NOT NULL,
  action_data jsonb,
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_game_action_session FOREIGN KEY (session_id) REFERENCES game.game_session(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_session_user_status ON game.game_session(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_action_session ON game.game_action(session_id, created_at DESC);
