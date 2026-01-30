-- ============================================================================
-- YouthLoop Social Schema Migration V004
-- Schema: social
-- Purpose: English demo data across social tables for local development
-- Depends on: shared.V003__seed_demo_users_en.sql (demo users)
-- ============================================================================

-- === IDs (stable) ===
-- Users (from shared seed)
--   Alice: 11111111-1111-1111-1111-111111111111
--   Bob:   22222222-2222-2222-2222-222222222222
--   Admin: 33333333-3333-3333-3333-333333333333

-- Content
--   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1
--   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2
--   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3

-- Activities
--   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1 (hosted)
--   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2 (external/crawled)

-- Sessions
--   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3
--   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4

-- Comments
--   cccccccc-cccc-cccc-cccc-ccccccccccc1 (root)
--   cccccccc-cccc-cccc-cccc-ccccccccccc2 (reply)

-- Banners
--   dddddddd-dddd-dddd-dddd-ddddddddddd1
--   dddddddd-dddd-dddd-dddd-ddddddddddd2
--   dddddddd-dddd-dddd-dddd-ddddddddddd3

-- Rules / badges
--   eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1 (hot rule)
--   ffffffff-ffff-ffff-ffff-fffffffffff1 (badge)

-- === Host profile & verification (Bob) ===
INSERT INTO
    social.host_profile (
        user_id,
        display_name,
        org_name,
        org_logo_url,
        intro,
        created_at,
        updated_at
    )
VALUES (
        '22222222-2222-2222-2222-222222222222'::uuid,
        'GreenSteps Org',
        'GreenSteps Organization',
        'https://picsum.photos/seed/greensteps/200/200',
        'We organize weekly local sustainability activities.',
        now(),
        now()
    )
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO
    social.host_verification (
        user_id,
        org_name,
        contact_name,
        contact_phone,
        doc_urls,
        status,
        submitted_at,
        reviewed_by,
        reviewed_at,
        review_note,
        created_at,
        updated_at
    )
VALUES (
        '22222222-2222-2222-2222-222222222222'::uuid,
        'GreenSteps Organization',
        'Bob Organizer',
        '+1-512-555-0100',
        '["https://example.com/docs/verification.pdf"]'::jsonb,
        2,
        now() - interval '10 days',
        '33333333-3333-3333-3333-333333333333'::uuid,
        now() - interval '9 days',
        'Approved (demo).',
        now(),
        now()
    )
ON CONFLICT (user_id) DO NOTHING;

-- === Hot score rule (demo, optional) ===
INSERT INTO
    social.hot_score_rule (
        id,
        target_type,
        name,
        version,
        formula_json,
        is_active,
        created_at,
        updated_at
    )
