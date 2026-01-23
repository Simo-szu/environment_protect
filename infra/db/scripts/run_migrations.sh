#!/bin/bash
# ============================================================================
# Run Database Migrations
# Purpose: Execute SQL migrations as social_migrator
# ============================================================================

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-youthloop}"
DB_USER="social_migrator"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

echo "=== Running Shared Schema Migration ==="
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f ../migrations/shared/V001__init_shared.sql

echo ""
echo "=== Running Social Schema Migration ==="
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f ../migrations/social/V001__init_social.sql

echo ""
echo "=== Migrations Complete ==="
