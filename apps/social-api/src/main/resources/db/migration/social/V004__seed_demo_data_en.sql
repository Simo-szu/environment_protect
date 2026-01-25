-- ============================================================================
-- YouthLoop Social Schema Migration V004
-- Schema: social
-- Purpose: English demo data across social tables for local development
-- Depends on: shared.V003__seed_demo_users_en.sql (demo users)
-- ============================================================================

-- === IDs (stable) ===
-- Users (from shared seed)
--   Alice: 11111111-1111-1111-1111-111111111111
--   Bob:   22222222-2222-2222-2222-222222222222
--   Admin: 33333333-3333-3333-3333-333333333333

-- Content
--   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1
--   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2
--   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3

-- Activities
--   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1 (hosted)
--   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2 (external/crawled)

-- Sessions
--   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3
--   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4

-- Comments
--   cccccccc-cccc-cccc-cccc-ccccccccccc1 (root)
--   cccccccc-cccc-cccc-cccc-ccccccccccc2 (reply)

-- Banners
--   dddddddd-dddd-dddd-dddd-ddddddddddd1
--   dddddddd-dddd-dddd-dddd-ddddddddddd2
--   dddddddd-dddd-dddd-dddd-ddddddddddd3

-- Rules / badges
--   eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1 (hot rule)
--   ffffffff-ffff-ffff-ffff-fffffffffff1 (badge)

