-- ============================================================================
-- YouthLoop Game Schema Migration V012
-- Schema: game
-- Purpose: Add runtime UI configuration for ending display and turn transition
-- ============================================================================

ALTER TABLE game.game_runtime_param_config
  ADD COLUMN IF NOT EXISTS ending_display_seconds integer NOT NULL DEFAULT 5 CHECK (ending_display_seconds >= 1),
  ADD COLUMN IF NOT EXISTS turn_transition_animation_enabled_default boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS turn_transition_animation_seconds integer NOT NULL DEFAULT 2 CHECK (turn_transition_animation_seconds >= 1);

UPDATE game.game_runtime_param_config
SET ending_display_seconds = COALESCE(ending_display_seconds, 5),
    turn_transition_animation_enabled_default = COALESCE(turn_transition_animation_enabled_default, true),
    turn_transition_animation_seconds = COALESCE(turn_transition_animation_seconds, 2),
    config_snapshot = COALESCE(config_snapshot, '{}'::jsonb)
        || jsonb_build_object(
            'endingDisplaySeconds', COALESCE(ending_display_seconds, 5),
            'turnTransitionAnimationEnabledDefault', COALESCE(turn_transition_animation_enabled_default, true),
            'turnTransitionAnimationSeconds', COALESCE(turn_transition_animation_seconds, 2)
        ),
    updated_at = now();
