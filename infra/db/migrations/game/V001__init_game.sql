-- ============================================================================
-- YouthLoop Game Schema Migration V001
-- Schema: game
-- Purpose: Game service business data (virtual pond simulation)
-- ============================================================================

-- === Game Session ===
-- 游戏会话表：记录用户的游戏进度
CREATE TABLE game.game_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pond_state jsonb NOT NULL, -- 池塘状态(水质参数、生物等)
  score bigint NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_action_at timestamptz NOT NULL DEFAULT now(),
  status int NOT NULL DEFAULT 1, -- 1=active 2=paused 3=ended
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_game_session_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_game_session_user ON game.game_session(user_id, status);
CREATE INDEX idx_game_session_last_action ON game.game_session(last_action_at);

-- === Game Action ===
-- 游戏操作记录表：记录用户的每次操作
CREATE TABLE game.game_action (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action_type int NOT NULL, -- 1=feed 2=clean 3=add_plant 4=add_fish 5=adjust_params
  action_data jsonb, -- 操作详细数据
  points_earned int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_game_action_session FOREIGN KEY (session_id) REFERENCES game.game_session(id) ON DELETE CASCADE,
  CONSTRAINT fk_game_action_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_game_action_session ON game.game_action(session_id, created_at);
CREATE INDEX idx_game_action_user ON game.game_action(user_id, created_at);

-- === Game Achievement ===
-- 游戏成就表：用户解锁的成就
CREATE TABLE game.game_achievement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon_url text,
  points int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- === User Achievement ===
-- 用户成就关联表
CREATE TABLE game.user_achievement (
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id),
  CONSTRAINT fk_user_achievement_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_achievement_achievement FOREIGN KEY (achievement_id) REFERENCES game.game_achievement(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_achievement_user ON game.user_achievement(user_id, unlocked_at);

-- === 初始化一些基础成就 ===
INSERT INTO game.game_achievement (id, code, name, description, points) VALUES
  (gen_random_uuid(), 'FIRST_SESSION', '初次体验', '开始第一个游戏会话', 10),
  (gen_random_uuid(), 'POND_MASTER_1', '池塘新手', '达到1级', 20),
  (gen_random_uuid(), 'POND_MASTER_5', '池塘专家', '达到5级', 50),
  (gen_random_uuid(), 'ECO_WARRIOR', '生态卫士', '保持池塘健康7天', 100);
