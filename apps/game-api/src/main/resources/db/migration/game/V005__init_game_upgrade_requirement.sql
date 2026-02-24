-- ============================================================================
-- YouthLoop Game Schema Migration V015
-- Schema: game
-- Purpose: Create upgrade requirement table and seed upgrade path data
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_card_upgrade_requirement (
    card_id              text        PRIMARY KEY,
    from_star            integer     NOT NULL CHECK (from_star >= 1),
    to_star              integer     NOT NULL CHECK (to_star > from_star),
    -- Domain progress thresholds (up to 2 domains combined)
    req_domain_1         text        DEFAULT NULL CHECK (req_domain_1 IN ('industry','ecology','science','society')),
    req_domain_1_min_pct integer     NOT NULL DEFAULT 0,
    req_domain_2         text        DEFAULT NULL CHECK (req_domain_2 IN ('industry','ecology','science','society')),
    req_domain_2_min_pct integer     NOT NULL DEFAULT 0,
    -- Upgrade resource costs
    cost_industry        integer     NOT NULL DEFAULT 0,
    cost_tech            integer     NOT NULL DEFAULT 0,
    cost_population      integer     NOT NULL DEFAULT 0,
    cost_green           integer     NOT NULL DEFAULT 0,
    -- JSONB snapshot for frontend consumption
    config_snapshot      jsonb       NOT NULL DEFAULT '{}'::jsonb,
    is_enabled           boolean     NOT NULL DEFAULT true,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_upgrade_req_card FOREIGN KEY (card_id)
        REFERENCES game.game_card(card_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_upgrade_req_enabled ON game.game_card_upgrade_requirement(is_enabled);

INSERT INTO game.game_card_upgrade_requirement
    (card_id, from_star, to_star,
     req_domain_1, req_domain_1_min_pct, req_domain_2, req_domain_2_min_pct,
     cost_industry, cost_tech, cost_population, cost_green,
     config_snapshot)
VALUES
    -- Industry 1→2
    ('card001',1,2,'industry',20,NULL,0, 10, 0,0,0, '{"req":"industry>=20%","cost":{"industry":10}}'),
    ('card002',1,2,'industry',20,NULL,0,  8, 0,0,0, '{"req":"industry>=20%","cost":{"industry":8}}'),
    ('card003',1,2,'industry',20,NULL,0, 12, 0,0,0, '{"req":"industry>=20%","cost":{"industry":12}}'),
    ('card004',1,2,'industry',20,NULL,0, 10, 0,0,0, '{"req":"industry>=20%","cost":{"industry":10}}'),
    -- Industry 2→3
    ('card005',2,3,'industry',40,NULL,0, 30,10,0,0, '{"req":"industry>=40%","cost":{"industry":30,"tech":10}}'),
    ('card006',2,3,'industry',40,NULL,0, 35,10,0,0, '{"req":"industry>=40%","cost":{"industry":35,"tech":10}}'),
    ('card007',2,3,'industry',40,NULL,0, 40,12,0,0, '{"req":"industry>=40%","cost":{"industry":40,"tech":12}}'),
    ('card008',2,3,'industry',40,NULL,0, 38,10,0,0, '{"req":"industry>=40%","cost":{"industry":38,"tech":10}}'),
    ('card011',2,3,'industry',40,NULL,0, 28, 8,0,0, '{"req":"industry>=40%","cost":{"industry":28,"tech":8}}'),
    ('card012',2,3,'industry',40,NULL,0, 25, 6,0,0, '{"req":"industry>=40%","cost":{"industry":25,"tech":6}}'),
    ('card013',2,3,'industry',40,NULL,0, 32, 9,0,0, '{"req":"industry>=40%","cost":{"industry":32,"tech":9}}'),
    ('card014',2,3,'industry',40,NULL,0, 36,10,0,0, '{"req":"industry>=40%","cost":{"industry":36,"tech":10}}'),
    ('card019',2,3,'industry',50,NULL,0, 15, 5,0,0, '{"req":"industry>=50%","cost":{"industry":15,"tech":5}}'),
    ('card020',2,3,'industry',50,NULL,0, 25, 6,0,0, '{"req":"industry>=50%","cost":{"industry":25,"tech":6}}'),
    -- Ecology 1→2
    ('card021',1,2,'ecology',20,NULL,0,  8, 0,0,0, '{"req":"ecology>=20%","cost":{"industry":8}}'),
    ('card022',1,2,'ecology',20,NULL,0,  6, 0,0,0, '{"req":"ecology>=20%","cost":{"industry":6}}'),
    ('card023',1,2,'ecology',20,NULL,0, 10, 0,0,0, '{"req":"ecology>=20%","cost":{"industry":10}}'),
    ('card024',1,2,'ecology',20,NULL,0, 12, 0,0,0, '{"req":"ecology>=20%","cost":{"industry":12}}'),
    -- Ecology 2→3
    ('card025',2,3,'ecology',40,NULL,0, 25,0,0,5, '{"req":"ecology>=40%","cost":{"industry":25,"green":5}}'),
    ('card026',2,3,'ecology',40,NULL,0, 28,0,0,6, '{"req":"ecology>=40%","cost":{"industry":28,"green":6}}'),
    ('card027',2,3,'ecology',40,NULL,0, 22,0,0,4, '{"req":"ecology>=40%","cost":{"industry":22,"green":4}}'),
    ('card028',2,3,'ecology',40,NULL,0, 24,0,0,5, '{"req":"ecology>=40%","cost":{"industry":24,"green":5}}'),
    ('card031',2,3,'ecology',50,NULL,0, 18,5,0,8, '{"req":"ecology>=50%","cost":{"industry":18,"tech":5,"green":8}}'),
    ('card032',2,3,'ecology',50,NULL,0, 26,6,0,5, '{"req":"ecology>=50%","cost":{"industry":26,"tech":6,"green":5}}'),
    ('card033',2,3,'ecology',40,NULL,0, 29,0,0,6, '{"req":"ecology>=40%","cost":{"industry":29,"green":6}}'),
    ('card034',2,3,'ecology',40,NULL,0, 23,0,0,4, '{"req":"ecology>=40%","cost":{"industry":23,"green":4}}'),
    ('card035',2,3,'ecology',50,NULL,0, 15,4,0,6, '{"req":"ecology>=50%","cost":{"industry":15,"tech":4,"green":6}}'),
    -- Science 1→2
    ('card036',1,2,'science',20,NULL,0, 15,0,0,0, '{"req":"science>=20%","cost":{"industry":15}}'),
    ('card037',1,2,'science',20,NULL,0, 12,0,0,0, '{"req":"science>=20%","cost":{"industry":12}}'),
    -- Science 2→3
    ('card038',2,3,'science',40,NULL,0, 30, 8,0,0, '{"req":"science>=40%","cost":{"industry":30,"tech":8}}'),
    ('card039',2,3,'science',40,NULL,0, 35,10,0,0, '{"req":"science>=40%","cost":{"industry":35,"tech":10}}'),
    ('card040',2,3,'science',40,NULL,0, 32, 9,0,0, '{"req":"science>=40%","cost":{"industry":32,"tech":9}}'),
    ('card041',2,3,'science',40,NULL,0, 28, 7,0,0, '{"req":"science>=40%","cost":{"industry":28,"tech":7}}'),
    ('card044',2,3,'science',50,NULL,0, 10, 8,0,0, '{"req":"science>=50%","cost":{"industry":10,"tech":8}}'),
    ('card045',2,3,'science',50,NULL,0, 25, 9,0,0, '{"req":"science>=50%","cost":{"industry":25,"tech":9}}'),
    -- Society 1→2
    ('card046',1,2,'society',20,NULL,0,  5,0,0,0, '{"req":"society>=20%","cost":{"industry":5}}'),
    ('card047',1,2,'society',20,NULL,0,  4,0,0,0, '{"req":"society>=20%","cost":{"industry":4}}'),
    -- Society 2→3
    ('card048',2,3,'society',40,NULL,0, 20,0,3,0, '{"req":"society>=40%","cost":{"industry":20,"population":3}}'),
    ('card049',2,3,'society',40,NULL,0, 25,0,4,0, '{"req":"society>=40%","cost":{"industry":25,"population":4}}'),
    ('card050',2,3,'society',40,NULL,0, 18,0,2,0, '{"req":"society>=40%","cost":{"industry":18,"population":2}}'),
    ('card051',2,3,'society',40,NULL,0, 22,0,3,0, '{"req":"society>=40%","cost":{"industry":22,"population":3}}'),
    ('card053',2,3,'society',50,NULL,0, 12,0,5,0, '{"req":"society>=50%","cost":{"industry":12,"population":5}}'),
    -- Former special/subsidy cards (now regular core, 2→3)
    ('card054',2,3,'science', 50,NULL,0, 10,5,0,0, '{"req":"science>=50%","cost":{"industry":10,"tech":5}}'),
    ('card055',2,3,'industry',50,NULL,0,  8,4,0,0, '{"req":"industry>=50%","cost":{"industry":8,"tech":4}}'),
    ('card056',2,3,'ecology', 50,NULL,0,  6,3,0,0, '{"req":"ecology>=50%","cost":{"industry":6,"tech":3}}'),
    ('card057',2,3,'industry',50,NULL,0, 10,6,0,0, '{"req":"industry>=50%","cost":{"industry":10,"tech":6}}'),
    ('card059',2,3,'ecology', 50,NULL,0,  8,5,0,8, '{"req":"ecology>=50%","cost":{"industry":8,"tech":5,"green":8}}')
ON CONFLICT (card_id) DO UPDATE SET
    from_star            = EXCLUDED.from_star,
    to_star              = EXCLUDED.to_star,
    req_domain_1         = EXCLUDED.req_domain_1,
    req_domain_1_min_pct = EXCLUDED.req_domain_1_min_pct,
    req_domain_2         = EXCLUDED.req_domain_2,
    req_domain_2_min_pct = EXCLUDED.req_domain_2_min_pct,
    cost_industry        = EXCLUDED.cost_industry,
    cost_tech            = EXCLUDED.cost_tech,
    cost_population      = EXCLUDED.cost_population,
    cost_green           = EXCLUDED.cost_green,
    config_snapshot      = EXCLUDED.config_snapshot,
    updated_at           = now();
