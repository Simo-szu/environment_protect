-- ============================================================================
-- YouthLoop Shared Schema Migration V001
-- Schema: shared
-- Purpose: User identity, authentication, and cross-service minimal data
-- ============================================================================

-- === User Table ===
CREATE TABLE shared.user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role int NOT NULL DEFAULT 1, -- 1=user 2=host 3=admin
  status int NOT NULL DEFAULT 1, -- 1=active 2=blocked
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_role ON shared.user(role);
CREATE INDEX idx_user_status ON shared.user(status);

-- === User Profile ===
CREATE TABLE shared.user_profile (
  user_id uuid PRIMARY KEY,
  nickname text,
  avatar_url text,
  gender int, -- 0/null=unknown, 1=male, 2=female
  birthday timestamptz,
  hometown text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_profile_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE
);

-- === User Identity (email/phone/google) ===
CREATE TABLE shared.user_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  identity_type int NOT NULL, -- 1=EMAIL 2=PHONE 3=GOOGLE
  identity_identifier text NOT NULL, -- email(lowercased) / phone(E.164) / google_sub
  verified_at timestamptz,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_identity_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE,
  CONSTRAINT uq_identity_type_identifier UNIQUE (identity_type, identity_identifier)
);

CREATE INDEX idx_user_identity_user_id ON shared.user_identity(user_id);
CREATE INDEX idx_user_identity_type_identifier ON shared.user_identity(identity_type, identity_identifier);

-- === User Password ===
CREATE TABLE shared.user_password (
  user_id uuid PRIMARY KEY,
  password_hash text NOT NULL,
  set_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_password_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE
);

-- === Auth Refresh Token ===
CREATE TABLE shared.auth_refresh_token (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  device_id text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_auth_refresh_token_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_refresh_token_user_created ON shared.auth_refresh_token(user_id, created_at);
CREATE INDEX idx_auth_refresh_token_expires ON shared.auth_refresh_token(expires_at);

-- === Verification Code (OTP) ===
CREATE TABLE shared.verification_code (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account text NOT NULL, -- email/phone
  channel int NOT NULL, -- 1=email 2=sms
  purpose int NOT NULL, -- 1=register 2=login 3=reset_pwd
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_code_account_purpose ON shared.verification_code(account, purpose, created_at);
CREATE INDEX idx_verification_code_expires ON shared.verification_code(expires_at);

-- === User Terms Acceptance (Compliance) ===
CREATE TABLE shared.user_terms_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  doc_type int NOT NULL, -- 1=terms 2=privacy
  doc_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip text,
  user_agent text,
  CONSTRAINT fk_user_terms_acceptance_user FOREIGN KEY (user_id) REFERENCES shared.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_terms_acceptance_user_doc ON shared.user_terms_acceptance(user_id, doc_type, accepted_at);
