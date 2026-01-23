# ============================================================================
# Run Database Migrations (PowerShell)
# Purpose: Execute SQL migrations as social_migrator
# ============================================================================

$ErrorActionPreference = "Stop"

$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "youthloop" }
$DB_USER = "social_migrator"
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }

$env:PGPASSWORD = $DB_PASSWORD

Write-Host "=== Running Shared Schema Migration ===" -ForegroundColor Green
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ..\migrations\shared\V001__init_shared.sql

Write-Host ""
Write-Host "=== Running Social Schema Migration ===" -ForegroundColor Green
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ..\migrations\social\V001__init_social.sql

Write-Host ""
Write-Host "=== Migrations Complete ===" -ForegroundColor Green