-- === Host profile & verification (Bob) ===
INSERT INTO social.host_profile (user_id, display_name, org_name, org_logo_url, intro, created_at, updated_at) VALUES
  ('22222222-2222-2222-2222-222222222222'::uuid, 'GreenSteps Org', 'GreenSteps Organization', 'https://picsum.photos/seed/greensteps/200/200', 'We organize weekly local sustainability activities.', now(), now())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO social.host_verification (user_id, org_name, contact_name, contact_phone, doc_urls, status, submitted_at, reviewed_by, reviewed_at, review_note, created_at, updated_at) VALUES
  ('22222222-2222-2222-2222-222222222222'::uuid, 'GreenSteps Organization', 'Bob Organizer', '+1-512-555-0100', '["https://example.com/docs/verification.pdf"]'::jsonb, 2, now() - interval '10 days', '33333333-3333-3333-3333-333333333333'::uuid, now() - interval '9 days', 'Approved (demo).', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- === Hot score rule (demo, optional) ===
INSERT INTO social.hot_score_rule (id, target_type, name, version, formula_json, is_active, created_at, updated_at) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid, 1, 'Default content hot score', 1, '{"type":"simple","note":"demo"}'::jsonb, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- === Content (English) ===
INSERT INTO social.content (id, type, title, summary, cover_url, body, source_type, source_url, published_at, status, created_at, updated_at) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
    1,
    'Small Daily Habits That Reduce Waste',
    'Five easy habits you can start today to reduce waste and save money.',
    'https://picsum.photos/seed/youthloop-content-1/1200/700',
    '# Reduce Waste, One Habit at a Time\n\nStart with:\n- Bring a reusable bottle\n- Skip single-use cutlery\n- Choose refills\n- Sort your recycling\n- Share and repair\n',
    1,
    'https://example.com/demo/content/reduce-waste',
    now() - interval '2 days',
    1,
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    4,
    'What Is Carbon Neutrality?',
    'A beginner-friendly explanation of carbon neutrality and how to get started.',
    'https://picsum.photos/seed/youthloop-content-2/1200/700',
    'Carbon neutrality means balancing emissions with removals.\n\n**Step 1**: Measure\n**Step 2**: Reduce\n**Step 3**: Offset\n',
    1,
    'https://example.com/demo/content/carbon-neutrality',
    now() - interval '1 day',
    1,
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
    2,
    'Community Swap Day This Weekend',
    'Bring items you no longer need and exchange them with your neighbors.',
    'https://picsum.photos/seed/youthloop-content-3/1200/700',
    'Join us for a community swap day.\n\nLocation: Downtown Plaza\nTime: Saturday 10:00–16:00\n',
    1,
    'https://example.com/demo/content/swap-day',
    now() - interval '6 hours',
    1,
    now() - interval '6 hours',
    now() - interval '6 hours'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO social.content_stats (content_id, like_count, fav_count, down_count, comment_count, hot_score, hot_rule_id, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, 12, 5, 0, 2, 120, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid, now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid, 20, 9, 1, 1, 210, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid, now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid, 7, 3, 0, 0, 80,  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid, now())
ON CONFLICT (content_id) DO NOTHING;

-- === Activities ===
INSERT INTO social.activity (id, source_type, title, category, topic, signup_policy, start_time, end_time, location, description, poster_urls, source_url, host_user_id, status, created_at, updated_at) VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
    2,
    'Park Cleanup & Sorting Workshop',
    3,
    'Hands-on community action',
    1,
    now() + interval '3 days',
    now() + interval '3 days' + interval '2 hours',
    'Riverside Park',
    'Join a friendly park cleanup and learn simple sorting rules.\n\nBring gloves if you have them.',
    '["https://picsum.photos/seed/youthloop-activity-1/1200/700","https://picsum.photos/seed/youthloop-activity-1b/1200/700"]'::jsonb,
    NULL,
    '22222222-2222-2222-2222-222222222222'::uuid,
    1,
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid,
    1,
    'City Bike-to-Work Challenge',
    5,
    'Low-carbon commuting',
    1,
    now() + interval '7 days',
    now() + interval '7 days' + interval '1 hour',
    'City Center',
    'A city-wide bike-to-work challenge. Join and invite friends.',
    '["https://picsum.photos/seed/youthloop-activity-2/1200/700"]'::jsonb,
    'https://example.com/demo/activity/bike-to-work',
    NULL,
    1,
    now() - interval '3 days',
    now() - interval '3 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO social.activity_stats (activity_id, like_count, fav_count, down_count, comment_count, hot_score, hot_rule_id, updated_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid, 5, 2, 0, 1, 90,  NULL, now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid, 9, 4, 0, 0, 140, NULL, now())
ON CONFLICT (activity_id) DO NOTHING;

INSERT INTO social.activity_session (id, activity_id, title, start_time, end_time, capacity, status, created_at, updated_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid, 'Morning Session', now() + interval '3 days' + interval '30 minutes', now() + interval '3 days' + interval '2 hours', 30, 1, now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid, 'Afternoon Session', now() + interval '3 days' + interval '3 hours', now() + interval '3 days' + interval '4 hours', 30, 1, now(), now())
ON CONFLICT (id) DO NOTHING;

-- === Activity signups ===
INSERT INTO social.activity_signup (id, activity_id, session_id, user_id, email, nickname, real_name, phone, join_time, status, audited_by, audited_at, audit_note, canceled_at, cancel_note, dedup_key, created_at, updated_at) VALUES
  (
    gen_random_uuid(),
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'alice@youthloop.dev',
    'Alice Green',
    'Alice Green',
    '+1-206-555-0101',
    now() + interval '3 days' + interval '30 minutes',
    2,
    '22222222-2222-2222-2222-222222222222'::uuid,
    now() - interval '12 hours',
    'Approved (demo).',
    NULL,
    NULL,
    'user:11111111-1111-1111-1111-111111111111',
    now() - interval '1 day',
    now() - interval '1 day'
  )
ON CONFLICT (activity_id, dedup_key) DO NOTHING;

-- === Comments (content) ===
INSERT INTO social.comment (id, target_type, target_id, user_id, parent_id, root_id, depth, body, status, created_at, updated_at) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid, 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, NULL, NULL, 0, 'Great tips! I started carrying a reusable bottle this week.', 1, now() - interval '5 hours', now() - interval '5 hours'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid, 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid, 'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid, 1, 'Love it — small habits really add up.', 1, now() - interval '3 hours', now() - interval '3 hours')
ON CONFLICT (id) DO NOTHING;

UPDATE social.comment
SET root_id = id
WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid
  AND root_id IS NULL;

INSERT INTO social.comment_stats (comment_id, like_count, down_count, reply_count, hot_score, hot_rule_id, updated_at) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid, 2, 0, 1, 30, NULL, now()),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid, 1, 0, 0, 10, NULL, now())
ON CONFLICT (comment_id) DO NOTHING;

-- === Reactions ===
INSERT INTO social.reaction (id, user_id, target_type, target_id, reaction_type, created_at) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, 1, now() - interval '4 hours'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 2, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid, 2, now() - interval '2 hours')
ON CONFLICT (user_id, target_type, target_id, reaction_type) DO NOTHING;

-- === Notifications ===
INSERT INTO social.notification (id, user_id, type, actor_user_id, target_type, target_id, comment_id, root_comment_id, meta, read_at, created_at) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111'::uuid,
    2,
    '22222222-2222-2222-2222-222222222222'::uuid,
    1,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
    'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
    'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
    '{"title":"New reply","content":"Bob replied to your comment."}'::jsonb,
    NULL,
    now() - interval '2 hours'
  )
ON CONFLICT DO NOTHING;

