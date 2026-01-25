-- ============================================================================
-- YouthLoop Social Schema Migration V002
-- Purpose: 插入测试内容数据（用于开发测试）
-- ============================================================================

-- 插入测试内容
INSERT INTO social.content (id, type, title, summary, cover_url, body, source_type, published_at, status, created_at, updated_at)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::uuid,
    1, -- 新闻
    '青年环保行动：让绿色成为生活方式',
    '越来越多的青年人加入到环保行动中，通过日常生活中的点滴改变，为地球的可持续发展贡献力量。',
    'https://example.com/covers/green-lifestyle.jpg',
    '# 青年环保行动：让绿色成为生活方式

在当今社会，环保已经不再是一个遥远的概念，而是每个人都可以参与的实际行动。越来越多的青年人意识到，保护环境不仅是为了我们自己，更是为了子孙后代。

## 从小事做起

环保可以从生活中的小事做起：
- 减少一次性塑料制品的使用
- 选择公共交通或骑行出行
- 垃圾分类，资源回收
- 节约用水用电

## 青年的力量

青年人是推动社会变革的重要力量。通过社交媒体、社区活动等方式，青年环保志愿者们正在影响更多人加入到环保行动中来。

让我们一起行动，让绿色成为我们的生活方式！',
    1, -- 人工创建
    now() - interval '2 days',
    1, -- 已发布
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e'::uuid,
    3, -- 政策
    '《青年发展规划》发布：支持青年参与环保事业',
    '国家发布新的青年发展规划，明确支持青年参与环保公益事业，提供资金和政策支持。',
    'https://example.com/covers/youth-policy.jpg',
    '# 《青年发展规划》发布

近日，国家发布了新的青年发展规划，其中特别强调了青年在环保事业中的重要作用。

## 主要内容

1. **资金支持**：设立青年环保创新基金
2. **政策扶持**：简化环保项目审批流程
3. **平台建设**：搭建青年环保交流平台
4. **能力培养**：开展环保技能培训

## 申请方式

符合条件的青年团体和个人可以通过官方网站提交申请。',
    1,
    now() - interval '1 day',
    1,
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f'::uuid,
    4, -- 百科
    '什么是碳中和？',
    '碳中和是指通过植树造林、节能减排等方式，抵消自身产生的二氧化碳排放量，实现二氧化碳"零排放"。',
    'https://example.com/covers/carbon-neutral.jpg',
    '# 什么是碳中和？

## 定义

碳中和（Carbon Neutrality）是指企业、团体或个人测算在一定时间内直接或间接产生的温室气体排放总量，通过植树造林、节能减排等形式，抵消自身产生的二氧化碳排放量，实现二氧化碳"零排放"。

## 实现路径

1. **减少排放**：提高能源效率，使用清洁能源
2. **碳补偿**：通过植树造林吸收二氧化碳
3. **碳交易**：购买碳信用额度

## 为什么重要

实现碳中和是应对气候变化、实现可持续发展的重要途径。',
    1,
    now() - interval '3 hours',
    1,
    now() - interval '3 hours',
    now() - interval '3 hours'
  ),
  (
    'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a'::uuid,
    2, -- 动态
    '本周末环保市集活动预告',
    '本周末将在市中心广场举办环保主题市集，欢迎大家前来参与！',
    'https://example.com/covers/eco-market.jpg',
    '# 本周末环保市集活动预告

📅 **时间**：本周六、周日 10:00-18:00
📍 **地点**：市中心广场

## 活动亮点

- 🌱 环保产品展示与销售
- ♻️ 旧物交换市集
- 🎨 环保手工DIY工作坊
- 🎤 环保主题分享会

欢迎大家带上闲置物品来交换，一起践行绿色生活！',
    1,
    now() - interval '6 hours',
    1,
    now() - interval '6 hours',
    now() - interval '6 hours'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-8a9b-0c1d2e3f4a5b'::uuid,
    1,
    '全球气候大会达成新协议',
    '最新一届全球气候大会在经过多轮谈判后，各国代表就减排目标达成新的共识。',
    'https://example.com/covers/climate-conference.jpg',
    '# 全球气候大会达成新协议

在为期两周的谈判后，参会各国代表就新的减排目标达成共识。

## 主要内容

- 2030年前全球碳排放减少45%
- 发达国家向发展中国家提供气候资金支持
- 建立全球碳市场机制

这一协议的达成，为全球应对气候变化提供了新的动力。',
    2, -- 爬取
    now() - interval '12 hours',
    1,
    now() - interval '12 hours',
    now() - interval '12 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- 插入对应的统计数据
INSERT INTO social.content_stats (content_id, like_count, fav_count, down_count, comment_count, hot_score, updated_at)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::uuid, 128, 45, 2, 23, 1500, now()),
  ('b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e'::uuid, 89, 67, 1, 15, 1200, now()),
  ('c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f'::uuid, 234, 156, 3, 45, 2800, now()),
  ('d4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a'::uuid, 56, 23, 0, 8, 600, now()),
  ('e5f6a7b8-c9d0-4e5f-8a9b-0c1d2e3f4a5b'::uuid, 312, 198, 5, 67, 3500, now())
ON CONFLICT (content_id) DO NOTHING;
