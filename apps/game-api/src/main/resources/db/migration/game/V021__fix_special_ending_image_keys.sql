-- ============================================================================
-- YouthLoop Game Schema Migration V021
-- Schema: game
-- Purpose: Fix image_key for special endings 19 and 21 to use dedicated images
-- ============================================================================

-- Update image_key for ending 19: zero_trade_ecology_priority
UPDATE game.game_ending_content_config
SET
    image_key = 'endings/零交易稳健结局.jpg',
    updated_at = now()
WHERE ending_id = 'zero_trade_ecology_priority';

-- Update image_key for ending 21: speedrun_efficient_layout
UPDATE game.game_ending_content_config
SET
    image_key = 'endings/快速通关结局.jpg',
    updated_at = now()
WHERE ending_id = 'speedrun_efficient_layout';
