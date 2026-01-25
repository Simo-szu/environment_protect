# YouthLoop Database Setup

## Overview

This directory contains database initialization scripts and migrations for the YouthLoop project.

**Database Structure:**
- 1 PostgreSQL instance
- 3 schemas: `shared`, `social`
- 2 roles: `social_migrator`, `social_app`

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
- 2 roles with proper permissions
- 2 schemas (shared, social)
- Default privileges for future tables

### Step 3: Run Migrations

**Option A: Using PowerShell script**
```powershell
cd infra/db/scripts
.\run_migrations.ps1
```

**Option B: Manual execution**
```powershell
# Set password
$env:PGPASSWORD = "postgres"

# Run shared migration
psql -U social_migrator -h localhost -p 5432 -d youthloop -f infra/db/migrations/shared/V001__init_shared.sql

# Run social migration
psql -U social_migrator -h localhost -p 5432 -d youthloop -f infra/db/migrations/social/V001__init_social.sql
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
WHERE rolname IN ('social_migrator','social_app');

SELECT nspname FROM pg_namespace
WHERE nspname IN ('shared','social');
```

**Permission expectations:**
- ✅ `social_migrator` can create/drop tables in `shared` + `social`
- ✅ `social_app` cannot create tables (DDL blocked)
- ✅ `social_app` can read/write `shared` + `social` (DML only)

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

## Connection Strings

**For Social Service (API/Worker):**
```
postgresql://social_app:postgres@localhost:5432/youthloop
```



**For Migrations (Social):**
```
postgresql://social_migrator:postgres@localhost:5432/youthloop
```

## Flyway (Current)

Flyway is now integrated into the Spring Boot apps and is the default way to run schema migrations.
This follows `Project-Structure.md` requirements:
- 1 Postgres instance, 2 schemas: `shared`, `social`
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



### How to run migrations (recommended)

Start each service once; Flyway runs automatically on startup using the configured migrator credentials:

```powershell
# Social API (runs shared + social migrations)
mvn -pl apps/social-api spring-boot:run


```

Notes:
- Configure `FLYWAY_USER` / `FLYWAY_PASSWORD` (defaults are `social_migrator`).
- Apps still use `DB_USER` / `DB_PASSWORD` for normal runtime DML.

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

### Connection refused
Check PostgreSQL service is running:
```powershell
Get-Service postgresql*
```

## Next Steps

After database setup:
1. Update `.env.local` with connection strings
2. Start services once to apply Flyway migrations
