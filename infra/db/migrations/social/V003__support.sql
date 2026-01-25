-- ============================================================================
-- YouthLoop Social Schema Migration V003
-- Schema: social
-- Purpose: Support and feedback tables
-- ============================================================================

-- === Support Contact Table ===
CREATE TABLE social.support_contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL, -- NULL 表示游客提交
  name text NOT NULL,
  email text NOT NULL,
  phone text NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status int NOT NULL DEFAULT 1, -- 1=待处理 2=处理中 3=已完成 4=已关闭
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_by uuid NULL, -- 处理人 user_id
  handled_at timestamptz NULL,
  meta jsonb NULL, -- 扩展字段：IP、User-Agent 等
  CONSTRAINT fk_support_contact_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE SET NULL,
  CONSTRAINT fk_support_contact_handler FOREIGN KEY (handled_by) REFERENCES shared.user(id) ON DELETE SET NULL
);

CREATE INDEX idx_support_contact_user_created ON social.support_contact(user_id, created_at);
CREATE INDEX idx_support_contact_status_created ON social.support_contact(status, created_at);
CREATE INDEX idx_support_contact_email ON social.support_contact(email);

COMMENT ON TABLE social.support_contact IS '联系我们记录';
COMMENT ON COLUMN social.support_contact.status IS '1=待处理 2=处理中 3=已完成 4=已关闭';

-- === User Feedback Table ===
CREATE TABLE social.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL, -- NULL 表示游客提交
  type int NOT NULL, -- 1=建议 2=Bug 3=表扬 4=其他
  rating int NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5 星评分
  title text NOT NULL,
  content text NOT NULL,
  contact text NULL, -- 联系方式（邮箱/手机）
  anonymous bool NOT NULL DEFAULT false, -- 是否匿名
  status int NOT NULL DEFAULT 1, -- 1=待处理 2=处理中 3=已完成 4=已关闭
  created_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NULL, -- 扩展字段：截图 URL、设备信息等
  CONSTRAINT fk_user_feedback_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_feedback_user_created ON social.user_feedback(user_id, created_at);
CREATE INDEX idx_user_feedback_status_created ON social.user_feedback(status, created_at);
CREATE INDEX idx_user_feedback_type_created ON social.user_feedback(type, created_at);

COMMENT ON TABLE social.user_feedback IS '用户反馈记录';
COMMENT ON COLUMN social.user_feedback.type IS '1=建议 2=Bug 3=表扬 4=其他';
COMMENT ON COLUMN social.user_feedback.status IS '1=待处理 2=处理中 3=已完成 4=已关闭';