VALUES (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        1,
        'Default content hot score',
        1,
        '{"type":"simple","note":"demo"}'::jsonb,
        true,
        now(),
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- === Content (English) ===
INSERT INTO
    social.content (
        id,
        type,
        title,
        summary,
        cover_url,
        body,
        source_type,
        source_url,
        published_at,
        status,
        created_at,
        updated_at
    )
VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        1,
        'Small Daily Habits That Reduce Waste',
        'Five easy habits you can start today to reduce waste and save money.',
        'https://picsum.photos/seed/youthloop-content-1/1200/700',
        '# Reduce Waste, One Habit at a Time\n\nStart with:\n- Bring a reusable bottle\n- Skip single-use cutlery\n- Choose refills\n- Sort your recycling\n- Share and repair\n',
        1,
        'https://example.com/demo/content/reduce-waste',
        now() - interval '2 days',
        1,
        now() - interval '2 days',
        now() - interval '2 days'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
        4,
        'What Is Carbon Neutrality?',
        'A beginner-friendly explanation of carbon neutrality and how to get started.',
        'https://picsum.photos/seed/youthloop-content-2/1200/700',
        'Carbon neutrality means balancing emissions with removals.\n\n**Step 1**: Measure\n**Step 2**: Reduce\n**Step 3**: Offset\n',
        1,
        'https://example.com/demo/content/carbon-neutrality',
        now() - interval '1 day',
        1,
        now() - interval '1 day',
        now() - interval '1 day'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
        2,
        'Community Swap Day This Weekend',
        'Bring items you no longer need and exchange them with your neighbors.',
        'https://picsum.photos/seed/youthloop-content-3/1200/700',
        'Join us for a community swap day.\n\nLocation: Downtown Plaza\nTime: Saturday 10:00–16:00\n',
        1,
        'https://example.com/demo/content/swap-day',
        now() - interval '6 hours',
        1,
        now() - interval '6 hours',
        now() - interval '6 hours'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
        1,
        'Global Climate Summit Reaches New Agreement',
        'World leaders commit to ambitious new carbon reduction targets by 2030.',
        'https://picsum.photos/seed/youthloop-content-4/1200/700',
        '# Historic Climate Agreement\n\nAfter two weeks of intense negotiations, global leaders have agreed to:\n- Reduce carbon emissions by 45% by 2030\n- Establish a global carbon trading system\n- Provide climate finance to developing nations\n\nThis marks a significant step forward in the fight against climate change.\n',
        2,
        'https://example.com/demo/content/climate-summit',
        now() - interval '3 days',
        1,
        now() - interval '3 days',
        now() - interval '3 days'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'::uuid,
        3,
        'New Youth Environmental Grant Program Launched',
        'Government announces $10M fund to support youth-led environmental projects.',
        'https://picsum.photos/seed/youthloop-content-5/1200/700',
        '# Youth Environmental Grant Program\n\n## Eligibility\n- Youth-led organizations (ages 18-30)\n- Environmental focus projects\n- Community impact potential\n\n## Funding\n- Grants from $5,000 to $50,000\n- Application deadline: End of month\n- Rolling review process\n\nVisit the official website to apply today!\n',
        1,
        'https://example.com/demo/content/youth-grant',
        now() - interval '5 days',
        1,
        now() - interval '5 days',
        now() - interval '5 days'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6'::uuid,
        4,
        'Understanding Renewable Energy Sources',
        'A comprehensive guide to solar, wind, hydro, and other renewable energy options.',
        'https://picsum.photos/seed/youthloop-content-6/1200/700',
        '# Renewable Energy 101\n\n## Types of Renewable Energy\n\n### Solar Power\nHarnesses energy from the sun using photovoltaic panels.\n\n### Wind Energy\nConverts wind movement into electricity using turbines.\n\n### Hydroelectric\nGenerates power from flowing water.\n\n### Geothermal\nUtilizes heat from beneath the Earth''s surface.\n\n## Benefits\n- Zero emissions\n- Sustainable and inexhaustible\n- Reduces dependence on fossil fuels\n',
        1,
        'https://example.com/demo/content/renewable-energy',
        now() - interval '4 days',
        1,
        now() - interval '4 days',
        now() - interval '4 days'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7'::uuid,
        2,
        'Urban Garden Workshop Next Tuesday',
        'Learn how to start your own balcony or rooftop garden in the city.',
        'https://picsum.photos/seed/youthloop-content-7/1200/700',
        '# Urban Gardening Workshop\n\n🌱 **What You''ll Learn:**\n- Container gardening basics\n- Choosing the right plants\n- Composting in small spaces\n- Water conservation techniques\n\n📅 **When:** Next Tuesday, 6:00 PM\n📍 **Where:** Community Center Room 201\n\nFree admission! Materials provided.\n',
        1,
        'https://example.com/demo/content/urban-garden',
        now() - interval '8 hours',
        1,
        now() - interval '8 hours',
        now() - interval '8 hours'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8'::uuid,
        1,
        'Ocean Plastic Pollution Reaches Critical Levels',
        'New study reveals alarming increase in microplastics in marine ecosystems.',
        'https://picsum.photos/seed/youthloop-content-8/1200/700',
        '# Ocean Plastic Crisis\n\nA recent study published in Marine Science Journal shows:\n- 8 million tons of plastic enter oceans annually\n- Microplastics found in 90% of seabirds\n- Impact on food chain and human health\n\n## What Can We Do?\n- Reduce single-use plastics\n- Support ocean cleanup initiatives\n- Choose sustainable seafood\n- Participate in beach cleanups\n',
        2,
        'https://example.com/demo/content/ocean-plastic',
        now() - interval '7 days',
        1,
        now() - interval '7 days',
        now() - interval '7 days'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9'::uuid,
        4,
        'The Circular Economy Explained',
        'How circular economy principles can transform our consumption patterns.',
        'https://picsum.photos/seed/youthloop-content-9/1200/700',
        '# What is Circular Economy?\n\nThe circular economy is an alternative to the traditional linear economy (make, use, dispose).\n\n## Key Principles\n\n1. **Design Out Waste**\nProducts designed for durability, reuse, and recycling.\n\n2. **Keep Products in Use**\nMaximize product lifespan through repair and refurbishment.\n\n3. **Regenerate Natural Systems**\nReturn valuable nutrients to the soil and environment.\n\n## Benefits\n- Reduced waste and pollution\n- Economic growth opportunities\n- Resource security\n',
        1,
        'https://example.com/demo/content/circular-economy',
        now() - interval '10 hours',
        1,
        now() - interval '10 hours',
        now() - interval '10 hours'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
        3,
        'New Recycling Standards Take Effect',
        'Updated guidelines aim to improve recycling rates and reduce contamination.',
        'https://picsum.photos/seed/youthloop-content-10/1200/700',
        '# New Recycling Standards\n\n## What''s Changing\n\nStarting next month, new recycling standards will be implemented:\n\n- **Clearer labeling** on all packaging\n- **Standardized bin colors** across the city\n- **Expanded accepted materials** list\n- **Stricter contamination penalties**\n\n## How to Prepare\n\n1. Review the new guidelines\n2. Clean and dry recyclables\n3. Check material codes\n4. When in doubt, throw it out\n\nProper recycling helps create a cleaner, greener future!\n',
        1,
        'https://example.com/demo/content/recycling-standards',
        now() - interval '12 hours',
        1,
        now() - interval '12 hours',
        now() - interval '12 hours'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO
    social.content_stats (
        content_id,
        like_count,
        fav_count,
        down_count,
        comment_count,
        hot_score,
        hot_rule_id,
        updated_at
    )
VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        12,
        5,
        0,
        2,
        120,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
        20,
        9,
        1,
        1,
        210,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
        7,
        3,
        0,
        0,
        80,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
        45,
        23,
        2,
        8,
        520,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'::uuid,
        33,
        18,
        0,
        5,
        380,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6'::uuid,
        28,
        15,
        1,
        4,
        310,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7'::uuid,
        15,
        8,
        0,
        3,
        160,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8'::uuid,
        52,
        31,
        3,
        12,
        680,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9'::uuid,
        24,
        12,
        0,
        6,
        270,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
        18,
        9,
        1,
        2,
        190,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
        now()
    )
