-- ============================================================================
-- YouthLoop Shared Schema Migration V003
-- Schema: shared
-- Purpose: Demo users and admin account setup
-- Notes:
--   - Demo users password: Password123!
--   - Admin password: Aa123456
--   - Admin email: chent555888@gmail.com
--   - BCrypt hashes generated offline (bcrypt $2b$10$)
-- ============================================================================

-- === Admin Account (IMPORTANT: Will promote existing user to admin if email exists) ===
-- Step 1: Find or create admin user by email
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Try to find user by email identity
  SELECT user_id INTO admin_user_id
  FROM shared.user_identity
  WHERE identity_type = 1 AND identity_identifier = 'chent555888@gmail.com'
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    -- User doesn't exist, create new admin user with fixed UUID
    admin_user_id := '33333333-3333-3333-3333-333333333333'::uuid;

    INSERT INTO shared.user (id, role, status, last_login_at, created_at, updated_at)
    VALUES (admin_user_id, 3, 1, NULL, now(), now())
    ON CONFLICT (id) DO UPDATE SET role = 3, updated_at = now();

    -- Create profile for new admin
    INSERT INTO shared.user_profile (user_id, nickname, avatar_url, gender, birthday, hometown, bio, location, created_at, updated_at)
    VALUES (admin_user_id, 'Admin', 'https://i.pravatar.cc/200?img=1', NULL, NULL, NULL, 'System administrator.', 'N/A', now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
      nickname = COALESCE(EXCLUDED.nickname, shared.user_profile.nickname),
      updated_at = now();

    -- Create email identity for new admin
    INSERT INTO shared.user_identity (id, user_id, identity_type, identity_identifier, verified_at, is_primary, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_user_id, 1, 'chent555888@gmail.com', now(), true, now(), now())
    ON CONFLICT (identity_type, identity_identifier) DO NOTHING;
  ELSE
    -- User exists, promote to admin
    UPDATE shared.user
    SET role = 3, updated_at = now()
    WHERE id = admin_user_id;

    RAISE NOTICE 'Promoted existing user to admin: userId=%', admin_user_id;
  END IF;

  -- Upsert password (works for both new and existing users)
  -- Aa123456 => $2b$10$jYvKDcxYoflwL91OzKy4E.OfrSoAc.ZvnT4FgMO.2VJ5M/E8RwCju
  INSERT INTO shared.user_password (user_id, password_hash, set_at, updated_at)
  VALUES (admin_user_id, '$2b$10$jYvKDcxYoflwL91OzKy4E.OfrSoAc.ZvnT4FgMO.2VJ5M/E8RwCju', now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    set_at = now(),
    updated_at = now();

  RAISE NOTICE 'Admin account configured: email=chent555888@gmail.com, userId=%', admin_user_id;
END $$;

-- === Admin Account 2 (chent555888@outlook.com) ===
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Try to find user by email identity
  SELECT user_id INTO admin_user_id
  FROM shared.user_identity
  WHERE identity_type = 1 AND identity_identifier = 'chent555888@outlook.com'
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    -- User doesn't exist, create new admin user with fixed UUID
    admin_user_id := '44444444-4444-4444-4444-444444444444'::uuid;

    INSERT INTO shared.user (id, role, status, last_login_at, created_at, updated_at)
    VALUES (admin_user_id, 3, 1, NULL, now(), now())
    ON CONFLICT (id) DO UPDATE SET role = 3, updated_at = now();

    -- Create profile for new admin
    INSERT INTO shared.user_profile (user_id, nickname, avatar_url, gender, birthday, hometown, bio, location, created_at, updated_at)
    VALUES (admin_user_id, 'Admin 2', 'https://i.pravatar.cc/200?img=2', NULL, NULL, NULL, 'System administrator.', 'N/A', now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
      nickname = COALESCE(EXCLUDED.nickname, shared.user_profile.nickname),
      updated_at = now();

    -- Create email identity for new admin
    INSERT INTO shared.user_identity (id, user_id, identity_type, identity_identifier, verified_at, is_primary, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_user_id, 1, 'chent555888@outlook.com', now(), true, now(), now())
    ON CONFLICT (identity_type, identity_identifier) DO NOTHING;
  ELSE
    -- User exists, promote to admin
    UPDATE shared.user
    SET role = 3, updated_at = now()
    WHERE id = admin_user_id;

    RAISE NOTICE 'Promoted existing user to admin: userId=%', admin_user_id;
  END IF;

  -- Upsert password (works for both new and existing users)
  -- chentao123 => $2b$10$ri7d0P9h9GwmeIXWnRhsR.kZsTpoRAczdi1z6E0/uEif6Do9fN3ee
  INSERT INTO shared.user_password (user_id, password_hash, set_at, updated_at)
  VALUES (admin_user_id, '$2b$10$ri7d0P9h9GwmeIXWnRhsR.kZsTpoRAczdi1z6E0/uEif6Do9fN3ee', now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    set_at = now(),
    updated_at = now();

  RAISE NOTICE 'Admin account configured: email=chent555888@outlook.com, userId=%', admin_user_id;
END $$;

-- === Demo Users (Optional, for development) ===
INSERT INTO shared.user (id, role, status, last_login_at, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 1, 1, NULL, now(), now()), -- Alice (user)
  ('22222222-2222-2222-2222-222222222222'::uuid, 2, 1, NULL, now(), now())  -- Bob (host)
ON CONFLICT (id) DO NOTHING;

-- === Demo User Profiles ===
INSERT INTO shared.user_profile (user_id, nickname, avatar_url, gender, birthday, hometown, bio, location, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Alice Green', 'https://i.pravatar.cc/200?img=5', 2, '2000-05-12', 'Seattle', 'Eco enthusiast and community volunteer.', 'Seattle, WA', now(), now()),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Bob Organizer', 'https://i.pravatar.cc/200?img=12', 1, '1996-11-03', 'Austin', 'Runs local sustainability events.', 'Austin, TX', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- === Demo User Identities (Email) ===
INSERT INTO shared.user_identity (id, user_id, identity_type, identity_identifier, verified_at, is_primary, created_at, updated_at) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 1, 'alice@youthloop.dev', now(), true, now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 1, 'bob@youthloop.dev', now(), true, now(), now())
ON CONFLICT (identity_type, identity_identifier) DO NOTHING;

-- === Demo User Passwords (BCrypt) ===
-- Password123! => $2b$10$6iNKuT4I4sKaKoiywFF7V.loMVogKNvmzQqNBltCOWIOYyfAgdGnC
INSERT INTO shared.user_password (user_id, password_hash, set_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, '$2b$10$6iNKuT4I4sKaKoiywFF7V.loMVogKNvmzQqNBltCOWIOYyfAgdGnC', now(), now()),
  ('22222222-2222-2222-2222-222222222222'::uuid, '$2b$10$6iNKuT4I4sKaKoiywFF7V.loMVogKNvmzQqNBltCOWIOYyfAgdGnC', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- === Terms Acceptance (demo) ===
INSERT INTO shared.user_terms_acceptance (id, user_id, doc_type, doc_version, accepted_at, ip, user_agent) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 1, 'v1.0', now(), '127.0.0.1', 'demo-seed'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 2, 'v1.0', now(), '127.0.0.1', 'demo-seed'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 1, 'v1.0', now(), '127.0.0.1', 'demo-seed'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 2, 'v1.0', now(), '127.0.0.1', 'demo-seed')
ON CONFLICT DO NOTHING;

