-- ============================================================================
-- YouthLoop Database Initialization Script
-- Purpose: Create roles, schemas, and set up permissions
-- Target: PostgreSQL instance (database: youthloop)
-- ============================================================================

-- === 1. Create UUID Extension ===
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- === 2. Create Roles (Accounts) ===
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='social_migrator') THEN
    CREATE ROLE social_migrator LOGIN PASSWORD 'postgres';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='social_app') THEN
    CREATE ROLE social_app LOGIN PASSWORD 'postgres';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='game_migrator') THEN
    CREATE ROLE game_migrator LOGIN PASSWORD 'postgres';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='game_app') THEN
    CREATE ROLE game_app LOGIN PASSWORD 'postgres';
  END IF;
END $$;

-- === 3. Create Schemas (with ownership) ===
CREATE SCHEMA IF NOT EXISTS shared AUTHORIZATION social_migrator;
CREATE SCHEMA IF NOT EXISTS social AUTHORIZATION social_migrator;
CREATE SCHEMA IF NOT EXISTS game AUTHORIZATION game_migrator;

-- === 4. Secure public schema ===
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- === 5. Set default search_path for app roles ===
ALTER ROLE social_app SET search_path = social, shared;
ALTER ROLE game_app SET search_path = game, shared;

-- === 6. Grant USAGE on schemas ===
GRANT USAGE ON SCHEMA shared TO social_app, game_app;
GRANT USAGE ON SCHEMA social TO social_app;
GRANT USAGE ON SCHEMA game TO game_app;

-- === 7. Grant DDL permissions to migrators ===
GRANT ALL ON SCHEMA shared TO social_migrator;
GRANT ALL ON SCHEMA social TO social_migrator;
GRANT ALL ON SCHEMA game TO game_migrator;

-- === 8. Set default privileges for future tables ===

-- social_app: full DML on shared + social
ALTER DEFAULT PRIVILEGES FOR ROLE social_migrator IN SCHEMA shared
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO social_app;

ALTER DEFAULT PRIVILEGES FOR ROLE social_migrator IN SCHEMA social
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO social_app;

-- game_app: full DML on game, read-only on shared
ALTER DEFAULT PRIVILEGES FOR ROLE game_migrator IN SCHEMA game
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO game_app;

ALTER DEFAULT PRIVILEGES FOR ROLE social_migrator IN SCHEMA shared
  GRANT SELECT ON TABLES TO game_app;

-- === 9. Set default privileges for sequences ===
ALTER DEFAULT PRIVILEGES FOR ROLE social_migrator IN SCHEMA shared
  GRANT USAGE, SELECT ON SEQUENCES TO social_app;

ALTER DEFAULT PRIVILEGES FOR ROLE social_migrator IN SCHEMA social
  GRANT USAGE, SELECT ON SEQUENCES TO social_app;

ALTER DEFAULT PRIVILEGES FOR ROLE game_migrator IN SCHEMA game
  GRANT USAGE, SELECT ON SEQUENCES TO game_app;

-- === 10. Grant permissions on existing objects ===
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA shared TO social_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA social TO social_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA shared TO social_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA social TO social_app;

GRANT SELECT ON ALL TABLES IN SCHEMA shared TO game_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA game TO game_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA shared TO game_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA game TO game_app;

-- === Initialization Complete ===
