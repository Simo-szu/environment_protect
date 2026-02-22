-- ============================================================================
-- YouthLoop Game Schema Migration V011
-- Schema: game
-- Purpose: Add ending display content config
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_ending_content_config (
  ending_id text PRIMARY KEY,
  ending_name text NOT NULL,
  image_key text NOT NULL,
  default_reason text NOT NULL DEFAULT '',
  failure_reason_high_carbon text NOT NULL DEFAULT '',
  failure_reason_trade text NOT NULL DEFAULT '',
  failure_reason_low_score text NOT NULL DEFAULT '',
  failure_reason_boundary_default text NOT NULL DEFAULT '',
  config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_ending_content_enabled
  ON game.game_ending_content_config(is_enabled, ending_id);

INSERT INTO game.game_ending_content_config (
  ending_id, ending_name, image_key, default_reason,
  failure_reason_high_carbon, failure_reason_trade, failure_reason_low_score, failure_reason_boundary_default, config_snapshot
) VALUES
  ('innovation_technology', '创新科技结局', 'endings/创新科技结局.jpg', '科技板块成为主导，城市通过技术迭代实现减排与增长。', '', '', '', '', '{"endingId":"innovation_technology"}'::jsonb),
  ('ecology_priority', '生态优先结局', 'endings/生态优先结局.jpg', '生态板块成为主导，绿建和碳汇能力达成高水平。', '', '', '', '', '{"endingId":"ecology_priority"}'::jsonb),
  ('doughnut_city', '甜甜圈结局', 'endings/甜甜圈结局.jpg', '社会公平与低碳协同，城市进入甜甜圈稳态。', '', '', '', '', '{"endingId":"doughnut_city"}'::jsonb),
  ('failure', '失败结局', 'endings/失败结局.jpg', '已达到终局边界但未满足任一正向结局条件。',
   '碳排放连续5回合高于130，系统进入失控状态。',
   '配额耗尽记录达到4次且碳交易盈利为负。',
   '终局时低碳总分低于120。',
   '已达到终局边界但未满足任一正向结局条件。',
   '{"endingId":"failure"}'::jsonb)
ON CONFLICT (ending_id) DO UPDATE SET
  ending_name = EXCLUDED.ending_name,
  image_key = EXCLUDED.image_key,
  default_reason = EXCLUDED.default_reason,
  failure_reason_high_carbon = EXCLUDED.failure_reason_high_carbon,
  failure_reason_trade = EXCLUDED.failure_reason_trade,
  failure_reason_low_score = EXCLUDED.failure_reason_low_score,
  failure_reason_boundary_default = EXCLUDED.failure_reason_boundary_default,
  config_snapshot = EXCLUDED.config_snapshot,
  is_enabled = true,
  updated_at = now();
