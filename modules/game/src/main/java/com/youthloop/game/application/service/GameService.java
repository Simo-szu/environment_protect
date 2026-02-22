package com.youthloop.game.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.persistence.entity.GameActionEntity;
import com.youthloop.game.persistence.entity.GameSessionEntity;
import com.youthloop.game.persistence.mapper.GameActionMapper;
import com.youthloop.game.persistence.mapper.GameSessionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private static final int ACTION_PLACE_CORE_CARD = 1;
    private static final int ACTION_END_TURN = 2;
    private static final int ACTION_USE_POLICY_CARD = 3;
    private static final int ACTION_TRADE_CARBON = 4;
    private static final int ACTION_DISCARD_CARD = 5;

    private static final int SESSION_ACTIVE = 1;
    private static final int SESSION_ENDED = 3;

    private static final int CORE_HAND_LIMIT = 6;
    private static final int POLICY_HAND_LIMIT = 2;
    private static final int MAX_COMBO_PER_TURN = 2;
    private static final int MAX_TURN = 30;
    private static final int HAND_DISCARD_DECISION_SECONDS = 10;
    private static final int TRADE_WINDOW_INTERVAL = 2;
    private static final double BASE_CARBON_PRICE = 2.0D;
    private static final int MAX_CARBON_QUOTA = 200;
    private static final Set<String> SHENZHEN_ECOLOGY_CARDS = Set.of("card025", "card026", "card027");
    private static final Set<String> LOW_CARBON_CORE_CARDS = Set.of(
        "card006", "card009", "card010", "card015", "card018", "card020",
        "card021", "card022", "card023", "card024", "card025", "card026", "card027", "card028", "card029", "card030",
        "card031", "card032", "card033", "card034", "card035",
        "card038", "card041", "card042", "card043",
        "card048", "card049", "card050",
        "card054", "card055", "card056", "card057", "card059", "card060"
    );
    private static final Set<String> SHENZHEN_TAG_CORE_CARDS = Set.of(
        "card025", "card026", "card027", "card036", "card037", "card054"
    );
    private static final Set<String> LINK_TAG_CORE_CARDS = Set.of(
        "card009", "card019", "card031", "card035", "card044", "card045", "card053", "card058"
    );
    private static final Map<String, PolicyImmediateEffect> POLICY_IMMEDIATE_EFFECTS = Map.of(
        "card061", new PolicyImmediateEffect(15, 0, 0, 0, -8, 0, 0, "industry_support", 3),
        "card062", new PolicyImmediateEffect(0, 0, 0, 0, -30, 0, 0, "carbon_control", 3),
        "card063", new PolicyImmediateEffect(0, 0, 0, 20, 0, 8, 0, "ecology", 3),
        "card064", new PolicyImmediateEffect(0, 0, 0, 15, 0, 0, 3, "ecology", 3),
        "card065", new PolicyImmediateEffect(0, 25, 0, 0, 0, 0, 0, "science_support", 3),
        "card066", new PolicyImmediateEffect(0, 20, 0, 0, -40, 0, 0, "carbon_control", 3),
        "card067", new PolicyImmediateEffect(0, 0, 10, 0, 0, 20, 0, "society_support", 3),
        "card068", new PolicyImmediateEffect(0, 0, 8, 0, 0, 18, 0, "citizen", 3)
    );
    private static final Map<String, PolicyContinuousEffect> POLICY_CONTINUOUS_EFFECTS = Map.of(
        "card061", new PolicyContinuousEffect(5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        "card062", new PolicyContinuousEffect(0, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, 20),
        "card063", new PolicyContinuousEffect(0, 0, 0, 3, -4, 0, 0, 0, 0, 0, 0, 0),
        "card064", new PolicyContinuousEffect(0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0),
        "card065", new PolicyContinuousEffect(0, 6, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0),
        "card066", new PolicyContinuousEffect(0, 0, 0, 0, -8, 0, 0, 0, 0, 0, 0, 0),
        "card067", new PolicyContinuousEffect(0, 0, 3, 0, 0, 4, 0, 0, 0, 0, 0, 0),
        "card068", new PolicyContinuousEffect(0, 0, 0, 0, 0, 5, 2, 0, 0, 0, 0, 0)
    );
    private static final Map<String, ComboEffect> COMBO_EFFECTS = Map.ofEntries(
        Map.entry("policy_industry_chain", new ComboEffect(10, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("policy_ecology_chain", new ComboEffect(0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("policy_science_chain", new ComboEffect(0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10)),
        Map.entry("policy_society_chain", new ComboEffect(0, 0, 0, 0, 0, 15, 0, 0, 0, 20, 0, 0, 0, 0)),
        Map.entry("cross_science_industry", new ComboEffect(20, 15, 0, 0, -20, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("cross_industry_ecology", new ComboEffect(0, 0, 0, 10, -25, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("cross_ecology_society", new ComboEffect(0, 0, 8, 8, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("cross_science_ecology", new ComboEffect(0, 10, 0, 15, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("intra_industry_scale", new ComboEffect(0, 0, 0, 0, -15, 0, 0, 0, 0, 0, 30, 0, 0, 0)),
        Map.entry("intra_ecology_restore", new ComboEffect(0, 0, 0, 12, -8, 8, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("intra_science_boost", new ComboEffect(0, 0, 0, 0, 0, 0, 0, 0, 35, 0, 0, 8, 0, 0)),
        Map.entry("intra_society_mobilize", new ComboEffect(0, 0, 0, 0, 0, 10, 0, 0, 0, 25, 0, 0, 0, 0))
    );
    private static final List<ComboTriggerRule> COMBO_TRIGGER_RULES = List.of(
        // Priority 1: policy + core
        new ComboTriggerRule("policy_industry_chain", "card061", 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0),
        new ComboTriggerRule("policy_ecology_chain", "card064", 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0),
        new ComboTriggerRule("policy_science_chain", "card065", 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        new ComboTriggerRule("policy_society_chain", "card067", 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0),
        // Priority 2: cross-domain
        new ComboTriggerRule("cross_science_industry", null, 0, 0, 3, 0, 3, 0, 0, 0, 0, 1, 0, 0),
        new ComboTriggerRule("cross_industry_ecology", null, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0),
        new ComboTriggerRule("cross_ecology_society", null, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2),
        new ComboTriggerRule("cross_science_ecology", null, 0, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0),
        // Priority 3: intra-domain
        new ComboTriggerRule("intra_industry_scale", null, 0, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 0),
        new ComboTriggerRule("intra_ecology_restore", null, 0, 4, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0),
        new ComboTriggerRule("intra_science_boost", null, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 0, 0),
        new ComboTriggerRule("intra_society_mobilize", null, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 2)
    );
    private static final Set<String> NEW_ENERGY_INDUSTRY_CARDS = Set.of("card055");
    private static final Set<String> TRADITIONAL_INDUSTRY_CARDS = Set.of(
        "card001", "card002", "card003", "card004", "card005", "card011", "card012", "card013", "card014", "card057"
    );
    private static final Set<String> ECOLOGY_CORE_CARDS = Set.of(
        "card021", "card022", "card023", "card024", "card025", "card026", "card027", "card028", "card029", "card030",
        "card031", "card032", "card033", "card034", "card035", "card056", "card059"
    );
    private static final Set<String> SCIENCE_CORE_CARDS = Set.of(
        "card036", "card037", "card038", "card039", "card040", "card041", "card042", "card043", "card044", "card045", "card054"
    );
    private static final Set<String> NEW_ENERGY_EFFECT_CARDS = Set.of("card006", "card018", "card055");
    private static final int DOMAIN_PROGRESS_CARD_CAP = 15;
    private static final Map<String, Integer> CORE_DOMAIN_PROGRESS_BONUS = Map.ofEntries(
        Map.entry("card001", 5), Map.entry("card002", 4), Map.entry("card003", 5), Map.entry("card004", 4),
        Map.entry("card005", 6), Map.entry("card006", 7), Map.entry("card007", 8), Map.entry("card008", 7),
        Map.entry("card009", 10), Map.entry("card010", 12), Map.entry("card011", 5), Map.entry("card012", 4),
        Map.entry("card013", 5), Map.entry("card014", 6), Map.entry("card015", 15), Map.entry("card016", 14),
        Map.entry("card017", 16), Map.entry("card018", 13),
        Map.entry("card021", 3), Map.entry("card022", 2), Map.entry("card023", 4), Map.entry("card024", 4),
        Map.entry("card025", 6), Map.entry("card026", 7), Map.entry("card027", 5), Map.entry("card028", 6),
        Map.entry("card029", 10), Map.entry("card030", 12), Map.entry("card032", 7), Map.entry("card033", 8),
        Map.entry("card034", 6),
        Map.entry("card036", 3), Map.entry("card037", 2), Map.entry("card038", 6), Map.entry("card039", 7),
        Map.entry("card040", 6), Map.entry("card041", 5), Map.entry("card042", 10), Map.entry("card043", 12),
        Map.entry("card045", 5),
        Map.entry("card046", 3), Map.entry("card047", 2), Map.entry("card048", 5), Map.entry("card049", 6),
        Map.entry("card050", 5), Map.entry("card051", 5), Map.entry("card052", 8)
    );
    private static final Map<String, CoreContinuousEffect> CORE_CONTINUOUS_EFFECTS = Map.ofEntries(
        Map.entry("card001", new CoreContinuousEffect(3, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card002", new CoreContinuousEffect(2, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card003", new CoreContinuousEffect(3, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card004", new CoreContinuousEffect(2, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card005", new CoreContinuousEffect(4, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card006", new CoreContinuousEffect(5, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card007", new CoreContinuousEffect(5, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card008", new CoreContinuousEffect(4, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card009", new CoreContinuousEffect(25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card010", new CoreContinuousEffect(28, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card011", new CoreContinuousEffect(3, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card012", new CoreContinuousEffect(3, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card013", new CoreContinuousEffect(4, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card014", new CoreContinuousEffect(4, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card015", new CoreContinuousEffect(30, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card016", new CoreContinuousEffect(29, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card017", new CoreContinuousEffect(32, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card018", new CoreContinuousEffect(27, 0, 0, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card019", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card020", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0)),
        Map.entry("card021", new CoreContinuousEffect(0, 0, 0, 2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card022", new CoreContinuousEffect(0, 0, 0, 2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card023", new CoreContinuousEffect(0, 0, 0, 2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card024", new CoreContinuousEffect(0, 0, 0, 2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card025", new CoreContinuousEffect(0, 0, 0, 3, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card026", new CoreContinuousEffect(0, 0, 0, 3, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card027", new CoreContinuousEffect(0, 0, 0, 3, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card028", new CoreContinuousEffect(0, 0, 0, 3, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card029", new CoreContinuousEffect(0, 0, 0, 12, -8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card030", new CoreContinuousEffect(0, 0, 0, 10, -6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card031", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0)),
        Map.entry("card032", new CoreContinuousEffect(1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card033", new CoreContinuousEffect(0, 0, 0, 3, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card034", new CoreContinuousEffect(0, 0, 0, 3, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card036", new CoreContinuousEffect(0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card037", new CoreContinuousEffect(0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card038", new CoreContinuousEffect(0, 0, 0, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card039", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0)),
        Map.entry("card041", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0)),
        Map.entry("card042", new CoreContinuousEffect(0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0)),
        Map.entry("card043", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0)),
        Map.entry("card044", new CoreContinuousEffect(0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card046", new CoreContinuousEffect(0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card047", new CoreContinuousEffect(0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card048", new CoreContinuousEffect(0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card049", new CoreContinuousEffect(0, 0, 0, 0, -2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card050", new CoreContinuousEffect(0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card051", new CoreContinuousEffect(0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card052", new CoreContinuousEffect(2, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card053", new CoreContinuousEffect(0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card054", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 0)),
        Map.entry("card055", new CoreContinuousEffect(0, 0, 0, 0, -8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card057", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card058", new CoreContinuousEffect(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30)),
        Map.entry("card059", new CoreContinuousEffect(0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        Map.entry("card060", new CoreContinuousEffect(8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0))
    );
    private static final Map<String, CoreEffectCondition> CORE_EFFECT_CONDITIONS = Map.of(
        "card054", new CoreEffectCondition(5, 0, 0, Integer.MAX_VALUE, 0, 0, 0, ""),
        "card055", new CoreEffectCondition(0, 0, 20, Integer.MAX_VALUE, 0, 0, 1, "new_energy_industry"),
        "card057", new CoreEffectCondition(0, 0, 0, Integer.MAX_VALUE, 2, 40, 2, "traditional_industry"),
        "card060", new CoreEffectCondition(0, 100, 0, 60, 0, 0, 0, "")
    );
    private static final Map<String, CoreSpecialEffect> CORE_SPECIAL_EFFECTS = Map.of(
        "card035", new CoreSpecialEffect(20, 0, 0, 0, 0),
        "card040", new CoreSpecialEffect(0, 0, 0, 20, 0),
        "card045", new CoreSpecialEffect(0, 20, 0, 0, 0),
        "card056", new CoreSpecialEffect(50, 0, 60, 0, 0),
        "card059", new CoreSpecialEffect(0, 0, 0, 0, 5)
    );

    private static final String ENDING_FAILURE = "failure";
    private static final String ENDING_INNOVATION = "innovation_technology";
    private static final String ENDING_ECOLOGY = "ecology_priority";
    private static final String ENDING_DOUGHNUT = "doughnut_city";

    private final GameSessionMapper gameSessionMapper;
    private final GameActionMapper gameActionMapper;
    private final CardCatalogService cardCatalogService;
    private final ObjectMapper objectMapper;
    private final Map<UUID, GameSessionEntity> guestSessions = new ConcurrentHashMap<>();

    @Transactional
    public GameSessionDTO startSession() {
        UUID userId = resolveCurrentUserIdOptional();
        if (userId != null) {
            GameSessionEntity existing = gameSessionMapper.selectActiveByUserId(userId);
            if (existing != null) {
                return toDTO(existing);
            }
            GameSessionEntity session = createSession(userId);
            gameSessionMapper.insert(session);
            return toDTO(session);
        }

        GameSessionEntity guestSession = createSession(null);
        guestSessions.put(guestSession.getId(), guestSession);
        return toDTO(guestSession);
    }

    public GameSessionDTO getCurrentSession() {
        UUID userId = resolveCurrentUserId();
        GameSessionEntity session = gameSessionMapper.selectActiveByUserId(userId);
        if (session == null) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
        }
        ObjectNode state = ensureStateObject(session.getPondState());
        processPendingDiscardTimeout(state);
        session.setPondState(state);
        session.setUpdatedAt(LocalDateTime.now());
        gameSessionMapper.update(session);
        return toDTO(session);
    }

    public GameSessionDTO getSessionById(UUID sessionId) {
        if (sessionId == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "sessionId is required");
        }

        UUID userId = resolveCurrentUserIdOptional();
        if (userId != null) {
            GameSessionEntity session = gameSessionMapper.selectById(sessionId);
            if (session == null || !userId.equals(session.getUserId())) {
                throw new BizException(ErrorCode.GAME_SESSION_INVALID);
            }
            ObjectNode state = ensureStateObject(session.getPondState());
            processPendingDiscardTimeout(state);
            session.setPondState(state);
            session.setUpdatedAt(LocalDateTime.now());
            gameSessionMapper.update(session);
            return toDTO(session);
        }

        GameSessionEntity guestSession = guestSessions.get(sessionId);
        if (guestSession == null) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
        }
        ObjectNode guestState = ensureStateObject(guestSession.getPondState());
        processPendingDiscardTimeout(guestState);
        guestSession.setPondState(guestState);
        guestSessions.put(guestSession.getId(), guestSession);
        return toDTO(guestSession);
    }

    public List<GameCardMetaDTO> listCards(boolean includePolicy) {
        return cardCatalogService.listCards(includePolicy);
    }

    @Transactional
    public GameActionResponse performAction(GameActionRequest request) {
        UUID userId = resolveCurrentUserIdOptional();
        if (request == null || request.getSessionId() == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "sessionId is required");
        }

        boolean authenticated = userId != null;
        GameSessionEntity session;
        if (authenticated) {
            session = gameSessionMapper.selectById(request.getSessionId());
            if (session == null || !userId.equals(session.getUserId())) {
                throw new BizException(ErrorCode.GAME_SESSION_INVALID);
            }
        } else {
            session = guestSessions.get(request.getSessionId());
            if (session == null) {
                throw new BizException(ErrorCode.GAME_SESSION_INVALID);
            }
        }
        if (session.getStatus() != SESSION_ACTIVE) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_ACTIVE);
        }

        ObjectNode state = ensureStateObject(session.getPondState());
        processPendingDiscardTimeout(state);
        if (state.path("pendingDiscard").path("active").asBoolean(false)
            && request.getActionType() != ACTION_DISCARD_CARD) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Discard required before other actions");
        }
        int pointsEarned;
        String summary;

        if (request.getActionType() == ACTION_PLACE_CORE_CARD) {
            pointsEarned = handlePlaceCoreCard(state, request.getActionData());
            summary = "Card placed";
        } else if (request.getActionType() == ACTION_USE_POLICY_CARD) {
            pointsEarned = handleUsePolicyCard(state, request.getActionData());
            summary = "Policy card used";
        } else if (request.getActionType() == ACTION_TRADE_CARBON) {
            pointsEarned = handleCarbonTrade(state, request.getActionData());
            summary = "Carbon trade executed";
        } else if (request.getActionType() == ACTION_DISCARD_CARD) {
            pointsEarned = handleDiscardCard(state, request.getActionData());
            summary = "Card discarded";
        } else if (request.getActionType() == ACTION_END_TURN) {
            pointsEarned = handleEndTurn(state);
            summary = "Turn ended";
        } else {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unsupported actionType: " + request.getActionType());
        }

        long latestScore = state.path("metrics").path("lowCarbonScore").asLong(0);
        boolean sessionEnded = state.path("sessionEnded").asBoolean(false) || state.path("turn").asInt() > MAX_TURN;
        session.setPondState(state);
        session.setScore(latestScore);
        session.setLevel(calculateLevel(latestScore));
        session.setLastActionAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        if (sessionEnded) {
            session.setStatus(SESSION_ENDED);
            if (state.has("ending") && state.path("ending").isObject()) {
                summary = "Ending reached";
            } else {
                summary = "Turn limit reached, session ended";
            }
        }
        if (authenticated) {
            gameSessionMapper.update(session);

            GameActionEntity action = new GameActionEntity();
            action.setId(UUID.randomUUID());
            action.setSessionId(session.getId());
            action.setUserId(userId);
            action.setActionType(request.getActionType());
            action.setActionData(request.getActionData());
            action.setPointsEarned(pointsEarned);
            action.setCreatedAt(LocalDateTime.now());
            gameActionMapper.insert(action);
        } else {
            guestSessions.put(session.getId(), session);
        }

        ObjectNode ending = state.path("ending").isObject() ? (ObjectNode) state.path("ending") : null;
        return GameActionResponse.builder()
            .newPondState(state)
            .pointsEarned(pointsEarned)
            .totalScore(latestScore)
            .newLevel(session.getLevel())
            .message(summary)
            .sessionEnded(sessionEnded)
            .endingId(ending == null ? null : ending.path("endingId").asText(null))
            .endingName(ending == null ? null : ending.path("endingName").asText(null))
            .endingImageKey(ending == null ? null : ending.path("imageKey").asText(null))
            .build();
    }

    @Transactional
    public GameActionResponse endSession(UUID sessionId) {
        UUID userId = resolveCurrentUserIdOptional();
        boolean authenticated = userId != null;
        GameSessionEntity session;
        if (authenticated) {
            session = gameSessionMapper.selectById(sessionId);
            if (session == null) {
                throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
            }
            if (!userId.equals(session.getUserId())) {
                throw new BizException(ErrorCode.FORBIDDEN, "No permission to end this session");
            }
        } else {
            session = guestSessions.get(sessionId);
            if (session == null) {
                throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
            }
        }
        if (session.getStatus() != SESSION_ACTIVE) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_ACTIVE);
        }
        session.setStatus(SESSION_ENDED);
        session.setUpdatedAt(LocalDateTime.now());
        if (authenticated) {
            gameSessionMapper.update(session);
        } else {
            guestSessions.put(session.getId(), session);
        }

        return GameActionResponse.builder()
            .newPondState(session.getPondState())
            .pointsEarned(0)
            .totalScore(session.getScore())
            .newLevel(session.getLevel())
            .message("Session ended")
            .sessionEnded(true)
            .endingId(session.getPondState().path("ending").path("endingId").asText(null))
            .endingName(session.getPondState().path("ending").path("endingName").asText(null))
            .endingImageKey(session.getPondState().path("ending").path("imageKey").asText(null))
            .build();
    }

    private ObjectNode buildInitialState() {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("turn", 1);
        root.put("phase", "early");
        root.put("eventCooldown", 0);
        root.put("maxTurn", MAX_TURN);
        root.put("highCarbonStreak", 0);
        root.put("highCarbonOverLimitStreak", 0);
        root.put("sessionEnded", false);
        root.putNull("ending");
        root.put("boardSize", 6);
        root.set("boardOccupied", objectMapper.createObjectNode());

        ObjectNode resources = root.putObject("resources");
        resources.put("industry", 30);
        resources.put("tech", 20);
        resources.put("population", 25);

        ObjectNode metrics = root.putObject("metrics");
        metrics.put("green", 50);
        metrics.put("carbon", 80);
        metrics.put("satisfaction", 60);
        metrics.put("lowCarbonScore", 0);
        ObjectNode domainProgress = root.putObject("domainProgress");
        domainProgress.put("industry", 0);
        domainProgress.put("ecology", 0);
        domainProgress.put("science", 0);
        domainProgress.put("society", 0);

        ObjectNode carbonTrade = root.putObject("carbonTrade");
        carbonTrade.put("quota", 50);
        carbonTrade.put("buyAmountTotal", 0D);
        carbonTrade.put("sellAmountTotal", 0D);
        carbonTrade.put("profit", 0D);
        carbonTrade.put("lastPrice", BASE_CARBON_PRICE);
        carbonTrade.put("lastWindowTurn", 0);
        carbonTrade.put("windowOpened", false);
        carbonTrade.put("pricePctModifier", 0);
        carbonTrade.put("quotaExhaustedCount", 0);
        carbonTrade.put("invalidOperationCount", 0);
        carbonTrade.set("history", objectMapper.createArrayNode());

        ObjectNode pools = root.putObject("remainingPools");
        pools.set("early", toShuffledArray(cardCatalogService.listCoreCardsByPhase("early")));
        pools.set("mid", toShuffledArray(cardCatalogService.listCoreCardsByPhase("mid")));
        pools.set("late", toShuffledArray(cardCatalogService.listCoreCardsByPhase("late")));

        root.set("handCore", objectMapper.createArrayNode());
        root.set("handPolicy", objectMapper.createArrayNode());
        root.set("placedCore", objectMapper.createArrayNode());
        root.set("discardCore", objectMapper.createArrayNode());
        root.set("discardPolicy", objectMapper.createArrayNode());
        root.set("policyUnlocked", objectMapper.createArrayNode());
        root.set("activePolicies", objectMapper.createArrayNode());
        root.set("eventHistory", objectMapper.createArrayNode());
        root.set("activeNegativeEvents", objectMapper.createArrayNode());
        root.set("comboHistory", objectMapper.createArrayNode());
        root.set("policyHistory", objectMapper.createArrayNode());
        root.set("settlementHistory", objectMapper.createArrayNode());
        root.putNull("cardEffectSnapshot");
        root.put("policyUsedThisTurn", false);
        root.put("corePlacedThisTurn", false);
        root.putNull("lastPolicyUsed");
        root.set("handOverflowHistory", objectMapper.createArrayNode());
        ObjectNode pendingDiscard = root.putObject("pendingDiscard");
        pendingDiscard.put("active", false);
        pendingDiscard.put("expiresAt", 0L);
        pendingDiscard.put("coreRequired", 0);
        pendingDiscard.put("policyRequired", 0);

        ObjectNode eventStats = root.putObject("eventStats");
        eventStats.put("negativeTriggered", 0);
        eventStats.put("negativeResolved", 0);

        drawCoreCards(root, "early", 4);
        return root;
    }

    private int handlePlaceCoreCard(ObjectNode state, JsonNode actionData) {
        if (state.path("corePlacedThisTurn").asBoolean(false)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Only one core card can be placed per turn");
        }
        String cardId = readRequiredText(actionData, "cardId");
        int row = readRequiredInt(actionData, "row");
        int col = readRequiredInt(actionData, "col");
        validateBoardPlacement(state, row, col);
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
        if (!"core".equals(card.getCardType())) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Only core cards can be placed");
        }

        ArrayNode hand = state.withArray("handCore");
        int handIndex = indexOf(hand, cardId);
        if (handIndex < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Card is not in hand");
        }

        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        GameCardMetaDTO.UnlockCost cost = card.getUnlockCost();
        int industryCost = safeCost(cost.getIndustry());
        int techCost = safeCost(cost.getTech());
        int populationCost = safeCost(cost.getPopulation());
        int greenCost = safeCost(cost.getGreen());
        int costReductionPct = resolveCorePlacementCostReductionPct(state, card.getDomain());
        industryCost = applyPercentage(industryCost, -costReductionPct);
        techCost = applyPercentage(techCost, -costReductionPct);
        populationCost = applyPercentage(populationCost, -costReductionPct);
        greenCost = applyPercentage(greenCost, -costReductionPct);

        if (resources.path("industry").asInt() < industryCost ||
            resources.path("tech").asInt() < techCost ||
            resources.path("population").asInt() < populationCost ||
            metrics.path("green").asInt() < greenCost) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Insufficient resources for this card");
        }

        resources.put("industry", resources.path("industry").asInt() - industryCost);
        resources.put("tech", resources.path("tech").asInt() - techCost);
        resources.put("population", resources.path("population").asInt() - populationCost);
        metrics.put("green", metrics.path("green").asInt() - greenCost);

        hand.remove(handIndex);
        state.withArray("placedCore").add(cardId);
        state.put("corePlacedThisTurn", true);
        state.with("boardOccupied").put(boardKey(row, col), cardId);

        int placedCount = state.withArray("placedCore").size();
        metrics.put("lowCarbonScore", Math.max(0, metrics.path("lowCarbonScore").asInt() + 1));
        updatePhaseByProgress(state, placedCount, metrics.path("lowCarbonScore").asInt());
        return 1;
    }

    private int handleDiscardCard(ObjectNode state, JsonNode actionData) {
        ObjectNode pending = state.with("pendingDiscard");
        if (!pending.path("active").asBoolean(false)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "No pending discard");
        }
        String handType = readRequiredText(actionData, "handType");
        String cardId = readRequiredText(actionData, "cardId");
        if (!"core".equals(handType) && !"policy".equals(handType)) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "handType must be core or policy");
        }

        if ("core".equals(handType)) {
            discardFromHand(state.withArray("handCore"), state.withArray("discardCore"), state, handType, cardId, "player_discard");
        } else {
            discardFromHand(state.withArray("handPolicy"), state.withArray("discardPolicy"), state, handType, cardId, "player_discard");
        }
        refreshPendingDiscardState(state);
        return 0;
    }

    private int handleUsePolicyCard(ObjectNode state, JsonNode actionData) {
        String cardId = readRequiredText(actionData, "cardId");
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
        if (!"policy".equals(card.getCardType())) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Only policy cards can be used");
        }
        if (state.path("policyUsedThisTurn").asBoolean(false)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Only one policy card can be used per turn");
        }

        ArrayNode unlocked = state.withArray("policyUnlocked");
        if (indexOf(unlocked, cardId) < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Policy card has not been unlocked");
        }

        ArrayNode handPolicy = state.withArray("handPolicy");
        int handIndex = indexOf(handPolicy, cardId);
        if (handIndex < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Policy card is not in hand");
        }

        handPolicy.remove(handIndex);
        applyPolicyEffectNow(state, cardId);
        resolveNegativeEventsByPolicy(state, cardId);
        state.put("policyUsedThisTurn", true);
        state.put("lastPolicyUsed", cardId);

        ObjectNode record = objectMapper.createObjectNode();
        record.put("turn", state.path("turn").asInt());
        record.put("policyId", cardId);
        state.withArray("policyHistory").add(record);
        return 2;
    }

    private int handleEndTurn(ObjectNode state) {
        settlePendingTradeWindowAsSkip(state);

        DomainCounts counts = countPlacedDomains(state);
        refreshDomainProgress(state, counts);
        resolvePolicyUnlocks(state, counts);

        ObjectNode settlementBonus = objectMapper.createObjectNode();
        putAllBonusFields(settlementBonus, 0);
        applyCoreContinuousEffects(state, counts, settlementBonus);
        applyCoreSpecialEffects(state, counts, settlementBonus);
        int comboTriggered = applyTurnCombos(state, counts, settlementBonus);
        applyActivePolicyEffects(state, settlementBonus);
        applyActiveNegativeEventEffects(state, settlementBonus);
        state.set("cardEffectSnapshot", settlementBonus.deepCopy());

        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        ObjectNode tradeBefore = captureValueNode(state.with("carbonTrade"), "quota", "pricePctModifier");
        ObjectNode resourcesBefore = captureValueNode(resources, "industry", "tech", "population");
        ObjectNode metricsBefore = captureValueNode(metrics, "green", "carbon", "satisfaction", "lowCarbonScore");
        int globalPct = settlementBonus.path("globalPct").asInt(0);
        int industryCarbonReductionPct = settlementBonus.path("industryCarbonReductionPct").asInt(0);
        int newEnergyIndustryCount = countPlacedBySet(state, NEW_ENERGY_EFFECT_CARDS);
        int newEnergyExtraIndustry = applyPercentage(
            newEnergyIndustryCount,
            settlementBonus.path("newEnergyIndustryPct").asInt(0)
        ) - newEnergyIndustryCount;
        int industryGain = applyPercentage(
            2 + counts.industry + settlementBonus.path("industry").asInt() + newEnergyExtraIndustry,
            settlementBonus.path("industryPct").asInt(0) + globalPct
        );
        int techGain = applyPercentage(
            1 + counts.science + settlementBonus.path("tech").asInt(),
            settlementBonus.path("techPct").asInt(0) + globalPct
        );
        int populationGain = applyPercentage(
            1 + counts.society + settlementBonus.path("population").asInt(),
            settlementBonus.path("populationPct").asInt(0) + globalPct
        );
        resources.put("industry", resources.path("industry").asInt() + industryGain);
        resources.put("tech", resources.path("tech").asInt() + techGain);
        resources.put("population", resources.path("population").asInt() + populationGain);

        int greenGain = applyPercentage(
            counts.ecology + settlementBonus.path("green").asInt(),
            settlementBonus.path("greenPct").asInt(0)
        );
        metrics.put("green", Math.max(0, metrics.path("green").asInt() + greenGain));
        int industryCarbon = applyPercentage(counts.industry * 3, -industryCarbonReductionPct);
        int carbonDelta = industryCarbon - counts.ecology * 2 - counts.science + settlementBonus.path("carbon").asInt();
        if (carbonDelta > 0) {
            carbonDelta = applyPercentage(carbonDelta, -settlementBonus.path("carbonDeltaReductionPct").asInt(0));
        }
        metrics.put(
            "carbon",
            Math.max(0, metrics.path("carbon").asInt() + carbonDelta)
        );
        metrics.put(
            "satisfaction",
            clamp(
                metrics.path("satisfaction").asInt()
                    + counts.society
                    - Math.max(0, counts.industry - counts.ecology)
                    + settlementBonus.path("satisfaction").asInt(),
                0,
                200
            )
        );
        ObjectNode trade = state.with("carbonTrade");
        int quotaBonus = settlementBonus.path("quota").asInt(0);
        if (quotaBonus != 0) {
            trade.put("quota", clamp(trade.path("quota").asInt(0) + quotaBonus, 0, MAX_CARBON_QUOTA));
        }
        trade.put("pricePctModifier", settlementBonus.path("tradePricePct").asInt(0));
        applyCarbonQuotaSettlement(state);
        updateCarbonOverLimitStreak(state);

        int lowCarbonScoreRaw = Math.max(0, calculateLowCarbonScore(state, counts.late) + settlementBonus.path("lowCarbon").asInt(0));
        int lowCarbonScore = Math.max(
            0,
            applyPercentage(lowCarbonScoreRaw, settlementBonus.path("lowCarbonPct").asInt(0) + globalPct)
        );
        metrics.put("lowCarbonScore", lowCarbonScore);
        appendSettlementHistory(state, settlementBonus, resourcesBefore, metricsBefore, tradeBefore);

        String phase = updatePhaseByProgress(state, counts.total, lowCarbonScore);
        int drawCount = switch (phase) {
            case "early" -> 4;
            case "mid" -> 3;
            default -> 2;
        };

        tickActiveNegativeEvents(state);
        applyEventCheck(state);
        processCarbonTradeWindow(state);
        drawCoreCards(state, phase, drawCount);
        drawPolicyCards(state);
        state.put("policyUsedThisTurn", false);
        state.put("corePlacedThisTurn", false);
        state.putNull("lastPolicyUsed");
        updateFailureStreak(state);
        applyEndingEvaluationByDocument(state, counts, lowCarbonScore);

        if (!state.path("sessionEnded").asBoolean(false)) {
            state.put("turn", state.path("turn").asInt() + 1);
        }

        int baseTurnPoint = Math.max(0, lowCarbonScore - Math.max(0, state.path("turn").asInt() - 1));
        return baseTurnPoint + comboTriggered;
    }

    private void validateBoardPlacement(ObjectNode state, int row, int col) {
        int boardSize = state.path("boardSize").asInt(6);
        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Tile is out of board range");
        }
        ObjectNode occupied = state.with("boardOccupied");
        String key = boardKey(row, col);
        if (occupied.has(key)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Tile already occupied");
        }
        if (occupied.isEmpty()) {
            return;
        }
        if (!hasOrthogonalAdjacent(occupied, row, col)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Tile must be orthogonally adjacent");
        }
    }

    private boolean hasOrthogonalAdjacent(ObjectNode occupied, int row, int col) {
        return occupied.has(boardKey(row - 1, col))
            || occupied.has(boardKey(row + 1, col))
            || occupied.has(boardKey(row, col - 1))
            || occupied.has(boardKey(row, col + 1));
    }

    private String boardKey(int row, int col) {
        return row + "," + col;
    }

    private DomainCounts countPlacedDomains(ObjectNode state) {
        ArrayNode placed = state.withArray("placedCore");
        DomainCounts counts = new DomainCounts();
        for (JsonNode cardNode : placed) {
            String cardId = cardNode.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            switch (card.getDomain()) {
                case "industry" -> counts.industry++;
                case "ecology" -> counts.ecology++;
                case "science" -> counts.science++;
                case "society" -> counts.society++;
                default -> {
                    // no-op
                }
            }
            if ("late".equals(card.getPhaseBucket())) {
                counts.late++;
            }
            counts.total++;
        }
        return counts;
    }
    private void resolvePolicyUnlocks(ObjectNode state, DomainCounts counts) {
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        ArrayNode unlocked = state.withArray("policyUnlocked");
        int shenzhenEcologyCards = countShenzhenEcologyCards(state);

        tryUnlockPolicy(state, unlocked, "card061", counts.industry >= 6 && resources.path("industry").asInt() >= 50);
        tryUnlockPolicy(state, unlocked, "card062", counts.industry >= 8 && metrics.path("carbon").asInt() >= 100);
        tryUnlockPolicy(state, unlocked, "card063", counts.ecology >= 6 && metrics.path("green").asInt() >= 70);
        tryUnlockPolicy(state, unlocked, "card064", shenzhenEcologyCards >= 2);
        tryUnlockPolicy(state, unlocked, "card065", counts.science >= 6 && resources.path("tech").asInt() >= 70);
        tryUnlockPolicy(state, unlocked, "card066", counts.science >= 5 && counts.industry >= 5 && resources.path("tech").asInt() >= 80);
        tryUnlockPolicy(state, unlocked, "card067", counts.society >= 5 && counts.ecology >= 5 && metrics.path("satisfaction").asInt() >= 75);
        tryUnlockPolicy(state, unlocked, "card068", counts.society >= 6 && resources.path("population").asInt() >= 60);
    }

    private int countShenzhenEcologyCards(ObjectNode state) {
        int count = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            if (SHENZHEN_ECOLOGY_CARDS.contains(node.asText())) {
                count++;
            }
        }
        return count;
    }

    private int countPlacedTaggedCards(ObjectNode state, String domain, Set<String> tagSet) {
        int count = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            if (domain.equals(card.getDomain()) && tagSet.contains(cardId)) {
                count++;
            }
        }
        return count;
    }

    private int countPlacedBySet(ObjectNode state, Set<String> tagSet) {
        int count = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            if (tagSet.contains(node.asText())) {
                count++;
            }
        }
        return count;
    }

    private AdjacencyStats calculateAdjacencyStats(ObjectNode state) {
        AdjacencyStats stats = new AdjacencyStats();
        ObjectNode occupied = state.with("boardOccupied");
        List<String> keys = new ArrayList<>();
        occupied.fieldNames().forEachRemaining(keys::add);

        for (String key : keys) {
            Coord coord = parseCoord(key);
            if (coord == null) {
                continue;
            }
            String cardId = occupied.path(key).asText("");
            if (cardId.isBlank()) {
                continue;
            }
            String rightKey = boardKey(coord.row, coord.col + 1);
            String downKey = boardKey(coord.row + 1, coord.col);
            if (occupied.has(rightKey)) {
                accumulatePair(stats, cardId, occupied.path(rightKey).asText(""));
            }
            if (occupied.has(downKey)) {
                accumulatePair(stats, cardId, occupied.path(downKey).asText(""));
            }
        }
        return stats;
    }

    private Coord parseCoord(String key) {
        String[] parts = key.split(",");
        if (parts.length != 2) {
            return null;
        }
        try {
            return new Coord(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private void accumulatePair(AdjacencyStats stats, String leftCardId, String rightCardId) {
        if (leftCardId.isBlank() || rightCardId.isBlank()) {
            return;
        }
        GameCardMetaDTO left = cardCatalogService.getRequiredCard(leftCardId);
        GameCardMetaDTO right = cardCatalogService.getRequiredCard(rightCardId);
        String leftDomain = left.getDomain();
        String rightDomain = right.getDomain();
        boolean leftLowCarbon = LOW_CARBON_CORE_CARDS.contains(leftCardId);
        boolean rightLowCarbon = LOW_CARBON_CORE_CARDS.contains(rightCardId);

        if ("industry".equals(leftDomain) && "industry".equals(rightDomain) && leftLowCarbon && rightLowCarbon) {
            stats.industryLowCarbonAdjacentPairs++;
        }
        if ("science".equals(leftDomain) && "science".equals(rightDomain)) {
            stats.scienceScienceAdjacentPairs++;
        }
        if (isPair(leftDomain, rightDomain, "science", "industry")
            && (("industry".equals(leftDomain) && leftLowCarbon) || ("industry".equals(rightDomain) && rightLowCarbon))) {
            stats.scienceIndustryAdjacentPairs++;
        }
        if (isPair(leftDomain, rightDomain, "industry", "ecology")) {
            stats.industryEcologyAdjacentPairs++;
        }
        if (isPair(leftDomain, rightDomain, "society", "ecology")) {
            stats.societyEcologyAdjacentPairs++;
        }
    }

    private boolean isPair(String left, String right, String expectedA, String expectedB) {
        return (expectedA.equals(left) && expectedB.equals(right))
            || (expectedA.equals(right) && expectedB.equals(left));
    }

    private void tryUnlockPolicy(ObjectNode state, ArrayNode unlocked, String policyId, boolean condition) {
        if (!condition || indexOf(unlocked, policyId) >= 0) {
            return;
        }
        unlocked.add(policyId);
        ObjectNode record = objectMapper.createObjectNode();
        record.put("turn", state.path("turn").asInt());
        record.put("eventType", "policy_unlock");
        record.put("policyId", policyId);
        state.withArray("eventHistory").add(record);
    }

    private int applyTurnCombos(ObjectNode state, DomainCounts counts, ObjectNode settlementBonus) {
        int triggered = 0;
        ArrayNode combos = objectMapper.createArrayNode();
        String lastPolicyUsed = state.path("lastPolicyUsed").asText("");
        int lowCarbonIndustryCount = countPlacedTaggedCards(state, "industry", LOW_CARBON_CORE_CARDS);
        int shenzhenEcologyCount = countPlacedTaggedCards(state, "ecology", SHENZHEN_TAG_CORE_CARDS);
        int linkCardCount = countPlacedBySet(state, LINK_TAG_CORE_CARDS);
        AdjacencyStats adjacency = calculateAdjacencyStats(state);

        for (ComboTriggerRule rule : COMBO_TRIGGER_RULES) {
            if (triggered >= MAX_COMBO_PER_TURN) {
                break;
            }
            if (!matchesComboTriggerRule(
                rule,
                lastPolicyUsed,
                counts,
                lowCarbonIndustryCount,
                shenzhenEcologyCount,
                linkCardCount,
                adjacency
            )) {
                continue;
            }
            applyComboEffect(settlementBonus, rule.comboId());
            combos.add(rule.comboId());
            triggered++;
        }

        state.set("comboTriggeredThisTurn", combos);
        if (!combos.isEmpty()) {
            ObjectNode history = objectMapper.createObjectNode();
            history.put("turn", state.path("turn").asInt());
            history.set("combos", combos);
            state.withArray("comboHistory").add(history);
        }
        return triggered;
    }

    private void applyPolicyEffectNow(ObjectNode state, String policyId) {
        PolicyImmediateEffect effect = POLICY_IMMEDIATE_EFFECTS.get(policyId);
        if (effect == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown policy id: " + policyId);
        }
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        ObjectNode trade = state.with("carbonTrade");
        resources.put("industry", resources.path("industry").asInt() + effect.industryDelta());
        resources.put("tech", resources.path("tech").asInt() + effect.techDelta());
        resources.put("population", resources.path("population").asInt() + effect.populationDelta());
        metrics.put("green", metrics.path("green").asInt() + effect.greenDelta());
        metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() + effect.carbonDelta()));
        metrics.put("satisfaction", clamp(metrics.path("satisfaction").asInt() + effect.satisfactionDelta(), 0, 200));
        trade.put("quota", clamp(trade.path("quota").asInt(0) + effect.quotaDelta(), 0, MAX_CARBON_QUOTA));
        if (!effect.group().isBlank() && effect.turns() > 0) {
            upsertActivePolicy(state, policyId, effect.group(), effect.turns());
        }
    }

    private void upsertActivePolicy(ObjectNode state, String policyId, String group, int turns) {
        ArrayNode activePolicies = state.withArray("activePolicies");
        for (int i = activePolicies.size() - 1; i >= 0; i--) {
            if (group.equals(activePolicies.path(i).path("group").asText())) {
                activePolicies.remove(i);
            }
        }
        ObjectNode policyState = objectMapper.createObjectNode();
        policyState.put("policyId", policyId);
        policyState.put("group", group);
        policyState.put("remainingTurns", turns);
        activePolicies.add(policyState);
    }

    private void applyActivePolicyEffects(ObjectNode state, ObjectNode settlementBonus) {
        ArrayNode activePolicies = state.withArray("activePolicies");
        for (int i = activePolicies.size() - 1; i >= 0; i--) {
            ObjectNode policy = (ObjectNode) activePolicies.get(i);
            String policyId = policy.path("policyId").asText();
            PolicyContinuousEffect effect = POLICY_CONTINUOUS_EFFECTS.get(policyId);
            if (effect != null) {
                addBonus(settlementBonus, "industry", effect.industryDelta());
                addBonus(settlementBonus, "tech", effect.techDelta());
                addBonus(settlementBonus, "population", effect.populationDelta());
                addBonus(settlementBonus, "green", effect.greenDelta());
                addBonus(settlementBonus, "carbon", effect.carbonDelta());
                addBonus(settlementBonus, "satisfaction", effect.satisfactionDelta());
                addBonus(settlementBonus, "lowCarbon", effect.lowCarbonDelta());
                addPercentBonus(settlementBonus, "greenPct", effect.greenPct());
                addPercentBonus(settlementBonus, "techPct", effect.techPct());
                addPercentBonus(settlementBonus, "populationPct", effect.populationPct());
                addPercentBonus(settlementBonus, "industryPct", effect.industryPct());
                addPercentBonus(settlementBonus, "industryCarbonReductionPct", effect.industryCarbonReductionPct());
            }

            int remain = policy.path("remainingTurns").asInt();
            if (remain <= 1) {
                activePolicies.remove(i);
            } else {
                policy.put("remainingTurns", remain - 1);
            }
        }
    }

    private void applyActiveNegativeEventEffects(ObjectNode state, ObjectNode settlementBonus) {
        ArrayNode activeEvents = state.withArray("activeNegativeEvents");
        for (JsonNode node : activeEvents) {
            ObjectNode event = (ObjectNode) node;
            if (event.path("remainingTurns").asInt(0) <= 1) {
                continue;
            }
            addBonus(settlementBonus, "green", event.path("greenDelta").asInt(0));
            addBonus(settlementBonus, "carbon", event.path("carbonDelta").asInt(0));
            addBonus(settlementBonus, "satisfaction", event.path("satisfactionDelta").asInt(0));
        }
    }

    private void resolveNegativeEventsByPolicy(ObjectNode state, String policyId) {
        ArrayNode activeEvents = state.withArray("activeNegativeEvents");
        if (activeEvents.isEmpty()) {
            return;
        }

        List<String> resolvableTypes = resolvableEventTypes(policyId);
        if (resolvableTypes.isEmpty()) {
            return;
        }

        ObjectNode metrics = state.with("metrics");
        int resolvedCount = 0;
        for (int i = activeEvents.size() - 1; i >= 0; i--) {
            ObjectNode event = (ObjectNode) activeEvents.get(i);
            String eventType = event.path("eventType").asText();
            if (!resolvableTypes.contains(eventType)) {
                continue;
            }

            metrics.put("green", clamp(metrics.path("green").asInt() - event.path("greenDelta").asInt(), 0, 200));
            metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() - event.path("carbonDelta").asInt()));
            metrics.put("satisfaction", clamp(metrics.path("satisfaction").asInt() - event.path("satisfactionDelta").asInt(), 0, 200));
            activeEvents.remove(i);
            resolvedCount++;

            ObjectNode record = objectMapper.createObjectNode();
            record.put("turn", state.path("turn").asInt());
            record.put("eventType", "event_resolved");
            record.put("resolvedEvent", eventType);
            record.put("policyId", policyId);
            state.withArray("eventHistory").add(record);
        }

        if (resolvedCount > 0) {
            ObjectNode stats = state.with("eventStats");
            stats.put("negativeResolved", stats.path("negativeResolved").asInt(0) + resolvedCount);
        }
    }

    private List<String> resolvableEventTypes(String policyId) {
        return switch (policyId) {
            case "card062", "card066" -> List.of("sea_level_rise");
            case "card063", "card064" -> List.of("flood");
            case "card067", "card068" -> List.of("citizen_protest");
            default -> List.of();
        };
    }

    private void drawPolicyCards(ObjectNode state) {
        ArrayNode unlocked = state.withArray("policyUnlocked");
        if (unlocked.isEmpty()) {
            return;
        }

        ArrayNode handPolicy = state.withArray("handPolicy");
        String selected = unlocked.get(ThreadLocalRandom.current().nextInt(unlocked.size())).asText();
        handPolicy.add(selected);
        enforcePolicyHandLimit(state);
    }

    private void applyCarbonQuotaSettlement(ObjectNode state) {
        int carbon = state.with("metrics").path("carbon").asInt();
        int requiredQuota = Math.max(0, (carbon - 80) / 10);
        ObjectNode trade = state.with("carbonTrade");
        int quota = trade.path("quota").asInt(50);
        int consumed = Math.min(requiredQuota, quota);
        int shortage = Math.max(0, requiredQuota - consumed);

        trade.put("quota", Math.max(0, quota - consumed));
        trade.put("lastQuotaConsumed", consumed);
        if (shortage > 0) {
            trade.put("quotaExhaustedCount", trade.path("quotaExhaustedCount").asInt(0) + 1);
            ObjectNode record = objectMapper.createObjectNode();
            record.put("turn", state.path("turn").asInt());
            record.put("eventType", "quota_shortage");
            record.put("shortage", shortage);
            state.withArray("eventHistory").add(record);
        }
    }

    private void processCarbonTradeWindow(ObjectNode state) {
        int turn = state.path("turn").asInt();
        ObjectNode trade = state.with("carbonTrade");
        trade.put("windowOpened", false);
        if (turn % TRADE_WINDOW_INTERVAL != 0) {
            return;
        }

        int carbon = state.with("metrics").path("carbon").asInt();
        int pricePctModifier = trade.path("pricePctModifier").asInt(0);
        double price = calculateCarbonTradePrice(carbon, pricePctModifier);
        trade.put("windowOpened", true);
        trade.put("lastWindowTurn", turn);
        trade.put("lastPrice", price);
    }

    private int handleCarbonTrade(ObjectNode state, JsonNode actionData) {
        ObjectNode trade = state.with("carbonTrade");
        if (!trade.path("windowOpened").asBoolean(false)) {
            markTradeViolation(state, "window_not_open");
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Carbon trade window is not open");
        }

        String tradeType = readRequiredText(actionData, "tradeType").toLowerCase();
        int amount = readRequiredInt(actionData, "amount");
        if (amount <= 0) {
            markTradeViolation(state, "invalid_amount");
            throw new BizException(ErrorCode.INVALID_PARAMETER, "amount must be greater than 0");
        }

        ObjectNode resources = state.with("resources");
        int currentQuota = trade.path("quota").asInt(0);
        double price = trade.path("lastPrice").asDouble(BASE_CARBON_PRICE);
        double tradeValue = roundToOneDecimal(amount * price);
        double buyTotal = trade.path("buyAmountTotal").asDouble(0D);
        double sellTotal = trade.path("sellAmountTotal").asDouble(0D);
        int industryBefore = resources.path("industry").asInt();

        if ("buy".equals(tradeType)) {
            if (currentQuota + amount > MAX_CARBON_QUOTA) {
                markTradeViolation(state, "quota_overflow");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Quota exceeds maximum capacity");
            }
            int industryCost = (int) Math.ceil(tradeValue);
            if (industryBefore < industryCost) {
                markTradeViolation(state, "insufficient_industry");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Insufficient industry value for trade");
            }
            resources.put("industry", industryBefore - industryCost);
            trade.put("quota", currentQuota + amount);
            buyTotal = roundToOneDecimal(buyTotal + tradeValue);
            trade.put("buyAmountTotal", buyTotal);
        } else if ("sell".equals(tradeType)) {
            if (currentQuota < amount) {
                markTradeViolation(state, "insufficient_quota");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Insufficient quota for selling");
            }
            int industryGain = (int) Math.floor(tradeValue);
            resources.put("industry", industryBefore + industryGain);
            trade.put("quota", currentQuota - amount);
            sellTotal = roundToOneDecimal(sellTotal + tradeValue);
            trade.put("sellAmountTotal", sellTotal);
        } else {
            markTradeViolation(state, "invalid_trade_type");
            throw new BizException(ErrorCode.INVALID_PARAMETER, "tradeType must be buy or sell");
        }

        double profitAfter = roundToOneDecimal(sellTotal - buyTotal);
        trade.put("profit", profitAfter);
        trade.put("windowOpened", false);

        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", trade.path("lastWindowTurn").asInt(state.path("turn").asInt()));
        history.put("price", price);
        history.put("action", tradeType);
        history.put("amount", amount);
        history.put("industryDelta", resources.path("industry").asInt() - industryBefore);
        history.put("profitAfter", profitAfter);
        trade.withArray("history").add(history);
        return 1;
    }

    private void markTradeViolation(ObjectNode state, String reason) {
        ObjectNode trade = state.with("carbonTrade");
        trade.put("invalidOperationCount", trade.path("invalidOperationCount").asInt(0) + 1);

        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.put("action", "violation");
        history.put("reason", reason);
        history.put("profitAfter", roundToOneDecimal(trade.path("profit").asDouble(0D)));
        trade.withArray("history").add(history);
    }

    private void settlePendingTradeWindowAsSkip(ObjectNode state) {
        ObjectNode trade = state.with("carbonTrade");
        if (!trade.path("windowOpened").asBoolean(false)) {
            return;
        }

        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", trade.path("lastWindowTurn").asInt(state.path("turn").asInt()));
        history.put("price", trade.path("lastPrice").asDouble(BASE_CARBON_PRICE));
        history.put("action", "skip");
        history.put("amount", 0);
        history.put("industryDelta", 0);
        history.put("profitAfter", roundToOneDecimal(trade.path("profit").asDouble(0D)));
        trade.withArray("history").add(history);
        trade.put("windowOpened", false);
    }

    private double calculateCarbonTradePrice(int carbon, int pricePctModifier) {
        double randomFactor = 0.8D + ThreadLocalRandom.current().nextDouble() * 0.4D;
        double carbonFactor;
        if (carbon > 100) {
            carbonFactor = 1.1D;
        } else if (carbon < 60) {
            carbonFactor = 0.9D;
        } else {
            carbonFactor = 1.0D;
        }
        double basePrice = BASE_CARBON_PRICE * randomFactor * carbonFactor;
        return roundToOneDecimal(basePrice * (1.0D + pricePctModifier / 100.0D));
    }

    private void updateFailureStreak(ObjectNode state) {
        int carbon = state.path("metrics").path("carbon").asInt();
        if (carbon > 130) {
            state.put("highCarbonStreak", state.path("highCarbonStreak").asInt() + 1);
        } else {
            state.put("highCarbonStreak", 0);
        }
    }

    private void updateCarbonOverLimitStreak(ObjectNode state) {
        int carbon = state.path("metrics").path("carbon").asInt();
        if (carbon > 80) {
            state.put("highCarbonOverLimitStreak", state.path("highCarbonOverLimitStreak").asInt(0) + 1);
        } else {
            state.put("highCarbonOverLimitStreak", 0);
        }
    }

    private void applyEndingEvaluationByDocument(ObjectNode state, DomainCounts counts, int lowCarbonScore) {
        if (state.path("sessionEnded").asBoolean(false)) {
            return;
        }

        ObjectNode metrics = state.with("metrics");
        ObjectNode resources = state.with("resources");
        int turn = state.path("turn").asInt();
        int remainingCoreCards = state.withArray("handCore").size()
            + state.with("remainingPools").withArray("early").size()
            + state.with("remainingPools").withArray("mid").size()
            + state.with("remainingPools").withArray("late").size();
        boolean boundaryReached = remainingCoreCards == 0 || turn >= MAX_TURN;
        boolean immediateFailure = state.path("highCarbonStreak").asInt() >= 5;
        boolean tradeFailure = state.with("carbonTrade").path("quotaExhaustedCount").asInt(0) >= 4
            && state.with("carbonTrade").path("profit").asDouble(0D) < 0D;

        if (immediateFailure) {
            setEnding(
                state,
                ENDING_FAILURE,
                "失败结局",
                "endings/失败结局.jpg",
                "碳排放连续5回合高于130，系统进入失控状态。"
            );
            return;
        }
        if (tradeFailure) {
            setEnding(
                state,
                ENDING_FAILURE,
                "失败结局",
                "endings/失败结局.jpg",
                "配额耗尽记录达到4次且碳交易盈利为负。"
            );
            return;
        }
        if (!boundaryReached) {
            return;
        }

        if (lowCarbonScore < 120) {
            setEnding(
                state,
                ENDING_FAILURE,
                "失败结局",
                "endings/失败结局.jpg",
                "终局时低碳总分低于120。"
            );
            return;
        }

        int maxDomain = Math.max(Math.max(counts.industry, counts.ecology), Math.max(counts.science, counts.society));
        int minDomain = Math.min(Math.min(counts.industry, counts.ecology), Math.min(counts.science, counts.society));
        int usage6768 = countPolicyUsage(state, "card067") + countPolicyUsage(state, "card068");
        double eventResolveRate = calculateNegativeEventResolveRate(state);
        ObjectNode trade = state.with("carbonTrade");

        boolean innovation = counts.science == maxDomain
            && counts.science >= 14
            && resources.path("tech").asInt() >= 220
            && lowCarbonScore >= 170
            && metrics.path("carbon").asInt() <= 95
            && trade.path("profit").asDouble(0D) >= 120D
            && eventResolveRate >= 70D;

        boolean ecology = counts.ecology == maxDomain
            && counts.ecology >= 14
            && metrics.path("green").asInt() >= 140
            && metrics.path("carbon").asInt() <= 70
            && lowCarbonScore >= 170
            && trade.path("quota").asInt(0) >= 30
            && eventResolveRate >= 70D;

        boolean doughnut = counts.society == maxDomain
            && counts.society >= 12
            && metrics.path("satisfaction").asInt() >= 92
            && resources.path("population").asInt() >= 110
            && minDomain >= 8
            && metrics.path("carbon").asInt() <= 80
            && lowCarbonScore >= 165
            && usage6768 >= 3;

        if (innovation) {
            setEnding(
                state,
                ENDING_INNOVATION,
                "创新科技结局",
                "endings/创新科技结局.jpg",
                "科技板块成为主导，城市通过技术迭代实现减排与增长。"
            );
            return;
        }
        if (ecology) {
            setEnding(
                state,
                ENDING_ECOLOGY,
                "生态优先结局",
                "endings/生态优先结局.jpg",
                "生态板块成为主导，绿建和碳汇能力达成高水平。"
            );
            return;
        }
        if (doughnut) {
            setEnding(
                state,
                ENDING_DOUGHNUT,
                "甜甜圈结局",
                "endings/甜甜圈结局.jpg",
                "社会公平与低碳协同，城市进入甜甜圈稳态。"
            );
            return;
        }

        setEnding(
            state,
            ENDING_FAILURE,
            "失败结局",
            "endings/失败结局.jpg",
            "已达到终局边界但未满足任一正向结局条件。"
        );
    }

    private int countPolicyUsage(ObjectNode state, String policyId) {
        int count = 0;
        for (JsonNode node : state.withArray("policyHistory")) {
            if (policyId.equals(node.path("policyId").asText())) {
                count++;
            }
        }
        return count;
    }

    private double calculateNegativeEventResolveRate(ObjectNode state) {
        ObjectNode stats = state.with("eventStats");
        int triggered = stats.path("negativeTriggered").asInt(0);
        int resolved = stats.path("negativeResolved").asInt(0);
        if (triggered <= 0) {
            return 100D;
        }
        return (resolved * 100.0D) / triggered;
    }

    private void setEnding(ObjectNode state, String endingId, String endingName, String imageKey, String reason) {
        ObjectNode ending = objectMapper.createObjectNode();
        ending.put("endingId", endingId);
        ending.put("endingName", endingName);
        ending.put("imageKey", imageKey);
        ending.put("reason", reason);
        ending.put("turn", state.path("turn").asInt());
        state.set("ending", ending);
        state.put("sessionEnded", true);
    }

    private int calculateLowCarbonScore(ObjectNode state, int latePlaced) {
        DomainCounts counts = countPlacedDomains(state);
        int policyUnlocked = state.withArray("policyUnlocked").size();
        int carbon = state.with("metrics").path("carbon").asInt();
        ObjectNode trade = state.with("carbonTrade");
        ObjectNode eventStats = state.with("eventStats");

        int score = counts.total + latePlaced * 2;
        if (counts.industry >= 8) score += 5;
        if (counts.ecology >= 8) score += 5;
        if (counts.science >= 8) score += 5;
        if (counts.society >= 8) score += 5;

        score += policyUnlocked * 3;
        if (policyUnlocked >= 8) {
            score += 10;
        }

        score += eventStats.path("negativeResolved").asInt(0) * 10;
        score -= eventStats.path("negativeTriggered").asInt(0) * 10;

        score += calculateCarbonTierScore(carbon);
        if (state.path("highCarbonOverLimitStreak").asInt(0) >= 3) {
            score -= 15;
        }

        double profit = trade.path("profit").asDouble(0D);
        if (profit > 0) {
            score += ((int) Math.floor(profit / 50D)) * 3;
        }
        score -= trade.path("quotaExhaustedCount").asInt(0) * 5;
        score -= trade.path("invalidOperationCount").asInt(0) * 8;

        return Math.max(0, score);
    }

    private int calculateCarbonTierScore(int carbon) {
        if (carbon <= 70) {
            return 3;
        }
        if (carbon <= 80) {
            return 0;
        }
        if (carbon <= 100) {
            return -2;
        }
        if (carbon <= 130) {
            return -5;
        }
        return -8;
    }

    private void applyEventCheck(ObjectNode state) {
        int cooldown = state.path("eventCooldown").asInt();
        cooldown -= 1;
        if (cooldown <= 0) {
            maybeTriggerNegativeEvent(state);
            state.put("eventCooldown", 3);
        } else {
            state.put("eventCooldown", cooldown);
        }
    }

    private void tickActiveNegativeEvents(ObjectNode state) {
        ArrayNode activeEvents = state.withArray("activeNegativeEvents");
        for (int i = activeEvents.size() - 1; i >= 0; i--) {
            ObjectNode event = (ObjectNode) activeEvents.get(i);
            int remain = event.path("remainingTurns").asInt(1) - 1;
            if (remain <= 0) {
                activeEvents.remove(i);
            } else {
                event.put("remainingTurns", remain);
            }
        }
    }

    private void maybeTriggerNegativeEvent(ObjectNode state) {
        if (ThreadLocalRandom.current().nextDouble() > 0.30D) {
            return;
        }

        ObjectNode metrics = state.with("metrics");
        int turn = state.path("turn").asInt();
        ArrayNode candidates = objectMapper.createArrayNode();
        if (metrics.path("green").asInt() <= 75 && turn % 2 == 0) {
            candidates.add("flood");
        }
        if (metrics.path("carbon").asInt() >= 95) {
            candidates.add("sea_level_rise");
        }
        if (metrics.path("satisfaction").asInt() <= 70 || state.with("resources").path("population").asInt() >= 100) {
            candidates.add("citizen_protest");
        }
        if (candidates.isEmpty()) {
            return;
        }

        String selected = weightedPick(candidates);
        int greenDelta = 0;
        int carbonDelta = 0;
        int satisfactionDelta = 0;
        int durationTurns = 1;
        switch (selected) {
            case "flood" -> {
                if (isFloodEventResisted(state)) {
                    ObjectNode resisted = objectMapper.createObjectNode();
                    resisted.put("turn", state.path("turn").asInt());
                    resisted.put("eventType", "flood_resisted");
                    state.withArray("eventHistory").add(resisted);
                    return;
                }
                greenDelta = -10;
                durationTurns = 1;
                metrics.put("green", Math.max(0, metrics.path("green").asInt() + greenDelta));
            }
            case "sea_level_rise" -> {
                carbonDelta = 15;
                durationTurns = 1;
                metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() + carbonDelta));
                ObjectNode trade = state.with("carbonTrade");
                trade.put("quota", Math.max(0, trade.path("quota").asInt(0) - 2));
            }
            case "citizen_protest" -> {
                satisfactionDelta = -12;
                durationTurns = 2;
                metrics.put("satisfaction", Math.max(0, metrics.path("satisfaction").asInt() + satisfactionDelta));
            }
            default -> {
                return;
            }
        }

        ObjectNode eventNode = objectMapper.createObjectNode();
        eventNode.put("turn", state.path("turn").asInt());
        eventNode.put("eventType", selected);
        state.withArray("eventHistory").add(eventNode);

        ObjectNode activeEvent = objectMapper.createObjectNode();
        activeEvent.put("eventType", selected);
        activeEvent.put("remainingTurns", durationTurns);
        activeEvent.put("greenDelta", greenDelta);
        activeEvent.put("carbonDelta", carbonDelta);
        activeEvent.put("satisfactionDelta", satisfactionDelta);
        state.withArray("activeNegativeEvents").add(activeEvent);

        ObjectNode stats = state.with("eventStats");
        stats.put("negativeTriggered", stats.path("negativeTriggered").asInt(0) + 1);
    }

    private String weightedPick(ArrayNode candidates) {
        int total = 0;
        int[] weights = new int[candidates.size()];
        for (int i = 0; i < candidates.size(); i++) {
            String eventType = candidates.get(i).asText();
            int weight = switch (eventType) {
                case "sea_level_rise" -> 40;
                case "flood" -> 35;
                case "citizen_protest" -> 25;
                default -> 10;
            };
            weights[i] = weight;
            total += weight;
        }
        int roll = ThreadLocalRandom.current().nextInt(total);
        int cursor = 0;
        for (int i = 0; i < candidates.size(); i++) {
            cursor += weights[i];
            if (roll < cursor) {
                return candidates.get(i).asText();
            }
        }
        return candidates.get(0).asText();
    }

    private boolean isFloodEventResisted(ObjectNode state) {
        int resistancePct = resolveFloodResistancePct(state);
        if (resistancePct <= 0) {
            return false;
        }
        int clamped = clamp(resistancePct, 0, 95);
        return ThreadLocalRandom.current().nextInt(100) < clamped;
    }

    private String updatePhaseByProgress(ObjectNode state, int placedCount, int lowCarbonScore) {
        String previousPhase = state.path("phase").asText("early");
        int remainingCoreCards = countRemainingCoreCards(state);
        boolean shouldEnterLate = (placedCount >= 31 && lowCarbonScore >= 101) || remainingCoreCards <= 10;
        boolean shouldStayEarly = placedCount <= 15 && lowCarbonScore < 60;
        boolean shouldEnterMid = placedCount >= 16 && placedCount <= 30 && lowCarbonScore >= 60 && lowCarbonScore <= 100;

        String phase;
        if (shouldEnterLate) {
            phase = "late";
        } else if (shouldStayEarly) {
            phase = "early";
        } else if (shouldEnterMid) {
            phase = "mid";
        } else {
            if (placedCount <= 15) {
                phase = "early";
            } else if (placedCount >= 31) {
                phase = "late";
            } else {
                phase = "mid";
            }
        }
        applyPhaseTransition(state.with("remainingPools"), previousPhase, phase);
        state.put("phase", phase);
        return phase;
    }

    private void applyPhaseTransition(ObjectNode pools, String previousPhase, String currentPhase) {
        if (previousPhase.equals(currentPhase)) {
            return;
        }

        if ("mid".equals(currentPhase)) {
            mergePoolInto(pools.withArray("early"), pools.withArray("mid"));
            return;
        }

        if ("late".equals(currentPhase)) {
            if (!"late".equals(previousPhase)) {
                mergePoolInto(pools.withArray("early"), pools.withArray("late"));
                mergePoolInto(pools.withArray("mid"), pools.withArray("late"));
            }
        }
    }

    private void mergePoolInto(ArrayNode from, ArrayNode to) {
        while (!from.isEmpty()) {
            to.add(from.remove(0));
        }
    }

    private void drawCoreCards(ObjectNode state, String phase, int count) {
        if (count <= 0) {
            return;
        }

        ArrayNode hand = state.withArray("handCore");
        ObjectNode pools = state.with("remainingPools");
        int remainingInPools = countRemainingCardsInPools(pools, phase);
        int drawLimit = Math.min(count, remainingInPools);
        Map<String, Double> domainFactors = resolveCoreDomainDrawFactors(state);

        if (drawLimit <= 0) {
            return;
        }

        for (int i = 0; i < drawLimit; i++) {
            String cardId = drawOneCoreCardFromPools(pools, phase, domainFactors);
            if (cardId == null) {
                break;
            }
            hand.add(cardId);
        }

        enforceCoreHandLimit(state);
    }

    private String drawOneCoreCardFromPools(ObjectNode pools, String phase, Map<String, Double> domainFactors) {
        ArrayNode primaryPool = pools.withArray(phase);
        if (!primaryPool.isEmpty()) {
            return removeWeightedCard(primaryPool, domainFactors);
        }

        if ("early".equals(phase)) {
            ArrayNode midPool = pools.withArray("mid");
            if (!midPool.isEmpty()) {
                return removeWeightedCard(midPool, domainFactors);
            }
            ArrayNode latePool = pools.withArray("late");
            if (!latePool.isEmpty()) {
                return removeWeightedCard(latePool, domainFactors);
            }
            return null;
        }

        if ("mid".equals(phase)) {
            ArrayNode latePool = pools.withArray("late");
            if (!latePool.isEmpty()) {
                return removeWeightedCard(latePool, domainFactors);
            }
            return null;
        }

        return null;
    }

    private String removeWeightedCard(ArrayNode pool, Map<String, Double> domainFactors) {
        int index = pickWeightedIndex(pool, domainFactors);
        String cardId = pool.get(index).asText();
        pool.remove(index);
        return cardId;
    }

    private int pickWeightedIndex(ArrayNode pool, Map<String, Double> domainFactors) {
        if (pool.size() == 1) {
            return 0;
        }

        double[] weights = new double[pool.size()];
        double totalWeight = 0D;
        for (int i = 0; i < pool.size(); i++) {
            String cardId = pool.get(i).asText();
            String domain = cardCatalogService.getRequiredCard(cardId).getDomain();
            double factor = domainFactors.getOrDefault(domain, 1.0D);
            double weight = Math.max(0.01D, factor);
            weights[i] = weight;
            totalWeight += weight;
        }

        double roll = ThreadLocalRandom.current().nextDouble(totalWeight);
        double cursor = 0D;
        for (int i = 0; i < weights.length; i++) {
            cursor += weights[i];
            if (roll <= cursor) {
                return i;
            }
        }
        return weights.length - 1;
    }

    private Map<String, Double> resolveCoreDomainDrawFactors(ObjectNode state) {
        DomainCounts counts = countPlacedDomains(state);
        Map<String, Double> factors = new HashMap<>();
        factors.put("industry", 1.0D);
        factors.put("ecology", 1.0D);
        factors.put("science", 1.0D);
        factors.put("society", 1.0D);

        if (counts.total <= 0) {
            return factors;
        }

        applyDomainFactor(factors, "industry", counts.industry, counts.total);
        applyDomainFactor(factors, "ecology", counts.ecology, counts.total);
        applyDomainFactor(factors, "science", counts.science, counts.total);
        applyDomainFactor(factors, "society", counts.society, counts.total);
        return factors;
    }

    private void applyDomainFactor(Map<String, Double> factors, String domain, int count, int total) {
        double ratio = (double) count / (double) total;
        if (ratio >= 0.40D) {
            factors.put(domain, 0.9D);
        } else if (ratio <= 0.10D) {
            factors.put(domain, 1.1D);
        }
    }

    private int countRemainingCardsInPools(ObjectNode pools, String phase) {
        if ("early".equals(phase)) {
            return pools.withArray("early").size() + pools.withArray("mid").size() + pools.withArray("late").size();
        }
        if ("mid".equals(phase)) {
            return pools.withArray("mid").size() + pools.withArray("late").size();
        }
        return pools.withArray("late").size();
    }

    private int countRemainingCoreCards(ObjectNode state) {
        ObjectNode pools = state.with("remainingPools");
        return state.withArray("handCore").size()
            + pools.withArray("early").size()
            + pools.withArray("mid").size()
            + pools.withArray("late").size();
    }

    private void enforceCoreHandLimit(ObjectNode state) {
        ArrayNode hand = state.withArray("handCore");
        if (hand.size() > CORE_HAND_LIMIT) {
            armPendingDiscard(state);
        }
    }

    private void enforcePolicyHandLimit(ObjectNode state) {
        ArrayNode hand = state.withArray("handPolicy");
        if (hand.size() > POLICY_HAND_LIMIT) {
            armPendingDiscard(state);
        }
    }

    private void armPendingDiscard(ObjectNode state) {
        ObjectNode pending = state.with("pendingDiscard");
        pending.put("active", true);
        pending.put("expiresAt", System.currentTimeMillis() + HAND_DISCARD_DECISION_SECONDS * 1000L);
        pending.put("coreRequired", Math.max(0, state.withArray("handCore").size() - CORE_HAND_LIMIT));
        pending.put("policyRequired", Math.max(0, state.withArray("handPolicy").size() - POLICY_HAND_LIMIT));
    }

    private void refreshPendingDiscardState(ObjectNode state) {
        ObjectNode pending = state.with("pendingDiscard");
        int coreRequired = Math.max(0, state.withArray("handCore").size() - CORE_HAND_LIMIT);
        int policyRequired = Math.max(0, state.withArray("handPolicy").size() - POLICY_HAND_LIMIT);
        pending.put("coreRequired", coreRequired);
        pending.put("policyRequired", policyRequired);
        if (coreRequired == 0 && policyRequired == 0) {
            pending.put("active", false);
            pending.put("expiresAt", 0L);
        }
    }

    private void processPendingDiscardTimeout(ObjectNode state) {
        ObjectNode pending = state.with("pendingDiscard");
        if (!pending.path("active").asBoolean(false)) {
            return;
        }
        long expiresAt = pending.path("expiresAt").asLong(0L);
        if (System.currentTimeMillis() < expiresAt) {
            return;
        }
        while (state.withArray("handCore").size() > CORE_HAND_LIMIT) {
            String cardId = state.withArray("handCore").remove(0).asText();
            state.withArray("discardCore").add(cardId);
            recordAutoDiscard(state, "core", cardId);
        }
        while (state.withArray("handPolicy").size() > POLICY_HAND_LIMIT) {
            String cardId = state.withArray("handPolicy").remove(0).asText();
            state.withArray("discardPolicy").add(cardId);
            recordAutoDiscard(state, "policy", cardId);
        }
        refreshPendingDiscardState(state);
    }

    private void discardFromHand(
        ArrayNode hand,
        ArrayNode discard,
        ObjectNode state,
        String handType,
        String cardId,
        String reason
    ) {
        int idx = indexOf(hand, cardId);
        if (idx < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Card is not in hand");
        }
        hand.remove(idx);
        discard.add(cardId);
        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.put("handType", handType);
        history.put("cardId", cardId);
        history.put("decisionWindowSeconds", HAND_DISCARD_DECISION_SECONDS);
        history.put("reason", reason);
        state.withArray("handOverflowHistory").add(history);
    }

    private void recordAutoDiscard(ObjectNode state, String handType, String cardId) {
        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.put("handType", handType);
        history.put("cardId", cardId);
        history.put("decisionWindowSeconds", HAND_DISCARD_DECISION_SECONDS);
        history.put("reason", "timeout_auto_discard");
        state.withArray("handOverflowHistory").add(history);
    }

    private ArrayNode toShuffledArray(List<String> cards) {
        ArrayNode array = objectMapper.createArrayNode();
        cards.forEach(array::add);
        for (int i = array.size() - 1; i > 0; i--) {
            int swapIndex = ThreadLocalRandom.current().nextInt(i + 1);
            JsonNode tmp = array.get(i);
            array.set(i, array.get(swapIndex));
            array.set(swapIndex, tmp);
        }
        return array;
    }

    private ObjectNode ensureStateObject(JsonNode state) {
        if (state instanceof ObjectNode objectNode) {
            return objectNode;
        }
        throw new BizException(ErrorCode.SYSTEM_ERROR, "Invalid session state");
    }

    private String readRequiredText(JsonNode actionData, String fieldName) {
        if (actionData == null || actionData.path(fieldName).asText().isBlank()) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, fieldName + " is required");
        }
        return actionData.path(fieldName).asText();
    }

    private int readRequiredInt(JsonNode actionData, String fieldName) {
        if (actionData == null || !actionData.hasNonNull(fieldName) || !actionData.path(fieldName).canConvertToInt()) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, fieldName + " must be an integer");
        }
        return actionData.path(fieldName).asInt();
    }

    private int indexOf(ArrayNode arrayNode, String value) {
        for (int i = 0; i < arrayNode.size(); i++) {
            if (value.equals(arrayNode.get(i).asText())) {
                return i;
            }
        }
        return -1;
    }

    private ObjectNode captureValueNode(ObjectNode source, String... fields) {
        ObjectNode captured = objectMapper.createObjectNode();
        for (String field : fields) {
            captured.put(field, source.path(field).asInt(0));
        }
        return captured;
    }

    private void appendSettlementHistory(
        ObjectNode state,
        ObjectNode settlementBonus,
        ObjectNode resourcesBefore,
        ObjectNode metricsBefore,
        ObjectNode tradeBefore
    ) {
        ObjectNode resourcesAfter = state.with("resources");
        ObjectNode metricsAfter = state.with("metrics");
        ObjectNode tradeAfter = state.with("carbonTrade");

        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.set("cardEffects", settlementBonus.deepCopy());
        history.set("resources", buildDeltaNode(resourcesBefore, resourcesAfter, "industry", "tech", "population"));
        history.set("metrics", buildDeltaNode(metricsBefore, metricsAfter, "green", "carbon", "satisfaction", "lowCarbonScore"));
        history.set("trade", buildDeltaNode(tradeBefore, tradeAfter, "quota", "pricePctModifier"));
        state.withArray("settlementHistory").add(history);
    }

    private ObjectNode buildDeltaNode(ObjectNode before, ObjectNode after, String... fields) {
        ObjectNode deltaNode = objectMapper.createObjectNode();
        for (String field : fields) {
            int beforeValue = before.path(field).asInt(0);
            int afterValue = after.path(field).asInt(0);
            ObjectNode item = objectMapper.createObjectNode();
            item.put("before", beforeValue);
            item.put("delta", afterValue - beforeValue);
            item.put("after", afterValue);
            deltaNode.set(field, item);
        }
        return deltaNode;
    }

    private void putAllBonusFields(ObjectNode bonus, int init) {
        bonus.put("industry", init);
        bonus.put("tech", init);
        bonus.put("population", init);
        bonus.put("industryPct", init);
        bonus.put("techPct", init);
        bonus.put("populationPct", init);
        bonus.put("green", init);
        bonus.put("greenPct", init);
        bonus.put("carbon", init);
        bonus.put("carbonDeltaReductionPct", init);
        bonus.put("industryCarbonReductionPct", init);
        bonus.put("satisfaction", init);
        bonus.put("quota", init);
        bonus.put("tradePricePct", init);
        bonus.put("comboPct", init);
        bonus.put("newEnergyIndustryPct", init);
        bonus.put("lowCarbon", init);
        bonus.put("lowCarbonPct", init);
        bonus.put("globalPct", init);
    }

    private void addBonus(ObjectNode bonus, String field, int delta) {
        bonus.put(field, bonus.path(field).asInt() + delta);
    }

    private void addPercentBonus(ObjectNode bonus, String field, int delta) {
        bonus.put(field, bonus.path(field).asInt() + delta);
    }

    private void applyComboEffect(ObjectNode settlementBonus, String comboId) {
        ComboEffect effect = COMBO_EFFECTS.get(comboId);
        if (effect == null) {
            return;
        }
        int comboPct = settlementBonus.path("comboPct").asInt(0);
        addBonus(settlementBonus, "industry", applyPercentage(effect.industryDelta(), comboPct));
        addBonus(settlementBonus, "tech", applyPercentage(effect.techDelta(), comboPct));
        addBonus(settlementBonus, "population", applyPercentage(effect.populationDelta(), comboPct));
        addBonus(settlementBonus, "green", applyPercentage(effect.greenDelta(), comboPct));
        addBonus(settlementBonus, "carbon", applyPercentage(effect.carbonDelta(), comboPct));
        addBonus(settlementBonus, "satisfaction", applyPercentage(effect.satisfactionDelta(), comboPct));
        addBonus(settlementBonus, "quota", applyPercentage(effect.quotaDelta(), comboPct));
        addBonus(settlementBonus, "lowCarbon", applyPercentage(effect.lowCarbonDelta(), comboPct));
        addPercentBonus(settlementBonus, "techPct", applyPercentage(effect.techPct(), comboPct));
        addPercentBonus(settlementBonus, "populationPct", applyPercentage(effect.populationPct(), comboPct));
        addPercentBonus(settlementBonus, "industryPct", applyPercentage(effect.industryPct(), comboPct));
        addPercentBonus(settlementBonus, "lowCarbonPct", applyPercentage(effect.lowCarbonPct(), comboPct));
        addPercentBonus(settlementBonus, "greenPct", applyPercentage(effect.greenPct(), comboPct));
        addPercentBonus(settlementBonus, "globalPct", applyPercentage(effect.globalPct(), comboPct));
    }

    private void applyCoreContinuousEffects(ObjectNode state, DomainCounts counts, ObjectNode settlementBonus) {
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            CoreContinuousEffect effect = CORE_CONTINUOUS_EFFECTS.get(cardId);
            if (effect == null || !isCoreEffectConditionMatched(cardId, state, counts, resources, metrics)) {
                continue;
            }
            addBonus(settlementBonus, "industry", effect.industryDelta());
            addBonus(settlementBonus, "tech", effect.techDelta());
            addBonus(settlementBonus, "population", effect.populationDelta());
            addBonus(settlementBonus, "green", effect.greenDelta());
            addBonus(settlementBonus, "carbon", effect.carbonDelta());
            addBonus(settlementBonus, "satisfaction", effect.satisfactionDelta());
            addBonus(settlementBonus, "quota", effect.quotaDelta());
            addBonus(settlementBonus, "lowCarbon", effect.lowCarbonDelta());
            addPercentBonus(settlementBonus, "industryPct", effect.industryPct());
            addPercentBonus(settlementBonus, "techPct", effect.techPct());
            addPercentBonus(settlementBonus, "populationPct", effect.populationPct());
            addPercentBonus(settlementBonus, "greenPct", effect.greenPct());
            addPercentBonus(settlementBonus, "globalPct", effect.globalPct());
            addPercentBonus(settlementBonus, "lowCarbonPct", effect.lowCarbonPct());
            addPercentBonus(settlementBonus, "industryCarbonReductionPct", effect.industryCarbonReductionPct());
            addPercentBonus(settlementBonus, "carbonDeltaReductionPct", effect.carbonDeltaReductionPct());
            addPercentBonus(settlementBonus, "tradePricePct", effect.tradePricePct());
            addPercentBonus(settlementBonus, "comboPct", effect.comboPct());
        }
    }

    private void applyCoreSpecialEffects(ObjectNode state, DomainCounts counts, ObjectNode settlementBonus) {
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            CoreSpecialEffect effect = CORE_SPECIAL_EFFECTS.get(cardId);
            if (effect == null || !isCoreSpecialEffectMatched(cardId, state, counts, resources, metrics)) {
                continue;
            }
            addPercentBonus(settlementBonus, "newEnergyIndustryPct", effect.newEnergyIndustryPct());
            if (effect.ecologyCarbonSinkPerTenGreen() > 0) {
                int dynamicCarbonReduction = (metrics.path("green").asInt(0) / 10) * effect.ecologyCarbonSinkPerTenGreen();
                addBonus(settlementBonus, "carbon", -dynamicCarbonReduction);
            }
        }
    }

    private int resolveCorePlacementCostReductionPct(ObjectNode state, String targetDomain) {
        if (!"ecology".equals(targetDomain) && !"science".equals(targetDomain)) {
            return 0;
        }
        DomainCounts counts = countPlacedDomains(state);
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        int reductionPct = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            CoreSpecialEffect effect = CORE_SPECIAL_EFFECTS.get(cardId);
            if (effect == null || !isCoreSpecialEffectMatched(cardId, state, counts, resources, metrics)) {
                continue;
            }
            if ("ecology".equals(targetDomain)) {
                reductionPct += effect.ecologyCardCostReductionPct();
            } else {
                reductionPct += effect.scienceCardCostReductionPct();
            }
        }
        return clamp(reductionPct, 0, 90);
    }

    private int resolveFloodResistancePct(ObjectNode state) {
        DomainCounts counts = countPlacedDomains(state);
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        int resistancePct = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            CoreSpecialEffect effect = CORE_SPECIAL_EFFECTS.get(cardId);
            if (effect == null || !isCoreSpecialEffectMatched(cardId, state, counts, resources, metrics)) {
                continue;
            }
            resistancePct += effect.floodResistancePct();
        }
        return resistancePct;
    }

    private boolean isCoreSpecialEffectMatched(
        String cardId,
        ObjectNode state,
        DomainCounts counts,
        ObjectNode resources,
        ObjectNode metrics
    ) {
        if ("card056".equals(cardId) && !hasEventInHistory(state, "flood")) {
            return false;
        }
        if ("card059".equals(cardId) && counts.ecology < 2) {
            return false;
        }
        return isCoreEffectConditionMatched(cardId, state, counts, resources, metrics);
    }

    private boolean hasEventInHistory(ObjectNode state, String eventType) {
        for (JsonNode node : state.withArray("eventHistory")) {
            if (eventType.equals(node.path("eventType").asText())) {
                return true;
            }
        }
        return false;
    }

    private boolean isCoreEffectConditionMatched(
        String cardId,
        ObjectNode state,
        DomainCounts counts,
        ObjectNode resources,
        ObjectNode metrics
    ) {
        CoreEffectCondition condition = CORE_EFFECT_CONDITIONS.get(cardId);
        if (condition == null) {
            return true;
        }
        if (state.path("turn").asInt() < condition.minTurn()) {
            return false;
        }
        if (resources.path("industry").asInt() < condition.minIndustryResource()) {
            return false;
        }
        if (resources.path("tech").asInt() < condition.minTechResource()) {
            return false;
        }
        if (metrics.path("carbon").asInt() > condition.maxCarbon()) {
            return false;
        }
        if (counts.industry < condition.minIndustryCards()) {
            return false;
        }
        if (state.with("domainProgress").path("industry").asInt(0) < condition.minIndustryProgressPct()) {
            return false;
        }
        if (condition.minTaggedCards() <= 0) {
            return true;
        }
        return countPlacedByConditionTag(state, condition.requiredTag()) >= condition.minTaggedCards();
    }

    private int countPlacedByConditionTag(ObjectNode state, String requiredTag) {
        if (requiredTag == null || requiredTag.isBlank()) {
            return 0;
        }
        Set<String> target = switch (requiredTag) {
            case "new_energy_industry" -> NEW_ENERGY_INDUSTRY_CARDS;
            case "traditional_industry" -> TRADITIONAL_INDUSTRY_CARDS;
            default -> Set.of();
        };
        return countPlacedBySet(state, target);
    }

    private void refreshDomainProgress(ObjectNode state, DomainCounts counts) {
        ObjectNode progress = state.with("domainProgress");
        progress.put("industry", calculateDomainProgressWithBonus(state, "industry", counts.industry));
        progress.put("ecology", calculateDomainProgressWithBonus(state, "ecology", counts.ecology));
        progress.put("science", calculateDomainProgressWithBonus(state, "science", counts.science));
        progress.put("society", calculateDomainProgressWithBonus(state, "society", counts.society));
    }

    private int calculateDomainProgressWithBonus(ObjectNode state, String domain, int domainCount) {
        int baseProgress = (int) Math.floor(domainCount * 100.0D / DOMAIN_PROGRESS_CARD_CAP);
        int bonusProgress = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            Integer bonus = CORE_DOMAIN_PROGRESS_BONUS.get(cardId);
            if (bonus == null || bonus <= 0) {
                continue;
            }
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            if (domain.equals(card.getDomain())) {
                bonusProgress += bonus;
            }
        }
        return clamp(baseProgress + bonusProgress, 0, 200);
    }

    private boolean matchesComboTriggerRule(
        ComboTriggerRule rule,
        String lastPolicyUsed,
        DomainCounts counts,
        int lowCarbonIndustryCount,
        int shenzhenEcologyCount,
        int linkCardCount,
        AdjacencyStats adjacency
    ) {
        if (rule.requiredPolicyId() != null && !rule.requiredPolicyId().equals(lastPolicyUsed)) {
            return false;
        }
        return counts.industry >= rule.minIndustry()
            && counts.ecology >= rule.minEcology()
            && counts.science >= rule.minScience()
            && counts.society >= rule.minSociety()
            && lowCarbonIndustryCount >= rule.minLowCarbonIndustry()
            && shenzhenEcologyCount >= rule.minShenzhenEcology()
            && linkCardCount >= rule.minLinkCards()
            && adjacency.industryLowCarbonAdjacentPairs >= rule.minIndustryLowCarbonAdjacentPairs()
            && adjacency.scienceScienceAdjacentPairs >= rule.minScienceScienceAdjacentPairs()
            && adjacency.scienceIndustryAdjacentPairs >= rule.minScienceIndustryAdjacentPairs()
            && adjacency.industryEcologyAdjacentPairs >= rule.minIndustryEcologyAdjacentPairs()
            && adjacency.societyEcologyAdjacentPairs >= rule.minSocietyEcologyAdjacentPairs();
    }

    private int applyPercentage(int baseValue, int percent) {
        if (percent == 0) {
            return baseValue;
        }
        return (int) Math.round(baseValue * (1.0D + percent / 100.0D));
    }

    private int calculateLevel(long score) {
        return (int) (score / 100) + 1;
    }

    private record PolicyImmediateEffect(
        int industryDelta,
        int techDelta,
        int populationDelta,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int quotaDelta,
        String group,
        int turns
    ) {
    }

    private record PolicyContinuousEffect(
        int industryDelta,
        int techDelta,
        int populationDelta,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int lowCarbonDelta,
        int greenPct,
        int techPct,
        int populationPct,
        int industryPct,
        int industryCarbonReductionPct
    ) {
    }

    private record ComboEffect(
        int industryDelta,
        int techDelta,
        int populationDelta,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int quotaDelta,
        int lowCarbonDelta,
        int techPct,
        int populationPct,
        int industryPct,
        int lowCarbonPct,
        int greenPct,
        int globalPct
    ) {
    }

    private record ComboTriggerRule(
        String comboId,
        String requiredPolicyId,
        int minIndustry,
        int minEcology,
        int minScience,
        int minSociety,
        int minLowCarbonIndustry,
        int minShenzhenEcology,
        int minLinkCards,
        int minIndustryLowCarbonAdjacentPairs,
        int minScienceScienceAdjacentPairs,
        int minScienceIndustryAdjacentPairs,
        int minIndustryEcologyAdjacentPairs,
        int minSocietyEcologyAdjacentPairs
    ) {
    }

    private record CoreContinuousEffect(
        int industryDelta,
        int techDelta,
        int populationDelta,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int quotaDelta,
        int lowCarbonDelta,
        int industryPct,
        int techPct,
        int populationPct,
        int greenPct,
        int globalPct,
        int lowCarbonPct,
        int industryCarbonReductionPct,
        int carbonDeltaReductionPct,
        int tradePricePct,
        int comboPct
    ) {
    }

    private record CoreEffectCondition(
        int minTurn,
        int minIndustryResource,
        int minTechResource,
        int maxCarbon,
        int minIndustryCards,
        int minIndustryProgressPct,
        int minTaggedCards,
        String requiredTag
    ) {
    }

    private record CoreSpecialEffect(
        int ecologyCardCostReductionPct,
        int scienceCardCostReductionPct,
        int floodResistancePct,
        int newEnergyIndustryPct,
        int ecologyCarbonSinkPerTenGreen
    ) {
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0D) / 10.0D;
    }

    private int safeCost(Integer cost) {
        return cost == null ? 0 : Math.max(0, cost);
    }

    private UUID resolveCurrentUserId() {
        return SecurityUtil.getCurrentUserId();
    }

    private UUID resolveCurrentUserIdOptional() {
        return SecurityUtil.getCurrentUserIdOptional();
    }

    private GameSessionEntity createSession(UUID userId) {
        ObjectNode initialState = buildInitialState();
        long initialScore = initialState.path("metrics").path("lowCarbonScore").asLong(0);
        LocalDateTime now = LocalDateTime.now();

        GameSessionEntity session = new GameSessionEntity();
        session.setId(UUID.randomUUID());
        session.setUserId(userId);
        session.setPondState(initialState);
        session.setScore(initialScore);
        session.setLevel(calculateLevel(initialScore));
        session.setStartedAt(now);
        session.setLastActionAt(now);
        session.setStatus(SESSION_ACTIVE);
        session.setCreatedAt(now);
        session.setUpdatedAt(now);
        return session;
    }

    private GameSessionDTO toDTO(GameSessionEntity entity) {
        return GameSessionDTO.builder()
            .id(entity.getId())
            .userId(entity.getUserId())
            .pondState(entity.getPondState())
            .score(entity.getScore())
            .level(entity.getLevel())
            .startedAt(entity.getStartedAt())
            .lastActionAt(entity.getLastActionAt())
            .status(entity.getStatus())
            .build();
    }

    private static class Coord {
        private final int row;
        private final int col;

        private Coord(int row, int col) {
            this.row = row;
            this.col = col;
        }
    }

    private static class AdjacencyStats {
        private int industryLowCarbonAdjacentPairs;
        private int scienceScienceAdjacentPairs;
        private int scienceIndustryAdjacentPairs;
        private int industryEcologyAdjacentPairs;
        private int societyEcologyAdjacentPairs;
    }

    private static class DomainCounts {
        private int industry;
        private int ecology;
        private int science;
        private int society;
        private int late;
        private int total;
    }
}
