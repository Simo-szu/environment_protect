-- ============================================================================
-- YouthLoop Social Schema Migration V106
-- Purpose: 添加积分等级徽章配置数据
-- ============================================================================

-- 插入积分等级徽章配置
-- series=1 表示积分等级系列
-- sortOrder 表示等级数字
-- threshold 的 balanceGte 表示达到该等级所需的最低积分

INSERT INTO social.badge (id, series, name, threshold, sort_order, created_at)
VALUES 
    (gen_random_uuid(), 1, 'Level 1', '{"balanceGte": 0}'::jsonb, 1, now()),
    (gen_random_uuid(), 1, 'Level 2', '{"balanceGte": 100}'::jsonb, 2, now()),
    (gen_random_uuid(), 1, 'Level 3', '{"balanceGte": 300}'::jsonb, 3, now()),
    (gen_random_uuid(), 1, 'Level 4', '{"balanceGte": 600}'::jsonb, 4, now()),
    (gen_random_uuid(), 1, 'Level 5', '{"balanceGte": 1000}'::jsonb, 5, now()),
    (gen_random_uuid(), 1, 'Level 6', '{"balanceGte": 1500}'::jsonb, 6, now()),
    (gen_random_uuid(), 1, 'Level 7', '{"balanceGte": 2100}'::jsonb, 7, now()),
    (gen_random_uuid(), 1, 'Level 8', '{"balanceGte": 2800}'::jsonb, 8, now()),
    (gen_random_uuid(), 1, 'Level 9', '{"balanceGte": 3600}'::jsonb, 9, now()),
    (gen_random_uuid(), 1, 'Level 10', '{"balanceGte": 4500}'::jsonb, 10, now())
ON CONFLICT DO NOTHING;
