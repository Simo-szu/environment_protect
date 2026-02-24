-- ============================================================================
-- YouthLoop Game Schema Migration V006
-- Schema: game
-- Purpose: Rebuilt history - seed lightweight demo records for local development
-- ============================================================================

INSERT INTO game.game_session (
  id, user_id, pond_state, score, level, started_at, last_action_at, status, created_at, updated_at
)
VALUES (
  'aaaaaaaa-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"waterQuality":85,"temperature":24,"oxygen":8,"ph":7,"fishCount":2,"plantCount":3}'::jsonb,
  120,
  2,
  now() - interval '2 day',
  now() - interval '2 day',
  3,
  now() - interval '2 day',
  now() - interval '2 day'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO game.game_action (
  id, session_id, user_id, action_type, action_data, points_earned, created_at
)
VALUES (
  'bbbbbbbb-1111-1111-1111-111111111111',
  'aaaaaaaa-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  2,
  '{"source":"seed"}'::jsonb,
  10,
  now() - interval '2 day'
)
ON CONFLICT (id) DO NOTHING;