ON CONFLICT (content_id) DO NOTHING;

-- === Activities ===
INSERT INTO
    social.activity (
        id,
        source_type,
        title,
        category,
        topic,
        signup_policy,
        start_time,
        end_time,
        location,
        description,
        poster_urls,
        source_url,
        host_user_id,
        status,
        created_at,
        updated_at
    )
VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
        2,
        'Park Cleanup & Sorting Workshop',
        3,
        'Hands-on community action',
        1,
        now() + interval '3 days',
        now() + interval '3 days' + interval '2 hours',
        'Riverside Park',
        'Join a friendly park cleanup and learn simple sorting rules.\n\nBring gloves if you have them.',
        '["https://picsum.photos/seed/youthloop-activity-1/1200/700","https://picsum.photos/seed/youthloop-activity-1b/1200/700"]'::jsonb,
        NULL,
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        now() - interval '1 day',
        now() - interval '1 day'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid,
        1,
        'City Bike-to-Work Challenge',
        5,
        'Low-carbon commuting',
        1,
        now() + interval '7 days',
        now() + interval '7 days' + interval '1 hour',
        'City Center',
        'A city-wide bike-to-work challenge. Join and invite friends.',
        '["https://picsum.photos/seed/youthloop-activity-2/1200/700"]'::jsonb,
        'https://example.com/demo/activity/bike-to-work',
        NULL,
        1,
        now() - interval '3 days',
        now() - interval '3 days'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'::uuid,
        2,
        'Zero Waste Cooking Class',
        1,
        'Sustainable living',
        2,
        now() + interval '5 days',
        now() + interval '5 days' + interval '3 hours',
        'Green Kitchen Studio',
        'Learn to cook delicious meals while minimizing food waste. We''ll cover meal planning, creative use of leftovers, and composting basics.\n\nAll ingredients provided. Limited to 20 participants.',
        '["https://picsum.photos/seed/youthloop-activity-5/1200/700"]'::jsonb,
        NULL,
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        now() - interval '2 days',
        now() - interval '2 days'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6'::uuid,
        1,
        'Coastal Beach Cleanup Marathon',
        3,
        'Ocean conservation',
        1,
        now() + interval '10 days',
        now() + interval '10 days' + interval '4 hours',
        'Sunset Beach',
        'Join hundreds of volunteers for our annual beach cleanup event. Help protect marine life and keep our beaches beautiful.\n\nFree t-shirt for all participants!',
        '["https://picsum.photos/seed/youthloop-activity-6/1200/700","https://picsum.photos/seed/youthloop-activity-6b/1200/700"]'::jsonb,
        'https://example.com/demo/activity/beach-cleanup',
        NULL,
        1,
        now() - interval '5 days',
        now() - interval '5 days'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7'::uuid,
        2,
        'Tree Planting Day',
        4,
        'Reforestation',
        1,
        now() + interval '14 days',
        now() + interval '14 days' + interval '5 hours',
        'Mountain Valley Nature Reserve',
        'Help us plant 1,000 trees! This community reforestation project aims to restore native forest habitat.\n\nTransportation provided from city center. Bring water and wear sturdy shoes.',
        '["https://picsum.photos/seed/youthloop-activity-7/1200/700"]'::jsonb,
        NULL,
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        now() - interval '4 days',
        now() - interval '4 days'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8'::uuid,
        1,
        'Sustainable Fashion Swap',
        6,
        'Circular economy',
        1,
        now() + interval '6 days',
        now() + interval '6 days' + interval '4 hours',
        'Community Hall',
        'Refresh your wardrobe sustainably! Bring clean, gently-used clothing and accessories to swap.\n\nFashion styling tips and upcycling workshop included.',
        '["https://picsum.photos/seed/youthloop-activity-8/1200/700"]'::jsonb,
        'https://example.com/demo/activity/fashion-swap',
        NULL,
        1,
        now() - interval '1 day',
        now() - interval '1 day'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9'::uuid,
        2,
        'Solar Energy Workshop',
        7,
        'Renewable energy education',
        2,
        now() + interval '8 days',
        now() + interval '8 days' + interval '2 hours',
        'Tech Innovation Center',
        'Hands-on workshop on solar panel installation and maintenance. Perfect for beginners interested in renewable energy.\n\nCertificate of completion provided.',
        '["https://picsum.photos/seed/youthloop-activity-9/1200/700"]'::jsonb,
        NULL,
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        now() - interval '6 days',
        now() - interval '6 days'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba'::uuid,
        1,
        'Wildlife Photography Walk',
        8,
        'Nature appreciation',
        1,
        now() + interval '12 days',
        now() + interval '12 days' + interval '3 hours',
        'Greenwood Forest Trail',
        'Join our guided nature walk and learn wildlife photography techniques. Bring your camera or smartphone.\n\nAll skill levels welcome. Professional photographer will lead the tour.',
        '["https://picsum.photos/seed/youthloop-activity-10/1200/700"]'::jsonb,
        'https://example.com/demo/activity/wildlife-photo',
        NULL,
        1,
        now() - interval '2 days',
        now() - interval '2 days'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO
    social.activity_stats (
        activity_id,
        like_count,
        fav_count,
        down_count,
        comment_count,
        hot_score,
        hot_rule_id,
        updated_at
    )
VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
        5,
        2,
        0,
        1,
        90,
        NULL,
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid,
        9,
        4,
        0,
        0,
        140,
        NULL,
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'::uuid,
        12,
        7,
        0,
        3,
        180,
        NULL,
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6'::uuid,
        28,
        15,
        1,
        8,
        380,
        NULL,
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7'::uuid,
        22,
        11,
        0,
        5,
        290,
        NULL,
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8'::uuid,
        18,
        9,
        0,
        4,
        220,
        NULL,
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9'::uuid,
        15,
        8,
        0,
        2,
        170,
        NULL,
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba'::uuid,
        20,
        10,
        0,
        6,
        260,
        NULL,
        now()
    )
ON CONFLICT (activity_id) DO NOTHING;

INSERT INTO
    social.activity_session (
        id,
        activity_id,
        title,
        start_time,
        end_time,
        capacity,
        status,
        created_at,
        updated_at
    )
VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
        'Morning Session',
        now() + interval '3 days' + interval '30 minutes',
        now() + interval '3 days' + interval '2 hours',
        30,
        1,
        now(),
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
        'Afternoon Session',
        now() + interval '3 days' + interval '3 hours',
        now() + interval '3 days' + interval '4 hours',
        30,
        1,
        now(),
        now()
    ),
    (
        gen_random_uuid (),
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'::uuid,
        'Single Session',
        now() + interval '5 days',
        now() + interval '5 days' + interval '3 hours',
        20,
        1,
        now(),
        now()
    ),
    (
        gen_random_uuid (),
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7'::uuid,
        'Morning Group',
        now() + interval '14 days',
        now() + interval '14 days' + interval '2.5 hours',
        50,
        1,
        now(),
        now()
    ),
    (
        gen_random_uuid (),
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7'::uuid,
        'Afternoon Group',
        now() + interval '14 days' + interval '2.5 hours',
        now() + interval '14 days' + interval '5 hours',
        50,
        1,
        now(),
        now()
    ),
    (
        gen_random_uuid (),
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9'::uuid,
        'Workshop Session',
        now() + interval '8 days',
        now() + interval '8 days' + interval '2 hours',
        15,
        1,
        now(),
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- === Activity signups ===
INSERT INTO
    social.activity_signup (
        id,
        activity_id,
        session_id,
        user_id,
        email,
        nickname,
        real_name,
        phone,
        join_time,
        status,
        audited_by,
        audited_at,
        audit_note,
        canceled_at,
        cancel_note,
        dedup_key,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid (),
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'alice@youthloop.dev',
        'Alice Green',
        'Alice Green',
        '+1-206-555-0101',
        now() + interval '3 days' + interval '30 minutes',
        2,
        '22222222-2222-2222-2222-222222222222'::uuid,
        now() - interval '12 hours',
        'Approved (demo).',
        NULL,
        NULL,
        'user:11111111-1111-1111-1111-111111111111',
        now() - interval '1 day',
        now() - interval '1 day'
    )
ON CONFLICT (activity_id, dedup_key) DO NOTHING;

-- === Comments (content) ===
INSERT INTO
    social.comment (
        id,
        target_type,
        target_id,
        user_id,
        parent_id,
        root_id,
        depth,
        body,
        status,
        created_at,
        updated_at
    )
VALUES (
        'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        0,
        'Great tips! I started carrying a reusable bottle this week.',
        1,
        now() - interval '5 hours',
        now() - interval '5 hours'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
        1,
        'Love it — small habits really add up.',
        1,
        now() - interval '3 hours',
        now() - interval '3 hours'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        0,
        'This is a historic moment for climate action! Glad to see world leaders taking this seriously.',
        1,
        now() - interval '2 days',
        now() - interval '2 days'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc4'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid,
        1,
        'Agreed! Now we need to ensure these commitments are actually implemented.',
        1,
        now() - interval '1 day',
        now() - interval '1 day'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc5'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        0,
        'This grant program is exactly what we need! Already working on my application.',
        1,
        now() - interval '4 days',
        now() - interval '4 days'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc6'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        NULL,
        NULL,
        0,
        'Very informative! Would love to see more content about solar panel installation.',
        1,
        now() - interval '3 days',
        now() - interval '3 days'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc7'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        0,
        'This is so alarming. We really need to reduce our plastic consumption.',
        1,
        now() - interval '6 days',
        now() - interval '6 days'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc8'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc7'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc7'::uuid,
        1,
        'I''ve switched to reusable bags and containers. Every little bit helps!',
        1,
        now() - interval '5 days',
        now() - interval '5 days'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc9'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        0,
        'Circular economy is the future! More businesses should adopt these principles.',
        1,
        now() - interval '9 hours',
        now() - interval '9 hours'
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccca'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        0,
        'Looking forward to this! What should I bring besides gloves?',
        1,
        now() - interval '18 hours',
        now() - interval '18 hours'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccb'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        NULL,
        NULL,
        0,
        'Count me in! Beach cleanups are always so rewarding.',
        1,
        now() - interval '4 days',
        now() - interval '4 days'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        0,
        'Planting 1,000 trees in one day? That''s amazing! Will definitely join.',
        1,
        now() - interval '3 days',
        now() - interval '3 days'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccd'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        NULL,
        NULL,
        0,
        'Love the fashion swap concept! Sustainable and fun.',
        1,
        now() - interval '20 hours',
        now() - interval '20 hours'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccf'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'cccccccc-cccc-cccc-cccc-cccccccccccd'::uuid,
        'cccccccc-cccc-cccc-cccc-cccccccccccd'::uuid,
        1,
        'Yes! And the upcycling workshop sounds great too.',
        1,
        now() - interval '15 hours',
        now() - interval '15 hours'
    )
ON CONFLICT (id) DO NOTHING;

UPDATE social.comment
SET
    root_id = id
WHERE
    id IN (
        'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc5'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc6'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc7'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc9'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccca'::uuid,
        'cccccccc-cccc-cccc-cccc-cccccccccccb'::uuid,
        'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
        'cccccccc-cccc-cccc-cccc-cccccccccccd'::uuid
    )
    AND root_id IS NULL;

INSERT INTO
    social.comment_stats (
        comment_id,
        like_count,
        down_count,
        reply_count,
        hot_score,
        hot_rule_id,
        updated_at
    )
VALUES (
        'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
        2,
        0,
        1,
        30,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
        1,
        0,
        0,
        10,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid,
        5,
        0,
        1,
        60,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc4'::uuid,
        3,
        0,
        0,
        30,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc5'::uuid,
        4,
        0,
        0,
        40,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc6'::uuid,
        2,
        0,
        0,
        20,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc7'::uuid,
        6,
        0,
        1,
        70,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc8'::uuid,
        4,
        0,
        0,
        40,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccc9'::uuid,
        3,
        0,
        0,
        30,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-ccccccccccca'::uuid,
        1,
        0,
        0,
        10,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccb'::uuid,
        2,
        0,
        0,
        20,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
        3,
        0,
        0,
        30,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccd'::uuid,
        2,
        0,
        1,
        25,
        NULL,
        now()
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccf'::uuid,
        1,
        0,
        0,
        10,
        NULL,
        now()
    )
ON CONFLICT (comment_id) DO NOTHING;

-- === Reactions ===
INSERT INTO
    social.reaction (
        id,
        user_id,
        target_type,
        target_id,
        reaction_type,
        created_at
    )
VALUES (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        1,
        now() - interval '4 hours'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid,
        2,
        now() - interval '2 hours'
    ),
    (
        gen_random_uuid (),
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
        1,
        now() - interval '1 day'
    ),
    (
        gen_random_uuid (),
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
        1,
        now() - interval '2 days'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
        2,
        now() - interval '2 days'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'::uuid,
        1,
        now() - interval '4 days'
    ),
    (
        gen_random_uuid (),
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6'::uuid,
        1,
        now() - interval '3 days'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8'::uuid,
        1,
        now() - interval '6 days'
    ),
    (
        gen_random_uuid (),
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8'::uuid,
        2,
        now() - interval '6 days'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9'::uuid,
        1,
        now() - interval '9 hours'
    ),
    (
        gen_random_uuid (),
        '22222222-2222-2222-2222-222222222222'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'::uuid,
        1,
        now() - interval '2 days'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6'::uuid,
        1,
        now() - interval '4 days'
    ),
    (
        gen_random_uuid (),
        '22222222-2222-2222-2222-222222222222'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6'::uuid,
        2,
        now() - interval '4 days'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7'::uuid,
        1,
        now() - interval '3 days'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8'::uuid,
        1,
        now() - interval '20 hours'
    ),
    (
        gen_random_uuid (),
        '22222222-2222-2222-2222-222222222222'::uuid,
        2,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9'::uuid,
        1,
        now() - interval '5 days'
    )
ON CONFLICT (
    user_id,
    target_type,
    target_id,
    reaction_type
) DO NOTHING;

-- === Notifications ===
INSERT INTO
    social.notification (
        id,
        user_id,
        type,
        actor_user_id,
        target_type,
        target_id,
        comment_id,
        root_comment_id,
        meta,
        read_at,
        created_at
    )
VALUES (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        2,
        '22222222-2222-2222-2222-222222222222'::uuid,
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
        'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
        '{"title":"New reply","content":"Bob replied to your comment."}'::jsonb,
        NULL,
        now() - interval '2 hours'
    )
ON CONFLICT DO NOTHING;

-- === Home banners ===
INSERT INTO
    social.home_banner (
        id,
        title,
        image_url,
        link_type,
        link_target,
        sort_order,
        is_enabled,
        start_at,
        end_at,
        created_by,
        updated_by,
        created_at,
        updated_at
    )
VALUES (
        'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid,
        'Reduce Waste',
        'https://picsum.photos/seed/youthloop-banner-1/1600/600',
        2,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        1,
        true,
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        now(),
        now()
    ),
    (
        'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid,
        'Join a Cleanup',
        'https://picsum.photos/seed/youthloop-banner-2/1600/600',
        3,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
        2,
        true,
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        now(),
        now()
    ),
    (
        'dddddddd-dddd-dddd-dddd-ddddddddddd3'::uuid,
        'Learn More',
        'https://picsum.photos/seed/youthloop-banner-3/1600/600',
        4,
        'https://youthloop.dev',
        3,
        true,
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        now(),
        now()
    ),
    (
        'dddddddd-dddd-dddd-dddd-ddddddddddd4'::uuid,
        'Climate Summit News',
        'https://picsum.photos/seed/youthloop-banner-4/1600/600',
        2,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
        4,
        true,
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        now(),
        now()
    ),
    (
        'dddddddd-dddd-dddd-dddd-ddddddddddd5'::uuid,
        'Beach Cleanup Event',
        'https://picsum.photos/seed/youthloop-banner-5/1600/600',
        3,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6',
        5,
        true,
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        now(),
        now()
    ),
    (
        'dddddddd-dddd-dddd-dddd-ddddddddddd6'::uuid,
        'Tree Planting Day',
        'https://picsum.photos/seed/youthloop-banner-6/1600/600',
        3,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7',
        6,
        true,
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        now(),
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- === Points (Alice) ===
INSERT INTO
    social.points_account (user_id, balance, updated_at)
VALUES (
        '11111111-1111-1111-1111-111111111111'::uuid,
        120,
        now()
    )
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO
    social.points_ledger (
        id,
        user_id,
        delta,
        reason,
        ref_type,
        ref_id,
        memo,
        created_at
    )
VALUES (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        50,
        1,
        NULL,
        NULL,
        'Demo bonus for sign-in',
        now() - interval '2 days'
    ),
    (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        70,
        5,
        NULL,
        NULL,
        'Demo bonus',
        now() - interval '1 day'
    )
ON CONFLICT DO NOTHING;

INSERT INTO
    social.signin_record (
        user_id,
        signin_date,
        is_signed,
        signed_at,
        is_makeup,
        streak_count,
        created_at
    )
VALUES (
        '11111111-1111-1111-1111-111111111111'::uuid,
        current_date,
        true,
        now(),
        false,
        3,
        now()
    )
ON CONFLICT (user_id, signin_date) DO NOTHING;

-- === Daily tasks ===
INSERT INTO
    social.daily_task (
        id,
        code,
        name,
        rule_json,
        points,
        is_enabled,
        created_at
    )
VALUES (
        gen_random_uuid (),
        'read_content',
        'Read an article',
        '{"target":1}'::jsonb,
        5,
        true,
        now()
    ),
    (
        gen_random_uuid (),
        'post_comment',
        'Post a comment',
        '{"target":1}'::jsonb,
        10,
        true,
        now()
    ),
    (
        gen_random_uuid (),
        'join_activity',
        'Join an activity',
        '{"target":1}'::jsonb,
        15,
        true,
        now()
    ),
    (
        gen_random_uuid (),
        'like_content',
        'Like 3 articles',
        '{"target":3}'::jsonb,
        5,
        true,
        now()
    ),
    (
        gen_random_uuid (),
        'share_content',
        'Share an article',
        '{"target":1}'::jsonb,
        8,
        true,
        now()
    ),
    (
        gen_random_uuid (),
        'complete_quiz',
        'Complete daily quiz',
        '{"target":1}'::jsonb,
        10,
        true,
        now()
    )
ON CONFLICT (code) DO NOTHING;

-- Progress (pick first task by code)
INSERT INTO
    social.daily_task_progress (
        user_id,
        task_date,
        task_id,
        progress,
        target,
        status,
        updated_at
    )
SELECT '11111111-1111-1111-1111-111111111111'::uuid, current_date, t.id, 1, 1, 2, now()
FROM social.daily_task t
WHERE
    t.code = 'read_content'
ON CONFLICT (user_id, task_date, task_id) DO NOTHING;

-- === Daily quiz (today) ===
INSERT INTO
    social.daily_quiz (
        quiz_date,
        question,
        answer,
        points,
        created_at
    )
VALUES (
        current_date,
        '{
      "title":"Which item is usually recyclable?",
      "options":[
        {"id":1,"text":"Glass bottle"},
        {"id":2,"text":"Used tissue"}
      ]
    }'::jsonb,
        '1'::jsonb,
        10,
        now()
    )
ON CONFLICT (quiz_date) DO NOTHING;

-- === Badge (demo) ===
INSERT INTO
    social.badge (
        id,
        series,
        name,
        threshold,
        sort_order,
        created_at
    )
VALUES (
        'ffffffff-ffff-ffff-ffff-fffffffffff1'::uuid,
        1,
        'Green Starter',
        '{"balanceGte":100}'::jsonb,
        1,
        now()
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO
    social.user_badge (
        user_id,
        badge_id,
        unlocked_at
    )
VALUES (
        '11111111-1111-1111-1111-111111111111'::uuid,
        'ffffffff-ffff-ffff-ffff-fffffffffff1'::uuid,
        now() - interval '1 day'
    )
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- === User event ===
INSERT INTO
    social.user_event (
        id,
        user_id,
        event_type,
        target_type,
        target_id,
        meta,
        created_at
    )
VALUES (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        'VIEW_CONTENT',
        1,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        '{"source":"demo"}'::jsonb,
        now() - interval '2 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- === Weekly recommendation ===
INSERT INTO
    social.weekly_recommendation (
        user_id,
        week_start,
        items,
        created_at,
        updated_at
    )
VALUES (
        '11111111-1111-1111-1111-111111111111'::uuid,
        date_trunc('week', current_date)::date,
        '{"contents":["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"],"activities":["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1"]}'::jsonb,
        now(),
        now()
    )
ON CONFLICT (user_id, week_start) DO NOTHING;

-- === Outbox event (demo) ===
INSERT INTO
    social.outbox_event (
        id,
        event_type,
        payload,
        status,
        retry_count,
        next_retry_at,
        last_error,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid (),
        'DEMO_EVENT',
        '{"hello":"world"}'::jsonb,
        1,
        0,
        NULL,
        NULL,
        now(),
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- === Support & feedback (demo) ===
INSERT INTO
    social.support_contact (
        id,
        user_id,
        name,
        email,
        phone,
        subject,
        message,
        status,
        created_at,
        handled_by,
        handled_at,
        meta
    )
VALUES (
        gen_random_uuid (),
        NULL,
        'Visitor',
        'visitor@example.com',
        '+1-555-000-0000',
        'General question',
        'How do I join an activity?',
        1,
        now() - interval '6 hours',
        NULL,
        NULL,
        '{"ip":"127.0.0.1"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO
    social.user_feedback (
        id,
        user_id,
        type,
        rating,
        title,
        content,
        contact,
        anonymous,
        status,
        created_at,
        meta
    )
VALUES (
        gen_random_uuid (),
        '11111111-1111-1111-1111-111111111111'::uuid,
        1,
        5,
        'Great app',
        'Love the clean UI and the activities list.',
        'alice@youthloop.dev',
        false,
        1,
        now() - interval '4 hours',
        '{"device":"web"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;