-- === Home banners ===
INSERT INTO social.home_banner (id, title, image_url, link_type, link_target, sort_order, is_enabled, start_at, end_at, created_by, updated_by, created_at, updated_at) VALUES
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid, 'Reduce Waste', 'https://picsum.photos/seed/youthloop-banner-1/1600/600', 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 1, true, NULL, NULL, '33333333-3333-3333-3333-333333333333'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, now(), now()),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid, 'Join a Cleanup', 'https://picsum.photos/seed/youthloop-banner-2/1600/600', 3, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 2, true, NULL, NULL, '33333333-3333-3333-3333-333333333333'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, now(), now()),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd3'::uuid, 'Learn More', 'https://picsum.photos/seed/youthloop-banner-3/1600/600', 4, 'https://youthloop.dev', 3, true, NULL, NULL, '33333333-3333-3333-3333-333333333333'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, now(), now())
ON CONFLICT (id) DO NOTHING;

-- === Points (Alice) ===
INSERT INTO social.points_account (user_id, balance, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 120, now())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO social.points_ledger (id, user_id, delta, reason, ref_type, ref_id, memo, created_at) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 50, 1, NULL, NULL, 'Demo bonus for sign-in', now() - interval '2 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 70, 5, NULL, NULL, 'Demo bonus', now() - interval '1 day')
ON CONFLICT DO NOTHING;

INSERT INTO social.signin_record (user_id, signin_date, is_signed, signed_at, is_makeup, streak_count, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, current_date, true, now(), false, 3, now())
ON CONFLICT (user_id, signin_date) DO NOTHING;

-- === Daily tasks ===
INSERT INTO social.daily_task (id, code, name, rule_json, points, is_enabled, created_at) VALUES
  (gen_random_uuid(), 'read_content', 'Read an article', '{"target":1}'::jsonb, 5, true, now()),
  (gen_random_uuid(), 'post_comment', 'Post a comment', '{"target":1}'::jsonb, 10, true, now()),
  (gen_random_uuid(), 'join_activity', 'Join an activity', '{"target":1}'::jsonb, 15, true, now())
ON CONFLICT (code) DO NOTHING;

-- Progress (pick first task by code)
INSERT INTO social.daily_task_progress (user_id, task_date, task_id, progress, target, status, updated_at)
SELECT
  '11111111-1111-1111-1111-111111111111'::uuid,
  current_date,
  t.id,
  1,
  1,
  2,
  now()
FROM social.daily_task t
WHERE t.code = 'read_content'
ON CONFLICT (user_id, task_date, task_id) DO NOTHING;

-- === Daily quiz (today) ===
INSERT INTO social.daily_quiz (quiz_date, question, answer, points, created_at) VALUES
  (
    current_date,
    '{
      "title":"Which item is usually recyclable?",
      "options":[
        {"id":1,"text":"Glass bottle"},
        {"id":2,"text":"Used tissue"}
      ]
    }'::jsonb,
    '1'::jsonb,
    10,
    now()
  )
ON CONFLICT (quiz_date) DO NOTHING;

-- === Badge (demo) ===
INSERT INTO social.badge (id, series, name, threshold, sort_order, created_at) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff1'::uuid, 1, 'Green Starter', '{"balanceGte":100}'::jsonb, 1, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO social.user_badge (user_id, badge_id, unlocked_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'ffffffff-ffff-ffff-ffff-fffffffffff1'::uuid, now() - interval '1 day')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- === User event ===
INSERT INTO social.user_event (id, user_id, event_type, target_type, target_id, meta, created_at) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 'VIEW_CONTENT', 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, '{"source":"demo"}'::jsonb, now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;

-- === Weekly recommendation ===
INSERT INTO social.weekly_recommendation (user_id, week_start, items, created_at, updated_at) VALUES
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    date_trunc('week', current_date)::date,
    '{"contents":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"],"activities":["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1"]}'::jsonb,
    now(),
    now()
  )
ON CONFLICT (user_id, week_start) DO NOTHING;

-- === Outbox event (demo) ===
INSERT INTO social.outbox_event (id, event_type, payload, status, retry_count, next_retry_at, last_error, created_at, updated_at) VALUES
  (gen_random_uuid(), 'DEMO_EVENT', '{"hello":"world"}'::jsonb, 1, 0, NULL, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;

-- === Support & feedback (demo) ===
INSERT INTO social.support_contact (id, user_id, name, email, phone, subject, message, status, created_at, handled_by, handled_at, meta) VALUES
  (gen_random_uuid(), NULL, 'Visitor', 'visitor@example.com', '+1-555-000-0000', 'General question', 'How do I join an activity?', 1, now() - interval '6 hours', NULL, NULL, '{"ip":"127.0.0.1"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO social.user_feedback (id, user_id, type, rating, title, content, contact, anonymous, status, created_at, meta) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 1, 5, 'Great app', 'Love the clean UI and the activities list.', 'alice@youthloop.dev', false, 1, now() - interval '4 hours', '{"device":"web"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

