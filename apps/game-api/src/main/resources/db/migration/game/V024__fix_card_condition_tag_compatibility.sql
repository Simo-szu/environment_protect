-- ============================================================================
-- YouthLoop Game Schema Migration V024
-- Schema: game
-- Purpose: Fix unreachable core card condition tags and add compatibility tags
-- ============================================================================

-- card056 should no longer rely on a legacy flood_processed tag gate.
UPDATE game.game_card
SET
    core_condition_min_tagged_cards = 0,
    core_condition_required_tag = '',
    core_condition_ext = jsonb_set(
        jsonb_set(COALESCE(core_condition_ext, '{}'::jsonb), '{core_condition_min_tagged_cards}', '0'::jsonb, true),
        '{core_condition_required_tag}', '""'::jsonb, true
    ),
    updated_at = now()
WHERE card_id = 'card056';

-- Normalize shenzhen ecology condition tag to an existing runtime tag.
UPDATE game.game_card
SET
    core_condition_required_tag = 'shenzhen_ecology',
    core_condition_ext = jsonb_set(
        COALESCE(core_condition_ext, '{}'::jsonb),
        '{core_condition_required_tag}',
        '"shenzhen_ecology"'::jsonb,
        true
    ),
    updated_at = now()
WHERE card_id = 'card064'
  AND core_condition_required_tag = 'shenzhen_featured_ecology';

-- Add a generic ecology_card tag for ecology-domain core cards.
INSERT INTO game.game_card_tag_map (card_id, tag_code)
SELECT card_id, 'ecology_card'
FROM game.game_card
WHERE card_type = 'core' AND domain = 'ecology'
ON CONFLICT (card_id, tag_code) DO UPDATE
SET is_enabled = true,
    updated_at = now();

-- Keep backward compatibility for historical shenzhen_featured_ecology references.
INSERT INTO game.game_card_tag_map (card_id, tag_code)
SELECT card_id, 'shenzhen_featured_ecology'
FROM game.game_card_tag_map
WHERE tag_code = 'shenzhen_ecology'
ON CONFLICT (card_id, tag_code) DO UPDATE
SET is_enabled = true,
    updated_at = now();
