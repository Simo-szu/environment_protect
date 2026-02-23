-- ============================================================================
-- YouthLoop Game Schema Migration V013
-- Schema: game
-- Purpose: Add runtime toggle for free board placement
-- ============================================================================

ALTER TABLE game.game_runtime_param_config
  ADD COLUMN IF NOT EXISTS free_placement_enabled boolean NOT NULL DEFAULT true;

UPDATE game.game_runtime_param_config
SET free_placement_enabled = COALESCE(free_placement_enabled, true),
    config_snapshot = COALESCE(config_snapshot, '{}'::jsonb)
        || jsonb_build_object(
            'freePlacementEnabled', COALESCE(free_placement_enabled, true)
        ),
    updated_at = now();
