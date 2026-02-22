# YouthLoop Database Setup

## Overview

This directory contains database **infrastructure initialization** scripts (roles, schemas, and permissions) for the YouthLoop project. 

**Business migrations** (tables, data) are managed by Flyway within each application's `src/main/resources/db/migration` directory.

**Database Structure:**
- 1 PostgreSQL instance
- 3 schemas: `shared`, `social`, `game`
- App roles: `social_app`, `game_app`
- Migration roles: `social_migrator`, `game_migrator`


## Quick Start

### Prerequisites

1. PostgreSQL installed (version 14+)
2. `psql` command available in PATH
3. PostgreSQL service running

### Step 1: Create Database

```powershell
# Connect as postgres superuser
psql -U postgres -h localhost -p 5432

# Create database
CREATE DATABASE youthloop;

# Exit
\q
```

### Step 2: Initialize Roles and Schemas

```powershell
# Run initialization script
psql -U postgres -h localhost -p 5432 -d youthloop -f infra/db/init/db_init_roles_schemas.sql
```

This creates:
- Roles with proper permissions (`social_migrator`, `social_app`, etc.)
- Schemas (`shared`, `social`, `game`)
- Default privileges for future tables

### Step 3: Run Business Migrations (Automatic)

Business table structures (Migrations) are now handled **automatically** by Flyway within each application. 

**Do not** manually run migration scripts from this directory. Instead, simply start the application:

```powershell
# Social API (Automatically applies shared + social migrations)
mvn -pl apps/social-api spring-boot:run
```


### Step 4: Verify Permissions

```powershell
psql -U postgres -d youthloop -f infra/db/scripts/verify_permissions.sql
```

Note: this repo does not currently include `infra/db/scripts/verify_permissions.sql`.
Use the quick checks below instead.

**Check pgcrypto is enabled (required for `gen_random_uuid()`):**
```sql
SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto';
```

**Check roles and schemas exist:**
```sql
SELECT rolname FROM pg_roles
WHERE rolname IN ('social_migrator','social_app','game_migrator','game_app');

SELECT nspname FROM pg_namespace
WHERE nspname IN ('shared','social','game');
```

**Permission expectations:**
- ✅ `social_migrator` can create/drop tables in `shared` + `social`
- ✅ `social_app` cannot create tables (DDL blocked)
- ✅ `social_app` can read/write `shared` + `social` (DML only)
- ✅ `game_migrator` can create/drop tables in `game`
- ✅ `game_app` can read/write `game`, and read `shared`

## Schema Organization

### shared schema
**Owner:** social_migrator  
**Purpose:** Cross-service minimal identity data

Tables:
- `user` - User accounts
- `user_profile` - User profiles
- `user_identity` - Email/phone/OAuth identities
- `user_password` - Password hashes
- `auth_refresh_token` - Refresh tokens
- `verification_code` - OTP codes
- `user_terms_acceptance` - Terms/privacy acceptance

### social schema
**Owner:** social_migrator  
**Purpose:** Social service business data

Tables:
- Content: `content`, `content_stats`
- Activity: `activity`, `activity_session`, `activity_stats`, `activity_signup`
- Host: `host_profile`, `host_verification`
- Interaction: `comment`, `comment_stats`, `reaction`, `notification`
- Points: `points_account`, `points_ledger`, `signin_record`
- Tasks: `daily_task`, `daily_task_progress`, `daily_quiz`, `daily_quiz_record`
- Badges: `badge`, `user_badge`
- System: `home_banner`, `hot_score_rule`, `user_event`, `weekly_recommendation`, `outbox_event`

v0.1 Social schema table count: **26** (as listed above).



## Role Permissions

| Role | Schema | Permissions |
|------|--------|-------------|
| social_migrator | shared, social | DDL (CREATE/ALTER/DROP) + DML |
| social_app | shared, social | DML only (SELECT/INSERT/UPDATE/DELETE) |
| game_migrator | game | DDL (CREATE/ALTER/DROP) + DML |
| game_app | game, shared | DML on `game`, SELECT on `shared` |

## Connection Strings

**For Social Service (API/Worker):**
```
jdbc:postgresql://localhost:5432/youthloop?currentSchema=social,shared&stringtype=unspecified&user=social_app&password=postgres
```



**For Migrations (Social):**
```
jdbc:postgresql://localhost:5432/youthloop?currentSchema=social,shared&stringtype=unspecified
```

**For Game Service (API):**
```
jdbc:postgresql://localhost:5432/youthloop?currentSchema=game,shared&stringtype=unspecified&user=game_app&password=postgres
```

**For Migrations (Game):**
```
jdbc:postgresql://localhost:5432/youthloop?currentSchema=game,shared&stringtype=unspecified
```

## Flyway (Current)

Flyway is now integrated into the Spring Boot apps and is the default way to run schema migrations.
This follows `Project-Structure.md` requirements:
- 1 Postgres instance, 3 schemas: `shared`, `social`, `game`
- Separate Flyway history tables per service (no cross-service conflicts)
- Use migrator roles for DDL (apps still connect with app roles)

**Social Service:**
- schemas: `shared,social`
- defaultSchema: `social`
- table: `flyway_schema_history_social`
- user: `social_migrator` (DDL via Flyway)
- locations (classpath):
  - `apps/social-api/src/main/resources/db/migration/shared`
  - `apps/social-api/src/main/resources/db/migration/social`

**Game Service:**
- schemas: `game`
- defaultSchema: `game`
- table: `flyway_schema_history_game`
- user: `game_migrator` (DDL via Flyway)
- locations (classpath):
  - `apps/game-api/src/main/resources/db/migration/game`



### How to run migrations (recommended)

Start each service once; Flyway runs automatically on startup using the configured migrator credentials:

```powershell
# Social API (runs shared + social migrations)
mvn -pl apps/social-api spring-boot:run

# Game API (runs game migrations)
mvn -pl apps/game-api spring-boot:run


```

Notes:
- Configure `FLYWAY_USER` / `FLYWAY_PASSWORD` in `.env`.
- Configure `GAME_FLYWAY_USER` / `GAME_FLYWAY_PASSWORD` in `.env`.
- Runtime apps use `DATABASE_URL` (social) and `GAME_DATABASE_URL` (game) for normal DML.

## Troubleshooting

### psql not found
Add PostgreSQL bin to PATH:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
```

### Permission denied
Ensure you're using the correct role:
- Migrations: use `social_migrator`
- Application: use `social_app`
- Migrations (game): use `game_migrator`
- Application (game): use `game_app`

### Connection refused
Check PostgreSQL service is running:
```powershell
Get-Service postgresql*
```

## Next Steps

After database setup:
1. Update repository root `.env` with connection strings
2. Start services once to apply Flyway migrations
