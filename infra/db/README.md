# YouthLoop Database Setup

## Overview

This directory contains database initialization scripts and migrations for the YouthLoop project.

**Database Structure:**
- 1 PostgreSQL instance
- 3 schemas: `shared`, `social`, `game`
- 4 roles: `social_migrator`, `social_app`, `game_migrator`, `game_app`

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
- 4 roles with proper permissions
- 3 schemas (shared, social, game)
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

Expected output:
- ✅ social_migrator can create/drop tables
- ✅ social_app cannot create tables (DDL blocked)
- ✅ social_app can write shared (rolled back)
- ✅ game_app has read-only access to shared

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

### game schema
**Owner:** game_migrator  
**Purpose:** Game service business data (to be defined)

## Role Permissions

| Role | Schema | Permissions |
|------|--------|-------------|
| social_migrator | shared, social | DDL (CREATE/ALTER/DROP) + DML |
| social_app | shared, social | DML only (SELECT/INSERT/UPDATE/DELETE) |
| game_migrator | game | DDL + DML |
| game_app | game | DML only |
| game_app | shared | SELECT only (read-only) |

## Connection Strings

**For Social Service (API/Worker):**
```
postgresql://social_app:postgres@localhost:5432/youthloop
```

**For Game Service:**
```
postgresql://game_app:postgres@localhost:5432/youthloop
```

**For Migrations (Social):**
```
postgresql://social_migrator:postgres@localhost:5432/youthloop
```

## Flyway Integration (Future)

When integrating with Flyway:

**Social Service:**
- schemas: `shared,social`
- defaultSchema: `social`
- table: `flyway_schema_history_social`
- user: `social_migrator`

**Game Service:**
- schemas: `game`
- defaultSchema: `game`
- table: `flyway_schema_history_game`
- user: `game_migrator`

## Troubleshooting

### psql not found
Add PostgreSQL bin to PATH:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
```

### Permission denied
Ensure you're using the correct role:
- Migrations: use `social_migrator` or `game_migrator`
- Application: use `social_app` or `game_app`

### Connection refused
Check PostgreSQL service is running:
```powershell
Get-Service postgresql*
```

## Next Steps

After database setup:
1. Update `.env.local` with connection strings
2. Proceed to backend development (Spring Boot)
3. Configure Flyway in `apps/social-api` and `apps/game-api`
