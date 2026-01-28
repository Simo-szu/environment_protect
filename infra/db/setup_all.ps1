# ============================================================================
# YouthLoop Database Complete Setup Script
# Purpose: One-click setup for the entire database
# Usage: .\setup_all.ps1
# ============================================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "------------------------------------------------------------"
Write-Host "     YouthLoop Database Complete Setup                      "
Write-Host "------------------------------------------------------------"
Write-Host ""

# Configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "youthloop"
$DB_SUPERUSER = "postgres"
$DB_PASSWORD = "postgres"

$env:PGPASSWORD = $DB_PASSWORD

# Resolve repo paths (use the same migrations as the runtime backend)
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$InitSql = Join-Path $PSScriptRoot "init\db_init_roles_schemas.sql"
$SharedMigrationsDir = Join-Path $RepoRoot "apps\social-api\src\main\resources\db\migration\shared"
$SocialMigrationsDir = Join-Path $RepoRoot "apps\social-api\src\main\resources\db\migration\social"

# Check if psql is available
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $version = psql --version
    Write-Host "[OK] PostgreSQL client found: $version" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] psql command not found!" -ForegroundColor Red
    Write-Host "Please add PostgreSQL bin to PATH:" -ForegroundColor Yellow
    Write-Host '  $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"' -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "------------------------------------------------------------"
Write-Host ""

# Step 1: Check if database exists
Write-Host "Step 1: Checking database..." -ForegroundColor Yellow
$dbExists = psql -h $DB_HOST -p $DB_PORT -U $DB_SUPERUSER -t -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>$null

if ($dbExists -match "1") {
    Write-Host "[WARN] Database '$DB_NAME' already exists" -ForegroundColor Yellow
    # $response = Read-Host "Do you want to DROP and recreate it? (yes/no)"
    $response = "yes"
    Write-Host "Do you want to DROP and recreate it? (yes/no): yes"
    if ($response -eq "yes") {
        Write-Host "Dropping existing database..." -ForegroundColor Red
        psql -h $DB_HOST -p $DB_PORT -U $DB_SUPERUSER -c "DROP DATABASE $DB_NAME WITH (FORCE);"
        Write-Host "Creating database..." -ForegroundColor Green
        psql -h $DB_HOST -p $DB_PORT -U $DB_SUPERUSER -c "CREATE DATABASE $DB_NAME;"
    } else {
        Write-Host "Skipping database creation" -ForegroundColor Gray
    }
} else {
    Write-Host "Creating database '$DB_NAME'..." -ForegroundColor Green
    psql -h $DB_HOST -p $DB_PORT -U $DB_SUPERUSER -c "CREATE DATABASE $DB_NAME;"
}

Write-Host "[OK] Database ready" -ForegroundColor Green
Write-Host ""

# Step 2: Initialize roles and schemas
Write-Host "Step 2: Initializing roles and schemas..." -ForegroundColor Yellow
psql -h $DB_HOST -p $DB_PORT -U $DB_SUPERUSER -d $DB_NAME -f $InitSql
Write-Host "[OK] Roles and schemas initialized" -ForegroundColor Green
Write-Host ""

# Step 3: Run migrations
Write-Host "Step 3: Running migrations..." -ForegroundColor Yellow

Write-Host "  -> Migrating shared schema..." -ForegroundColor Cyan
psql -h $DB_HOST -p $DB_PORT -U social_migrator -d $DB_NAME -f (Join-Path $SharedMigrationsDir "V001__init_shared.sql")
psql -h $DB_HOST -p $DB_PORT -U social_migrator -d $DB_NAME -f (Join-Path $SharedMigrationsDir "V002__extend_user_profile.sql")
psql -h $DB_HOST -p $DB_PORT -U social_migrator -d $DB_NAME -f (Join-Path $SharedMigrationsDir "V003__seed_demo_users_en.sql")

Write-Host "  -> Migrating social schema..." -ForegroundColor Cyan
psql -h $DB_HOST -p $DB_PORT -U social_migrator -d $DB_NAME -f (Join-Path $SocialMigrationsDir "V001__init_social.sql")
psql -h $DB_HOST -p $DB_PORT -U social_migrator -d $DB_NAME -f (Join-Path $SocialMigrationsDir "V003__support.sql")
psql -h $DB_HOST -p $DB_PORT -U social_migrator -d $DB_NAME -f (Join-Path $SocialMigrationsDir "V002__seed_content_test_data.sql")
psql -h $DB_HOST -p $DB_PORT -U social_migrator -d $DB_NAME -f (Join-Path $SocialMigrationsDir "V004__seed_demo_data_en.sql")

Write-Host "[OK] Migrations completed" -ForegroundColor Green
Write-Host ""

# Step 4: Verify setup
Write-Host "Step 4: Verifying setup..." -ForegroundColor Yellow

# Count tables
$sharedCount = psql -h $DB_HOST -p $DB_PORT -U social_app -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'shared';"
$socialCount = psql -h $DB_HOST -p $DB_PORT -U social_app -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'social';"

Write-Host "  Shared schema: $sharedCount tables (expected: 7)" -ForegroundColor Cyan
Write-Host "  Social schema: $socialCount tables (expected: 28)" -ForegroundColor Cyan

if ($sharedCount -ge 7 -and $socialCount -ge 28) {
    Write-Host "[OK] All tables created successfully" -ForegroundColor Green
} else {
    Write-Host "[WARN] Table count mismatch - please check logs" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Test permissions
Write-Host "Step 5: Testing permissions..." -ForegroundColor Yellow

# Test social_app can query
$testQuery = psql -h $DB_HOST -p $DB_PORT -U social_app -d $DB_NAME -t -c "SELECT 'OK';" 2>&1
if ($testQuery -match "OK") {
    Write-Host "[OK] social_app can connect and query" -ForegroundColor Green
} else {
    Write-Host "[FAIL] social_app connection failed" -ForegroundColor Red
}

# Test social_app cannot create tables
$testDDL = psql -h $DB_HOST -p $DB_PORT -U social_app -d $DB_NAME -c "CREATE TABLE social._test(id int);" 2>&1
if ($testDDL -match "permission denied") {
    Write-Host "[OK] social_app DDL blocked (correct)" -ForegroundColor Green
} else {
    Write-Host "[WARN] social_app has DDL permissions (unexpected)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "------------------------------------------------------------"
Write-Host "              Setup Complete!                               "
Write-Host "------------------------------------------------------------"
Write-Host ""
Write-Host "Database Information:" -ForegroundColor Cyan
Write-Host "  Host:     $DB_HOST" -ForegroundColor Gray
Write-Host "  Port:     $DB_PORT" -ForegroundColor Gray
Write-Host "  Database: $DB_NAME" -ForegroundColor Gray
Write-Host ""
Write-Host "Connection Strings:" -ForegroundColor Cyan
Write-Host "  Social App: postgresql://social_app:postgres@$DB_HOST`:$DB_PORT/$DB_NAME" -ForegroundColor Gray
Write-Host "  Game App:   postgresql://game_app:postgres@$DB_HOST`:$DB_PORT/$DB_NAME" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Copy .env.example to .env.local" -ForegroundColor Gray
Write-Host "  2. Update DATABASE_URL in .env.local" -ForegroundColor Gray
Write-Host "  3. Start backend development (Spring Boot)" -ForegroundColor Gray
Write-Host ""
