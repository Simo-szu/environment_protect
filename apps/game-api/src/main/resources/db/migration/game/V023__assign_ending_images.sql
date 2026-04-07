-- ============================================================================
-- YouthLoop Game Schema Migration V023
-- Schema: game
-- Purpose: Assign image_key to all 17 endings
-- ============================================================================

-- 结局1：零交易稳健·生态优先 → 零交易稳健结局.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/零交易稳健结局.jpg', updated_at = now()
WHERE ending_id = 'ending_01_zero_trade_ecology';

-- 结局2：全政策解锁·策略全能 → 全政策解锁·策略全能.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/全政策解锁·策略全能.jpg', updated_at = now()
WHERE ending_id = 'ending_02_all_policy_master';

-- 结局3：产业巅峰·低碳翻盘 → 产业巅峰·低碳翻盘.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/产业巅峰·低碳翻盘.jpg', updated_at = now()
WHERE ending_id = 'ending_03_industry_peak_lowcarbon';

-- 结局4：深碳标杆·零碳领航 → 深碳标杆·零碳领航.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/深碳标杆·零碳领航.jpg', updated_at = now()
WHERE ending_id = 'ending_04_shenzhen_zero_carbon_legend';

-- 结局5：湾区碳核·全域协同 → 湾区碳核·全域协同.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/湾区碳核·全域协同.jpg', updated_at = now()
WHERE ending_id = 'ending_05_bay_area_carbon_core';

-- 结局6：科创低碳·技术赋能 → 创新科技结局.webp
UPDATE game.game_ending_content_config SET image_key = 'endings/创新科技结局.webp', updated_at = now()
WHERE ending_id = 'ending_06_sci_tech_lowcarbon';

-- 结局7：生态宜居·碳汇典范 → 生态优先结局.webp
UPDATE game.game_ending_content_config SET image_key = 'endings/生态优先结局.webp', updated_at = now()
WHERE ending_id = 'ending_07_ecology_livable';

-- 结局8：产业低碳·效益双赢 → 快速通关结局.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/快速通关结局.jpg', updated_at = now()
WHERE ending_id = 'ending_08_industry_lowcarbon_winwin';

-- 结局9：民生低碳·共建共享 → 甜甜圈结局.webp
UPDATE game.game_ending_content_config SET image_key = 'endings/甜甜圈结局.webp', updated_at = now()
WHERE ending_id = 'ending_09_livelihood_lowcarbon';

-- 结局10：均衡稳健·稳步前行 → 均衡稳健·稳步前行.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/均衡稳健·稳步前行.jpg', updated_at = now()
WHERE ending_id = 'ending_10_balanced_steady';

-- 结局11：专长突破·专项发力 → 零交易稳健结局.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/零交易稳健结局.jpg', updated_at = now()
WHERE ending_id = 'ending_11_specialty_breakthrough';

-- 结局12：基础达标·稳步起步 → 零交易稳健结局.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/零交易稳健结局.jpg', updated_at = now()
WHERE ending_id = 'ending_12_basic_qualified';

-- 结局13：初探规划·潜力可期 → 生态优先结局.webp
UPDATE game.game_ending_content_config SET image_key = 'endings/生态优先结局.webp', updated_at = now()
WHERE ending_id = 'ending_13_novice_potential';

-- 结局14：顺利完成·规划合格 → 快速通关结局.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/快速通关结局.jpg', updated_at = now()
WHERE ending_id = 'ending_14_pass';

-- 结局15：稳步探索·持续优化 → 稳步探索·持续优化.jpg
UPDATE game.game_ending_content_config SET image_key = 'endings/稳步探索·持续优化.jpg', updated_at = now()
WHERE ending_id = 'ending_15_explore';

-- 结局16：排放失控·发展失速 → 失败结局.webp
UPDATE game.game_ending_content_config SET image_key = 'endings/失败结局.webp', updated_at = now()
WHERE ending_id = 'ending_16_emission_out_of_control';

-- 结局17：配额崩盘·运营失效 → 失败结局.webp
UPDATE game.game_ending_content_config SET image_key = 'endings/失败结局.webp', updated_at = now()
WHERE ending_id = 'ending_17_quota_collapse';
