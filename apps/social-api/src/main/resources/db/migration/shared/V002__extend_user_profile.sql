-- ============================================================================
-- YouthLoop Shared Schema Migration V002
-- Schema: shared
-- Purpose: Extend user_profile with bio and location fields
-- ============================================================================

-- 扩展 user_profile 表，增加 bio 和 location 字段（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'shared' 
                 AND table_name = 'user_profile' 
                 AND column_name = 'bio') THEN
    ALTER TABLE shared.user_profile ADD COLUMN bio text NULL;
    COMMENT ON COLUMN shared.user_profile.bio IS '个人简介';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'shared' 
                 AND table_name = 'user_profile' 
                 AND column_name = 'location') THEN
    ALTER TABLE shared.user_profile ADD COLUMN location text NULL;
    COMMENT ON COLUMN shared.user_profile.location IS '所在地';
  END IF;
END $$;
