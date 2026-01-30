-- ============================================================================
-- YouthLoop Social Schema Migration V105
-- Purpose: Exchange Store (Goods and Orders)
-- ============================================================================

-- === Exchange Goods ===
CREATE TABLE social.exchange_good (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    image_url text,
    points_cost int NOT NULL,
    stock int NOT NULL DEFAULT 0,
    status int NOT NULL DEFAULT 1, -- 1=on_shelf 2=off_shelf
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exchange_good_status_cost ON social.exchange_good (status, points_cost);

-- === Exchange Order ===
CREATE TABLE social.exchange_order (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    good_id uuid NOT NULL,
    points_cost int NOT NULL,
    status int NOT NULL DEFAULT 1, -- 1=placed 2=shipped 3=delivered 4=cancelled
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_exchange_order_user FOREIGN KEY (user_id) REFERENCES shared.user (id) ON DELETE CASCADE,
    CONSTRAINT fk_exchange_order_good FOREIGN KEY (good_id) REFERENCES social.exchange_good (id) ON DELETE CASCADE
);

CREATE INDEX idx_exchange_order_user_created ON social.exchange_order (user_id, created_at);

-- === Seed Data ===
INSERT INTO
    social.exchange_good (
        title,
        description,
        image_url,
        points_cost,
        stock
    )
VALUES (
        '环保帆布包',
        '100% 纯棉环保材质，既时尚又环保',
        'https://images.unsplash.com/photo-1597484662317-9bd7bad52d58?auto=format&fit=crop&q=80&w=400',
        100,
        50
    ),
    (
        '竹制餐具套装',
        '包含勺子、叉子和筷子，配备便携式布袋',
        'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=400',
        150,
        30
    ),
    (
        '太阳能充电宝',
        '高效太阳能板，让您的户外运动更环保',
        'https://images.unsplash.com/photo-1619441207978-3d326c46e2c9?auto=format&fit=crop&q=80&w=400',
        500,
        10
    ),
    (
        '不锈钢吸管',
        '可重复使用的不锈钢吸管，减少塑料污染',
        'https://images.unsplash.com/photo-1592434522960-705834863c3d?auto=format&fit=crop&q=80&w=400',
        50,
        100
    ),
    (
        '有机棉 T 恤',
        '天然染色，穿着舒适透气',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
        300,
        20
    );
