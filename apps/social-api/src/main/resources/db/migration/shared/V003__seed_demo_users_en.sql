-- ============================================================================
-- YouthLoop Shared Schema Migration V003
-- Schema: shared
-- Purpose: English demo users for local development
-- Notes:
--   - Password for all demo users: Password123!
--   - BCrypt hash generated offline (bcrypt $2b$10$)
-- ============================================================================

-- === Users ===
INSERT INTO shared.user (id, role, status, last_login_at, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 1, 1, NULL, now(), now()), -- Alice (user)
  ('22222222-2222-2222-2222-222222222222'::uuid, 2, 1, NULL, now(), now()), -- Bob (host)
  ('33333333-3333-3333-3333-333333333333'::uuid, 3, 1, NULL, now(), now())  -- Admin
ON CONFLICT (id) DO NOTHING;

-- === User Profiles ===
INSERT INTO shared.user_profile (user_id, nickname, avatar_url, gender, birthday, hometown, bio, location, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Alice Green', 'https://i.pravatar.cc/200?img=5', 2, '2000-05-12', 'Seattle', 'Eco enthusiast and community volunteer.', 'Seattle, WA', now(), now()),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Bob Organizer', 'https://i.pravatar.cc/200?img=12', 1, '1996-11-03', 'Austin', 'Runs local sustainability events.', 'Austin, TX', now(), now()),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Admin', 'https://i.pravatar.cc/200?img=1', NULL, NULL, NULL, 'System administrator (demo).', 'N/A', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- === User Identity (Email) ===
INSERT INTO shared.user_identity (id, user_id, identity_type, identity_identifier, verified_at, is_primary, created_at, updated_at) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 1, 'alice@youthloop.dev', now(), true, now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 1, 'bob@youthloop.dev', now(), true, now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333'::uuid, 1, 'admin@youthloop.dev', now(), true, now(), now())
ON CONFLICT (identity_type, identity_identifier) DO NOTHING;

-- === User Password (BCrypt) ===
-- Password123! => $2b$10$6iNKuT4I4sKaKoiywFF7V.loMVogKNvmzQqNBltCOWIOYyfAgdGnC
INSERT INTO shared.user_password (user_id, password_hash, set_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, '$2b$10$6iNKuT4I4sKaKoiywFF7V.loMVogKNvmzQqNBltCOWIOYyfAgdGnC', now(), now()),
  ('22222222-2222-2222-2222-222222222222'::uuid, '$2b$10$6iNKuT4I4sKaKoiywFF7V.loMVogKNvmzQqNBltCOWIOYyfAgdGnC', now(), now()),
  ('33333333-3333-3333-3333-333333333333'::uuid, '$2b$10$6iNKuT4I4sKaKoiywFF7V.loMVogKNvmzQqNBltCOWIOYyfAgdGnC', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- === Terms Acceptance (demo) ===
INSERT INTO shared.user_terms_acceptance (id, user_id, doc_type, doc_version, accepted_at, ip, user_agent) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 1, 'v1.0', now(), '127.0.0.1', 'demo-seed'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 2, 'v1.0', now(), '127.0.0.1', 'demo-seed'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 1, 'v1.0', now(), '127.0.0.1', 'demo-seed'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 2, 'v1.0', now(), '127.0.0.1', 'demo-seed')
ON CONFLICT DO NOTHING;

