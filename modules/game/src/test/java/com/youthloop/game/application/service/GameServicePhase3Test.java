package com.youthloop.game.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.common.exception.BizException;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.persistence.entity.GameSessionEntity;
import com.youthloop.game.persistence.mapper.GameActionMapper;
import com.youthloop.game.persistence.mapper.GameSessionMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class GameServicePhase3Test {

    @Mock
    private GameSessionMapper gameSessionMapper;
    @Mock
    private GameActionMapper gameActionMapper;
    @Mock
    private CardCatalogService cardCatalogService;
    @Mock
    private GameRuleConfigService gameRuleConfigService;

    @InjectMocks
    private GameService gameService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();
    private final UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111112");
    private final UUID sessionId = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER")))
        );
        lenient().when(gameRuleConfigService.listComboRules()).thenReturn(defaultComboRules());
        lenient().when(gameRuleConfigService.eventRuleMap()).thenReturn(defaultEventRuleMap());
        lenient().when(gameRuleConfigService.eventTriggerProbabilityPct()).thenReturn(30);
        lenient().when(gameRuleConfigService.cardTagMap()).thenReturn(defaultCardTagMap());
        lenient().when(gameRuleConfigService.listPolicyUnlockRules()).thenReturn(defaultPolicyUnlockRules());
        lenient().when(gameRuleConfigService.coreSpecialConditionMap()).thenReturn(defaultCoreSpecialConditionMap());
        lenient().when(gameRuleConfigService.runtimeParam()).thenReturn(defaultRuntimeParam());
        lenient().when(gameRuleConfigService.balanceRule()).thenReturn(defaultBalanceRule());
        lenient().when(gameRuleConfigService.endingContentMap()).thenReturn(defaultEndingContentMap());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void usePolicyCardShouldConsumeCardAndApplyImmediateEffect() {
        ObjectNode state = baseState();
        state.withArray("policyUnlocked").add("card061");
        state.withArray("handPolicy").add("card061");

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card061")).thenReturn(policyCard("card061"));

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(3);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "card061"));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(2, response.getPointsEarned());
        assertEquals(45, next.path("resources").path("industry").asInt());
        assertEquals(72, next.path("metrics").path("carbon").asInt());
        assertEquals(0, next.withArray("handPolicy").size());
        assertTrue(next.path("policyUsedThisTurn").asBoolean());
        assertEquals("card061", next.path("lastPolicyUsed").asText());

        verify(gameSessionMapper).update(any());
        verify(gameActionMapper).insert(any());
    }

    @Test
    void usePolicyCardShouldResolveMatchingNegativeEvent() {
        ObjectNode state = baseState();
        state.withArray("policyUnlocked").add("card064");
        state.withArray("handPolicy").add("card064");

        ObjectNode activeEvent = objectMapper.createObjectNode();
        activeEvent.put("eventType", "flood");
        activeEvent.put("remainingTurns", 1);
        activeEvent.put("greenDelta", -10);
        activeEvent.put("carbonDelta", 0);
        activeEvent.put("satisfactionDelta", 0);
        state.withArray("activeNegativeEvents").add(activeEvent);
        state.with("metrics").put("green", 40);
        state.with("eventStats").put("negativeTriggered", 1);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card064")).thenReturn(policyCard("card064"));

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(3);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "card064"));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(0, next.withArray("activeNegativeEvents").size());
        assertEquals(1, next.with("eventStats").path("negativeResolved").asInt());
        assertTrue(next.withArray("eventHistory").size() >= 1);
    }

    @Test
    void usePolicyCardShouldFailWhenPolicyAlreadyUsedThisTurn() {
        ObjectNode state = baseState();
        state.put("policyUsedThisTurn", true);
        state.withArray("policyUnlocked").add("card061");
        state.withArray("handPolicy").add("card061");

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card061")).thenReturn(policyCard("card061"));

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(3);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "card061"));

        assertThrows(BizException.class, () -> gameService.performAction(request));
    }

    @Test
    void placeCoreCardShouldRequireOrthogonalAdjacencyAfterFirstPlacement() {
        ObjectNode state = baseState();
        state.withArray("handCore").add("card001");
        state.withArray("handCore").add("card002");

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card001")).thenReturn(coreIndustryCard("card001"));

        GameActionRequest placeFirst = new GameActionRequest();
        placeFirst.setSessionId(sessionId);
        placeFirst.setActionType(1);
        placeFirst.setActionData(objectMapper.createObjectNode().put("cardId", "card001").put("row", 0).put("col", 0));
        GameActionResponse first = gameService.performAction(placeFirst);
        ((ObjectNode) first.getNewPondState()).put("corePlacedThisTurn", false);

        GameActionRequest placeSecond = new GameActionRequest();
        placeSecond.setSessionId(sessionId);
        placeSecond.setActionType(1);
        placeSecond.setActionData(objectMapper.createObjectNode().put("cardId", "card002").put("row", 2).put("col", 2));

        assertThrows(BizException.class, () -> gameService.performAction(placeSecond));
    }

    @Test
    void discardActionShouldRemoveCardWhenPendingDiscardActive() {
        ObjectNode state = baseState();
        state.withArray("handCore").add("card001");
        state.withArray("discardCore").removeAll();
        state.with("pendingDiscard").put("active", true);
        state.with("pendingDiscard").put("expiresAt", System.currentTimeMillis() + 5000L);
        state.with("pendingDiscard").put("coreRequired", 1);
        state.with("pendingDiscard").put("policyRequired", 0);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest discard = new GameActionRequest();
        discard.setSessionId(sessionId);
        discard.setActionType(5);
        discard.setActionData(objectMapper.createObjectNode().put("handType", "core").put("cardId", "card001"));

        GameActionResponse response = gameService.performAction(discard);
        ObjectNode next = (ObjectNode) response.getNewPondState();
        assertEquals(0, next.withArray("handCore").size());
        assertEquals(1, next.withArray("discardCore").size());
        assertTrue(!next.with("pendingDiscard").path("active").asBoolean());
    }

    @Test
    void placeCoreCardShouldApplyCard035EcologyCostReduction() {
        ObjectNode state = baseState();
        state.withArray("placedCore").add("card035");
        state.withArray("handCore").add("eco101");

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card035")).thenReturn(coreCard("card035", "ecology"));
        when(cardCatalogService.getRequiredCard("eco101")).thenReturn(coreCardWithCost("eco101", "ecology", 10, 0, 0, 0));

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(1);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "eco101").put("row", 0).put("col", 0));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(22, next.with("resources").path("industry").asInt());
        assertTrue(indexOf(next.withArray("placedCore"), "eco101") >= 0);
    }

    @Test
    void placeCoreCardShouldApplyCard045ScienceCostReduction() {
        ObjectNode state = baseState();
        state.withArray("placedCore").add("card045");
        state.withArray("handCore").add("sci101");

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card045")).thenReturn(coreCard("card045", "science"));
        when(cardCatalogService.getRequiredCard("sci101")).thenReturn(coreCardWithCost("sci101", "science", 0, 10, 0, 0));

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(1);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "sci101").put("row", 0).put("col", 0));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(12, next.with("resources").path("tech").asInt());
        assertTrue(indexOf(next.withArray("placedCore"), "sci101") >= 0);
    }

    @Test
    void endTurnShouldApplyIntraIndustryComboPercentBonus() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card006").add("card020").add("card055").add("card060");
        state.with("boardOccupied").put("0,0", "card006");
        state.with("boardOccupied").put("0,1", "card020");
        state.with("boardOccupied").put("0,2", "card055");
        state.with("boardOccupied").put("0,3", "card060");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card006", coreCard("card006", "industry"),
            "card020", coreCard("card020", "industry"),
            "card055", coreCard("card055", "industry"),
            "card060", coreCard("card060", "industry")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(44, next.with("resources").path("industry").asInt());
        assertTrue(indexOf(next.withArray("comboTriggeredThisTurn"), "intra_industry_scale") >= 0);
    }

    @Test
    void endTurnShouldApplyIntraSocietyComboPopulationPercentBonus() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore")
            .add("card046")
            .add("card047")
            .add("card048")
            .add("card049")
            .add("card021")
            .add("card022");
        state.with("boardOccupied").put("0,0", "card046");
        state.with("boardOccupied").put("0,1", "card021");
        state.with("boardOccupied").put("1,0", "card047");
        state.with("boardOccupied").put("1,1", "card022");
        state.with("boardOccupied").put("2,0", "card048");
        state.with("boardOccupied").put("2,1", "card049");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card046", coreCard("card046", "society"),
            "card047", coreCard("card047", "society"),
            "card048", coreCard("card048", "society"),
            "card049", coreCard("card049", "society"),
            "card021", coreCard("card021", "ecology"),
            "card022", coreCard("card022", "ecology")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(34, next.with("resources").path("population").asInt());
        assertEquals(77, next.with("metrics").path("satisfaction").asInt());
        assertTrue(indexOf(next.withArray("comboTriggeredThisTurn"), "intra_society_mobilize") >= 0);
    }

    @Test
    void endTurnShouldApplyIntraScienceComboPercentAndLowCarbonPercentBonus() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.with("carbonTrade").put("profit", 200.0D);
        state.withArray("placedCore").add("card036").add("card037").add("card038").add("card039");
        state.with("boardOccupied").put("0,0", "card036");
        state.with("boardOccupied").put("0,1", "card037");
        state.with("boardOccupied").put("1,1", "card038");
        state.with("boardOccupied").put("1,2", "card039");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card036", coreCard("card036", "science"),
            "card037", coreCard("card037", "science"),
            "card038", coreCard("card038", "science"),
            "card039", coreCard("card039", "science")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(29, next.with("resources").path("tech").asInt());
        assertEquals(17L, response.getTotalScore());
        assertTrue(!next.with("metrics").has("lowCarbonScore"));
        assertTrue(indexOf(next.withArray("comboTriggeredThisTurn"), "intra_science_boost") >= 0);
    }

    @Test
    void performActionShouldHideLowCarbonScoreInReturnedState() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card001");
        when(cardCatalogService.getRequiredCard("card001")).thenReturn(coreCard("card001", "industry"));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(next.path("metrics").isObject());
        assertTrue(!next.with("metrics").has("lowCarbonScore"));
        assertTrue(response.getTotalScore() >= 0);
    }

    @Test
    void endTurnShouldApplyCard065ContinuousTechPercentBonus() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card036").add("card037").add("card038").add("card039");
        ObjectNode activePolicy = objectMapper.createObjectNode();
        activePolicy.put("policyId", "card065");
        activePolicy.put("group", "science_support");
        activePolicy.put("remainingTurns", 3);
        state.withArray("activePolicies").add(activePolicy);

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card036", coreCard("card036", "science"),
            "card037", coreCard("card037", "science"),
            "card038", coreCard("card038", "science"),
            "card039", coreCard("card039", "science")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        when(cardCatalogService.getRequiredCard("card065")).thenReturn(policyCard("card065"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(35, next.with("resources").path("tech").asInt());
    }

    @Test
    void endTurnShouldApplyCard040NewEnergyIndustryBoost() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card006").add("card018").add("card055").add("card040");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card006", coreCard("card006", "industry"),
            "card018", coreCard("card018", "industry"),
            "card055", coreCard("card055", "industry"),
            "card040", coreCard("card040", "science")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(68, next.with("resources").path("industry").asInt());
    }

    @Test
    void endTurnShouldApplyCard059DynamicCarbonSinkByGreen() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card059").add("card021");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card059", coreCard("card059", "ecology"),
            "card021", coreCard("card021", "ecology")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(57, next.with("metrics").path("green").asInt());
        assertEquals(50, next.with("metrics").path("carbon").asInt());
    }

    @Test
    void placeCoreCardShouldNotApplyCard056EcologyCostReductionWithoutFloodHistory() {
        ObjectNode state = baseState();
        state.withArray("placedCore").add("card056");
        state.withArray("handCore").add("eco201");

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card056")).thenReturn(coreCard("card056", "ecology"));
        when(cardCatalogService.getRequiredCard("eco201")).thenReturn(coreCardWithCost("eco201", "ecology", 10, 0, 0, 0));

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(1);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "eco201").put("row", 0).put("col", 0));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(20, next.with("resources").path("industry").asInt());
    }

    @Test
    void placeCoreCardShouldApplyCard056EcologyCostReductionAfterFloodHistory() {
        ObjectNode state = baseState();
        state.withArray("placedCore").add("card056");
        state.withArray("handCore").add("eco202");
        state.withArray("eventHistory").add(objectMapper.createObjectNode().put("eventType", "flood"));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card056")).thenReturn(coreCard("card056", "ecology"));
        when(cardCatalogService.getRequiredCard("eco202")).thenReturn(coreCardWithCost("eco202", "ecology", 10, 0, 0, 0));

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(1);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "eco202").put("row", 0).put("col", 0));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(25, next.with("resources").path("industry").asInt());
    }

    @Test
    void placeCoreCardShouldIgnoreCard056FloodConstraintWhenNoSpecialConditionConfig() {
        ObjectNode state = baseState();
        state.withArray("placedCore").add("card056");
        state.withArray("handCore").add("eco203");

        when(gameRuleConfigService.coreSpecialConditionMap()).thenReturn(Map.of());
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);
        when(cardCatalogService.getRequiredCard("card056")).thenReturn(coreCard("card056", "ecology"));
        when(cardCatalogService.getRequiredCard("eco203")).thenReturn(coreCardWithCost("eco203", "ecology", 10, 0, 0, 0));

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(1);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "eco203").put("row", 0).put("col", 0));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(25, next.with("resources").path("industry").asInt());
    }

    @Test
    void endTurnShouldApplyCard057IndustryPercentWhenConditionMatched() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card057").add("card001").add("card002").add("card018");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card057", coreCard("card057", "industry"),
            "card001", coreCard("card001", "industry"),
            "card002", coreCard("card002", "industry"),
            "card018", coreCard("card018", "industry")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(87, next.with("resources").path("industry").asInt());
    }

    @Test
    void endTurnShouldNotApplyCard060ContinuousEffectWhenConditionNotMatched() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card060");

        when(cardCatalogService.getRequiredCard("card060")).thenReturn(coreLateCard("card060", "industry"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(33, next.with("resources").path("industry").asInt());
    }

    @Test
    void endTurnShouldApplyCard060ContinuousEffectWhenConditionMatched() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.with("resources").put("industry", 100);
        state.with("metrics").put("carbon", 60);
        state.withArray("placedCore").add("card060");

        when(cardCatalogService.getRequiredCard("card060")).thenReturn(coreLateCard("card060", "industry"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(111, next.with("resources").path("industry").asInt());
    }

    @Test
    void endTurnShouldRecordSettlementHistoryWithBeforeDeltaAfter() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card001");
        when(cardCatalogService.getRequiredCard("card001")).thenReturn(coreCard("card001", "industry"));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(next.path("cardEffectSnapshot").isObject());
        assertEquals(1, next.withArray("settlementHistory").size());
        ObjectNode history = (ObjectNode) next.withArray("settlementHistory").get(0);
        assertEquals(30, history.path("resources").path("industry").path("before").asInt());
        assertEquals(6, history.path("resources").path("industry").path("delta").asInt());
        assertEquals(36, history.path("resources").path("industry").path("after").asInt());
    }

    @Test
    void endTurnShouldRefreshDomainProgressWithCardBonus() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card001").add("card006");
        Map<String, GameCardMetaDTO> cards = Map.of(
            "card001", coreCard("card001", "industry"),
            "card006", coreCard("card006", "industry")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(25, next.with("domainProgress").path("industry").asInt());
        assertEquals(0, next.with("domainProgress").path("ecology").asInt());
    }

    @Test
    void endTurnShouldApplyCard062IndustryCarbonReductionPercent() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card001").add("card002").add("card003");
        ObjectNode activePolicy = objectMapper.createObjectNode();
        activePolicy.put("policyId", "card062");
        activePolicy.put("group", "carbon_control");
        activePolicy.put("remainingTurns", 3);
        state.withArray("activePolicies").add(activePolicy);

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card001", coreCard("card001", "industry"),
            "card002", coreCard("card002", "industry"),
            "card003", coreCard("card003", "industry")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        when(cardCatalogService.getRequiredCard("card062")).thenReturn(policyCard("card062"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(76, next.with("metrics").path("carbon").asInt());
    }

    @Test
    void endTurnShouldApplyCard019IndustryPercentFromCoreContinuousEffect() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card019");

        when(cardCatalogService.getRequiredCard("card019")).thenReturn(coreCard("card019", "industry"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(34, next.with("resources").path("industry").asInt());
    }

    @Test
    void endTurnShouldApplyCard001ContinuousIndustryAndCarbonBonus() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card001");

        when(cardCatalogService.getRequiredCard("card001")).thenReturn(coreCard("card001", "industry"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(36, next.with("resources").path("industry").asInt());
        assertEquals(81, next.with("metrics").path("carbon").asInt());
    }

    @Test
    void endTurnShouldApplyCard025ContinuousEcologyBonus() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card025");

        when(cardCatalogService.getRequiredCard("card025")).thenReturn(coreCard("card025", "ecology"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(54, next.with("metrics").path("green").asInt());
        assertEquals(76, next.with("metrics").path("carbon").asInt());
    }

    @Test
    void endTurnShouldApplyCard049ContinuousSocietyBonus() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card049");

        when(cardCatalogService.getRequiredCard("card049")).thenReturn(coreCard("card049", "society"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(27, next.with("resources").path("population").asInt());
        assertEquals(63, next.with("metrics").path("satisfaction").asInt());
        assertEquals(78, next.with("metrics").path("carbon").asInt());
    }

    @Test
    void endTurnShouldApplyCard054TradePriceModifierAfterTurnFive() {
        ObjectNode state = baseState();
        state.put("turn", 6);
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card054");

        when(cardCatalogService.getRequiredCard("card054")).thenReturn(coreCard("card054", "science"));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();
        ObjectNode trade = next.with("carbonTrade");

        assertTrue(trade.path("windowOpened").asBoolean());
        assertEquals(50, trade.path("pricePctModifier").asInt());
        assertTrue(trade.path("lastPrice").asDouble() >= 2.4D && trade.path("lastPrice").asDouble() <= 3.6D);
        assertTrue(trade.path("windowExpiresAt").asLong() > System.currentTimeMillis());
        assertEquals(55, trade.path("quota").asInt());
    }

    @Test
    void endTurnShouldScaleComboEffectWhenCard058Placed() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card006").add("card020").add("card055").add("card036").add("card037").add("card038").add("card058");
        state.with("boardOccupied").put("0,0", "card006");
        state.with("boardOccupied").put("0,1", "card036");
        state.with("boardOccupied").put("1,0", "card020");
        state.with("boardOccupied").put("1,1", "card037");
        state.with("boardOccupied").put("2,0", "card055");
        state.with("boardOccupied").put("2,1", "card038");
        state.with("boardOccupied").put("3,0", "card058");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card006", coreCard("card006", "industry"),
            "card020", coreCard("card020", "industry"),
            "card055", coreCard("card055", "industry"),
            "card036", coreCard("card036", "science"),
            "card037", coreCard("card037", "science"),
            "card038", coreCard("card038", "science"),
            "card058", coreCard("card058", "society")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(66, next.with("resources").path("industry").asInt());
        assertEquals(46, next.with("resources").path("tech").asInt());
        assertEquals(48, next.with("metrics").path("carbon").asInt());
        assertTrue(indexOf(next.withArray("comboTriggeredThisTurn"), "cross_science_industry") >= 0);
    }

    @Test
    void endTurnShouldUnlockDrawPolicyAndApplyComboBonus() {
        ObjectNode state = baseState();
        state.with("resources").put("industry", 60);
        state.put("eventCooldown", 2);
        state.put("policyUsedThisTurn", true);
        state.put("lastPolicyUsed", "card061");
        state.with("remainingPools").withArray("early").add("card099");

        ArrayNode placed = state.withArray("placedCore");
        placed.add("card001");
        placed.add("card002");
        placed.add("card003");
        placed.add("card004");
        placed.add("card005");
        placed.add("card006");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card001", coreIndustryCard("card001"),
            "card002", coreIndustryCard("card002"),
            "card003", coreIndustryCard("card003"),
            "card004", coreIndustryCard("card004"),
            "card005", coreIndustryCard("card005"),
            "card006", coreIndustryCard("card006")
        );

        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(response.getPointsEarned() > 0);
        assertTrue(next.path("resources").path("industry").asInt() >= 68);
        assertTrue(indexOf(next.withArray("policyUnlocked"), "card061") >= 0);
        assertEquals(1, next.withArray("handPolicy").size());
        assertEquals("card061", next.withArray("handPolicy").get(0).asText());
        assertEquals(2, next.path("turn").asInt());
        assertTrue(!next.path("policyUsedThisTurn").asBoolean());
    }

    @Test
    void endTurnAtMaxTurnShouldSetFailureEnding() {
        ObjectNode state = baseState();
        state.put("turn", 30);
        state.with("metrics").put("lowCarbonScore", 100);
        state.put("eventCooldown", 2);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(Boolean.TRUE.equals(response.getSessionEnded()));
        assertEquals("failure", response.getEndingId());
        assertEquals("失败结局", response.getEndingName());
        assertTrue(next.path("sessionEnded").asBoolean());
        assertEquals("failure", next.path("ending").path("endingId").asText());
    }

    @Test
    void endTurnShouldDiscardOldestCoreCardWhenHandExceedsLimit() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        ArrayNode handCore = state.withArray("handCore");
        handCore.add("card001");
        handCore.add("card002");
        handCore.add("card003");
        handCore.add("card004");
        handCore.add("card005");
        handCore.add("card006");
        state.with("remainingPools").set("early", objectMapper.createArrayNode());
        state.with("remainingPools").set("mid", objectMapper.createArrayNode().add("card007"));
        state.with("remainingPools").set("late", objectMapper.createArrayNode());

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(7, next.withArray("handCore").size());
        assertEquals(0, next.withArray("discardCore").size());
        assertTrue(next.with("pendingDiscard").path("active").asBoolean());
        assertEquals(1, next.with("pendingDiscard").path("coreRequired").asInt());
        assertTrue(indexOf(next.withArray("handCore"), "card007") >= 0);
    }

    @Test
    void endTurnShouldSwitchToLatePhaseWhenRemainingCoreCardsAtMostTen() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("handCore").add("card001");
        state.with("remainingPools").set("early", objectMapper.createArrayNode().add("card002").add("card003").add("card004"));
        state.with("remainingPools").set("mid", objectMapper.createArrayNode().add("card005").add("card006"));
        state.with("remainingPools").set("late", objectMapper.createArrayNode().add("card007").add("card008").add("card009").add("card010"));
        when(cardCatalogService.getRequiredCard(anyString())).thenAnswer(invocation -> coreIndustryCard(invocation.getArgument(0)));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals("late", next.path("phase").asText());
        assertEquals(0, next.with("remainingPools").withArray("early").size());
        assertEquals(0, next.with("remainingPools").withArray("mid").size());
        assertEquals(7, next.with("remainingPools").withArray("late").size());
    }

    @Test
    void endTurnShouldOpenCarbonTradeWindowAndConsumeQuota() {
        ObjectNode state = baseState();
        state.put("turn", 2);
        state.put("eventCooldown", 2);
        state.with("metrics").put("carbon", 130);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();
        ObjectNode trade = next.with("carbonTrade");

        assertEquals(45, trade.path("quota").asInt());
        assertEquals(5, trade.path("lastQuotaConsumed").asInt());
        assertTrue(trade.path("windowOpened").asBoolean());
        assertEquals(2, trade.path("lastWindowTurn").asInt());
        assertEquals(0, trade.withArray("history").size());
    }

    @Test
    void endTurnShouldApplyActiveNegativeEventEffectOnFollowingTurn() {
        ObjectNode state = baseState();
        state.put("turn", 2);
        state.put("eventCooldown", 2);

        ObjectNode activeEvent = objectMapper.createObjectNode();
        activeEvent.put("eventType", "sea_level_rise");
        activeEvent.put("remainingTurns", 2);
        activeEvent.put("greenDelta", 0);
        activeEvent.put("carbonDelta", 15);
        activeEvent.put("satisfactionDelta", 0);
        state.withArray("activeNegativeEvents").add(activeEvent);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(95, next.with("metrics").path("carbon").asInt());
        assertEquals(1, next.withArray("activeNegativeEvents").size());
        assertEquals(1, next.withArray("activeNegativeEvents").get(0).path("remainingTurns").asInt());
    }

    @Test
    void endTurnShouldDiscardOldestPolicyCardWhenPolicyHandExceedsLimit() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("policyUnlocked").add("card061");
        state.withArray("policyUnlocked").add("card062");
        state.withArray("policyUnlocked").add("card063");
        state.withArray("handPolicy").add("card061");
        state.withArray("handPolicy").add("card062");

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(3, next.withArray("handPolicy").size());
        assertEquals(0, next.withArray("discardPolicy").size());
        assertTrue(next.with("pendingDiscard").path("active").asBoolean());
        assertEquals(1, next.with("pendingDiscard").path("policyRequired").asInt());
    }

    @Test
    void tradeCarbonShouldBuyQuotaAndCloseWindow() {
        ObjectNode state = baseState();
        state.with("carbonTrade").put("windowOpened", true);
        state.with("carbonTrade").put("lastWindowTurn", 2);
        state.with("carbonTrade").put("lastPrice", 2.0D);
        state.with("resources").put("industry", 30);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(4);
        request.setActionData(objectMapper.createObjectNode().put("tradeType", "buy").put("amount", 5));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();
        ObjectNode trade = next.with("carbonTrade");

        assertEquals(1, response.getPointsEarned());
        assertEquals(55, trade.path("quota").asInt());
        assertEquals(10.0D, trade.path("buyAmountTotal").asDouble(), 0.001D);
        assertEquals(20, next.with("resources").path("industry").asInt());
        assertTrue(!trade.path("windowOpened").asBoolean());
        assertEquals(1, trade.withArray("history").size());
        assertEquals("buy", trade.withArray("history").get(0).path("action").asText());
    }

    @Test
    void tradeCarbonShouldFailWhenWindowNotOpen() {
        ObjectNode state = baseState();
        state.with("carbonTrade").put("windowOpened", false);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(4);
        request.setActionData(objectMapper.createObjectNode().put("tradeType", "sell").put("amount", 1));

        assertThrows(BizException.class, () -> gameService.performAction(request));
    }

    @Test
    void tradeCarbonShouldTimeoutWindowAndRecordSkipBeforeRejectingTrade() {
        ObjectNode state = baseState();
        state.with("carbonTrade").put("windowOpened", true);
        state.with("carbonTrade").put("lastWindowTurn", 2);
        state.with("carbonTrade").put("lastPrice", 2.0D);
        state.with("carbonTrade").put("windowExpiresAt", System.currentTimeMillis() - 1000L);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(4);
        request.setActionData(objectMapper.createObjectNode().put("tradeType", "buy").put("amount", 1));

        assertThrows(BizException.class, () -> gameService.performAction(request));

        ObjectNode trade = state.with("carbonTrade");
        assertTrue(!trade.path("windowOpened").asBoolean());
        assertEquals(0L, trade.path("windowExpiresAt").asLong());
        assertTrue(trade.withArray("history").size() >= 1);
        assertEquals("skip", trade.withArray("history").get(0).path("action").asText());
    }

    @Test
    void getSessionByIdShouldProcessPendingDiscardTimeout() {
        ObjectNode state = baseState();
        state.withArray("handCore").add("card001").add("card002").add("card003").add("card004").add("card005").add("card006").add("card007");
        state.with("pendingDiscard").put("active", true);
        state.with("pendingDiscard").put("expiresAt", System.currentTimeMillis() - 1000L);
        state.with("pendingDiscard").put("coreRequired", 1);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameSessionDTO result = gameService.getSessionById(sessionId);
        ObjectNode next = (ObjectNode) result.getPondState();

        assertEquals(6, next.withArray("handCore").size());
        assertEquals(1, next.withArray("discardCore").size());
        assertTrue(!next.with("pendingDiscard").path("active").asBoolean());
        assertEquals("timeout_auto_discard", next.withArray("handOverflowHistory").get(0).path("reason").asText());
    }

    @Test
    void getSessionByIdShouldProcessExpiredTradeWindowAsSkip() {
        ObjectNode state = baseState();
        state.with("carbonTrade").put("windowOpened", true);
        state.with("carbonTrade").put("lastWindowTurn", 2);
        state.with("carbonTrade").put("lastPrice", 2.0D);
        state.with("carbonTrade").put("windowExpiresAt", System.currentTimeMillis() - 1000L);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameSessionDTO result = gameService.getSessionById(sessionId);
        ObjectNode trade = ((ObjectNode) result.getPondState()).with("carbonTrade");

        assertTrue(!trade.path("windowOpened").asBoolean());
        assertEquals(0L, trade.path("windowExpiresAt").asLong());
        assertEquals("skip", trade.withArray("history").get(0).path("action").asText());
    }

    @Test
    void endTurnShouldResetEventCooldownToThreeWhenCheckTriggered() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 1);
        state.with("metrics").put("green", 100);
        state.with("metrics").put("carbon", 40);
        state.with("metrics").put("satisfaction", 80);
        state.with("resources").put("population", 20);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(3, next.path("eventCooldown").asInt());
    }

    @Test
    void endTurnShouldTriggerAtMostTwoCombosPerTurnByPriorityOrder() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.put("lastPolicyUsed", "card061");
        state.withArray("placedCore")
            .add("card006")
            .add("card009")
            .add("card018")
            .add("card036")
            .add("card037")
            .add("card038")
            .add("card021")
            .add("card022")
            .add("card025");
        state.with("boardOccupied").put("0,0", "card006");
        state.with("boardOccupied").put("0,1", "card036");
        state.with("boardOccupied").put("1,0", "card009");
        state.with("boardOccupied").put("1,1", "card021");
        state.with("boardOccupied").put("2,0", "card018");
        state.with("boardOccupied").put("2,1", "card022");
        state.with("boardOccupied").put("3,0", "card037");
        state.with("boardOccupied").put("3,1", "card025");
        state.with("boardOccupied").put("4,0", "card038");

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card006", coreCard("card006", "industry"),
            "card009", coreCard("card009", "industry"),
            "card018", coreCard("card018", "industry"),
            "card036", coreCard("card036", "science"),
            "card037", coreCard("card037", "science"),
            "card038", coreCard("card038", "science"),
            "card021", coreCard("card021", "ecology"),
            "card022", coreCard("card022", "ecology"),
            "card025", coreCard("card025", "ecology")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();
        ArrayNode combos = next.withArray("comboTriggeredThisTurn");

        assertEquals(2, combos.size());
        assertEquals("policy_industry_chain", combos.get(0).asText());
        assertEquals("cross_science_industry", combos.get(1).asText());
        assertTrue(indexOf(combos, "cross_industry_ecology") < 0);
    }

    @Test
    void weightedPickShouldFollowConfiguredRiskOrder() throws Exception {
        Method weightedPick = GameService.class.getDeclaredMethod("weightedPick", ArrayNode.class);
        weightedPick.setAccessible(true);

        ArrayNode candidates = objectMapper.createArrayNode();
        candidates.add("sea_level_rise");
        candidates.add("flood");
        candidates.add("citizen_protest");

        int sea = 0;
        int flood = 0;
        int protest = 0;
        int rounds = 20000;
        for (int i = 0; i < rounds; i++) {
            String picked = (String) weightedPick.invoke(gameService, candidates);
            switch (picked) {
                case "sea_level_rise" -> sea++;
                case "flood" -> flood++;
                case "citizen_protest" -> protest++;
                default -> throw new IllegalStateException("Unexpected event type: " + picked);
            }
        }

        assertTrue(sea > flood && flood > protest);
        double seaRatio = sea * 1.0D / rounds;
        double floodRatio = flood * 1.0D / rounds;
        double protestRatio = protest * 1.0D / rounds;
        assertTrue(seaRatio > 0.35D && seaRatio < 0.45D);
        assertTrue(floodRatio > 0.30D && floodRatio < 0.40D);
        assertTrue(protestRatio > 0.20D && protestRatio < 0.30D);
    }

    @Test
    void maybeTriggerNegativeEventShouldApproximateThirtyPercentProbability() throws Exception {
        Method maybeTrigger = GameService.class.getDeclaredMethod("maybeTriggerNegativeEvent", ObjectNode.class);
        maybeTrigger.setAccessible(true);

        int triggered = 0;
        int rounds = 10000;
        for (int i = 0; i < rounds; i++) {
            ObjectNode state = baseState();
            state.put("turn", 2);
            state.with("metrics").put("green", 60);
            state.with("metrics").put("carbon", 100);
            state.with("metrics").put("satisfaction", 60);
            state.with("resources").put("population", 110);

            maybeTrigger.invoke(gameService, state);
            if (state.withArray("eventHistory").size() > 0) {
                triggered++;
            }
        }

        double ratio = triggered * 1.0D / rounds;
        assertTrue(ratio > 0.24D && ratio < 0.36D);
    }

    @Test
    void maybeTriggerNegativeEventShouldRecordMetadataForResolution() throws Exception {
        Method maybeTrigger = GameService.class.getDeclaredMethod("maybeTriggerNegativeEvent", ObjectNode.class);
        maybeTrigger.setAccessible(true);

        ObjectNode state = baseState();
        state.put("turn", 2);
        state.with("metrics").put("green", 60);
        state.with("metrics").put("carbon", 40);
        state.with("metrics").put("satisfaction", 95);
        state.with("resources").put("population", 20);

        for (int i = 0; i < 200 && state.withArray("eventHistory").isEmpty(); i++) {
            maybeTrigger.invoke(gameService, state);
        }

        assertTrue(state.withArray("eventHistory").size() > 0);
        ObjectNode event = (ObjectNode) state.withArray("eventHistory").get(0);
        assertEquals("flood", event.path("eventType").asText());
        assertEquals("内涝", event.path("eventName").asText());
        assertTrue(event.path("effectSummary").asText().contains("绿建度-10"));
        assertTrue(event.path("resolutionHint").asText().contains("card063"));
        assertEquals("card063", event.withArray("resolvablePolicyIds").get(0).asText());
        assertEquals("card064", event.withArray("resolvablePolicyIds").get(1).asText());
    }

    @Test
    void endTurnShouldApplyCitizenProtestPopulationPenaltyOnFollowingTurn() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.withArray("placedCore").add("card048").add("card049").add("card050").add("card051");

        ObjectNode activeEvent = objectMapper.createObjectNode();
        activeEvent.put("eventType", "citizen_protest");
        activeEvent.put("remainingTurns", 2);
        activeEvent.put("greenDelta", 0);
        activeEvent.put("carbonDelta", 0);
        activeEvent.put("satisfactionDelta", 0);
        activeEvent.put("greenPctDelta", 0);
        activeEvent.put("populationPctDelta", -15);
        state.withArray("activeNegativeEvents").add(activeEvent);

        Map<String, GameCardMetaDTO> cards = Map.of(
            "card048", coreCard("card048", "society"),
            "card049", coreCard("card049", "society"),
            "card050", coreCard("card050", "society"),
            "card051", coreCard("card051", "society")
        );
        cards.forEach((id, card) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(card));
        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(29, next.with("resources").path("population").asInt());
    }

    @Test
    void startSessionShouldPersistGuestSessionAndMarkState() {
        SecurityContextHolder.clearContext();
        when(cardCatalogService.listCoreCardsByPhase("early")).thenReturn(List.of());
        when(cardCatalogService.listCoreCardsByPhase("mid")).thenReturn(List.of());
        when(cardCatalogService.listCoreCardsByPhase("late")).thenReturn(List.of());

        GameSessionDTO session = gameService.startSession();

        assertTrue(session.getUserId() != null);
        assertTrue(session.getPondState().path("guestSession").asBoolean());
        verify(gameSessionMapper).insert(any());
    }

    @Test
    void getSessionByIdShouldLoadGuestSessionFromDatabaseWhenCacheMiss() {
        SecurityContextHolder.clearContext();
        ObjectNode state = baseState();
        state.put("guestSession", true);
        GameSessionEntity session = activeSession(state);
        session.setUserId(UUID.fromString("33333333-3333-3333-3333-333333333333"));
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameSessionDTO result = gameService.getSessionById(sessionId);

        assertEquals(sessionId, result.getId());
        assertTrue(result.getPondState().path("guestSession").asBoolean());
        verify(gameSessionMapper).update(any());
    }

    @Test
    void endTurnShouldFailWhenQuotaExhaustedAndTradeProfitNegative() {
        ObjectNode state = baseState();
        state.put("turn", 5);
        state.put("eventCooldown", 2);
        state.with("carbonTrade").put("quotaExhaustedCount", 4);
        state.with("carbonTrade").put("profit", -10.0D);
        state.with("metrics").put("lowCarbonScore", 180);

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(Boolean.TRUE.equals(response.getSessionEnded()));
        assertEquals("failure", next.path("ending").path("endingId").asText());
    }

    @Test
    void endTurnShouldReachInnovationEndingWhenAllDocumentConditionsMet() {
        ObjectNode state = baseState();
        state.put("turn", 30);
        state.put("eventCooldown", 2);
        state.with("resources").put("tech", 230);
        state.with("metrics").put("carbon", 90);
        state.with("carbonTrade").put("profit", 130.0D);
        state.with("eventStats").put("negativeTriggered", 10);
        state.with("eventStats").put("negativeResolved", 8);

        ArrayNode placed = state.withArray("placedCore");
        for (int i = 1; i <= 60; i++) {
            placed.add(String.format("card%03d", i));
        }
        when(cardCatalogService.getRequiredCard(anyString())).thenAnswer(invocation -> coreScienceLateCard(invocation.getArgument(0)));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(Boolean.TRUE.equals(response.getSessionEnded()));
        assertEquals("innovation_technology", next.path("ending").path("endingId").asText());
    }

    @Test
    void endTurnShouldNotReachInnovationEndingWhenResolveRateBelowSeventyPercent() {
        ObjectNode state = baseState();
        state.put("turn", 30);
        state.put("eventCooldown", 2);
        state.with("resources").put("tech", 230);
        state.with("metrics").put("carbon", 90);
        state.with("carbonTrade").put("profit", 130.0D);
        state.with("eventStats").put("negativeTriggered", 10);
        state.with("eventStats").put("negativeResolved", 6);

        ArrayNode placed = state.withArray("placedCore");
        for (int i = 1; i <= 60; i++) {
            placed.add(String.format("card%03d", i));
        }
        when(cardCatalogService.getRequiredCard(anyString())).thenAnswer(invocation -> coreScienceLateCard(invocation.getArgument(0)));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(Boolean.TRUE.equals(response.getSessionEnded()));
        assertEquals("failure", next.path("ending").path("endingId").asText());
    }

    @Test
    void endTurnShouldReachEcologyEndingWhenAllDocumentConditionsMet() {
        ObjectNode state = baseState();
        state.put("turn", 30);
        state.put("eventCooldown", 2);
        state.with("metrics").put("green", 150);
        state.with("metrics").put("carbon", 65);
        state.with("carbonTrade").put("quota", 50);
        state.with("carbonTrade").put("profit", 150.0D);
        state.with("eventStats").put("negativeTriggered", 10);
        state.with("eventStats").put("negativeResolved", 8);

        ArrayNode placed = state.withArray("placedCore");
        for (int i = 1; i <= 20; i++) {
            placed.add(String.format("eco%03d", i));
        }
        for (int i = 1; i <= 15; i++) {
            placed.add(String.format("ind%03d", i));
            placed.add(String.format("sci%03d", i));
            placed.add(String.format("soc%03d", i));
        }

        when(cardCatalogService.getRequiredCard(anyString())).thenAnswer(invocation -> {
            String cardId = invocation.getArgument(0);
            if (cardId.startsWith("eco")) {
                return coreLateCard(cardId, "ecology");
            }
            if (cardId.startsWith("ind")) {
                return coreLateCard(cardId, "industry");
            }
            if (cardId.startsWith("sci")) {
                return coreLateCard(cardId, "science");
            }
            if (cardId.startsWith("soc")) {
                return coreLateCard(cardId, "society");
            }
            return coreLateCard(cardId, "science");
        });

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(Boolean.TRUE.equals(response.getSessionEnded()));
        assertEquals("ecology_priority", next.path("ending").path("endingId").asText());
    }

    @Test
    void endTurnShouldReachDoughnutEndingWhenAllDocumentConditionsMet() {
        ObjectNode state = baseState();
        state.put("turn", 30);
        state.put("eventCooldown", 2);
        state.with("resources").put("population", 125);
        state.with("metrics").put("satisfaction", 95);
        state.with("metrics").put("carbon", 75);
        state.with("carbonTrade").put("profit", 150.0D);
        state.with("eventStats").put("negativeTriggered", 0);
        state.with("eventStats").put("negativeResolved", 0);
        ArrayNode unlocked = state.withArray("policyUnlocked");
        unlocked.add("card061").add("card062").add("card063").add("card064");
        unlocked.add("card065").add("card066").add("card067").add("card068");

        ArrayNode policyHistory = state.withArray("policyHistory");
        policyHistory.add(objectMapper.createObjectNode().put("policyId", "card067"));
        policyHistory.add(objectMapper.createObjectNode().put("policyId", "card068"));
        policyHistory.add(objectMapper.createObjectNode().put("policyId", "card067"));

        ArrayNode placed = state.withArray("placedCore");
        for (int i = 1; i <= 12; i++) {
            placed.add(String.format("soc%03d", i));
        }
        for (int i = 1; i <= 10; i++) {
            placed.add(String.format("eco%03d", i));
            placed.add(String.format("ind%03d", i));
            placed.add(String.format("sci%03d", i));
        }

        when(cardCatalogService.getRequiredCard(anyString())).thenAnswer(invocation -> {
            String cardId = invocation.getArgument(0);
            if (cardId.startsWith("eco")) {
                return coreLateCard(cardId, "ecology");
            }
            if (cardId.startsWith("ind")) {
                return coreLateCard(cardId, "industry");
            }
            if (cardId.startsWith("sci")) {
                return coreLateCard(cardId, "science");
            }
            if (cardId.startsWith("soc")) {
                return coreLateCard(cardId, "society");
            }
            return coreLateCard(cardId, "society");
        });

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(Boolean.TRUE.equals(response.getSessionEnded()));
        assertEquals("doughnut_city", next.path("ending").path("endingId").asText());
    }

    @Test
    void endTurnShouldUnlockAllPolicyCardsWhenAllConditionsMet() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        state.with("resources").put("industry", 120);
        state.with("resources").put("tech", 100);
        state.with("resources").put("population", 90);
        state.with("metrics").put("green", 80);
        state.with("metrics").put("carbon", 120);
        state.with("metrics").put("satisfaction", 85);

        ArrayNode placed = state.withArray("placedCore");
        placed.add("card001").add("card002").add("card003").add("card004");
        placed.add("card005").add("card006").add("card007").add("card008");
        placed.add("card021").add("card022").add("card023").add("card024");
        placed.add("card025").add("card026");
        placed.add("card036").add("card037").add("card038").add("card039");
        placed.add("card040").add("card041");
        placed.add("card046").add("card047").add("card048").add("card049");
        placed.add("card050").add("card051");

        Map<String, String> domainMap = Map.ofEntries(
            Map.entry("card001", "industry"), Map.entry("card002", "industry"), Map.entry("card003", "industry"), Map.entry("card004", "industry"),
            Map.entry("card005", "industry"), Map.entry("card006", "industry"), Map.entry("card007", "industry"), Map.entry("card008", "industry"),
            Map.entry("card021", "ecology"), Map.entry("card022", "ecology"), Map.entry("card023", "ecology"), Map.entry("card024", "ecology"),
            Map.entry("card025", "ecology"), Map.entry("card026", "ecology"),
            Map.entry("card036", "science"), Map.entry("card037", "science"), Map.entry("card038", "science"), Map.entry("card039", "science"),
            Map.entry("card040", "science"), Map.entry("card041", "science"),
            Map.entry("card046", "society"), Map.entry("card047", "society"), Map.entry("card048", "society"), Map.entry("card049", "society"),
            Map.entry("card050", "society"), Map.entry("card051", "society")
        );
        domainMap.forEach((id, domain) -> when(cardCatalogService.getRequiredCard(id)).thenReturn(coreCard(id, domain)));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();
        assertEquals(8, next.withArray("policyUnlocked").size());
        Set<String> expected = Set.of("card061", "card062", "card063", "card064", "card065", "card066", "card067", "card068");
        for (String policyId : expected) {
            assertTrue(indexOf(next.withArray("policyUnlocked"), policyId) >= 0);
        }
    }

    @Test
    void endTurnShouldUnlockPolicyByConfiguredRuleSet() {
        ObjectNode state = baseState();
        state.put("eventCooldown", 2);
        when(gameRuleConfigService.listPolicyUnlockRules()).thenReturn(List.of(
            policyUnlockRule("card068", 0, 0, 0, 0, 0, 0, 0, null, null, null, null, 0, "")
        ));

        GameSessionEntity session = activeSession(state);
        when(gameSessionMapper.selectById(eq(sessionId))).thenReturn(session);

        GameActionRequest request = new GameActionRequest();
        request.setSessionId(sessionId);
        request.setActionType(2);

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertTrue(indexOf(next.withArray("policyUnlocked"), "card068") >= 0);
    }

    @Test
    void guestShouldStartAndPlayWithoutDatabasePersistence() {
        SecurityContextHolder.clearContext();
        when(cardCatalogService.listCoreCardsByPhase("early")).thenReturn(List.of("card001", "card002", "card003", "card004"));
        when(cardCatalogService.listCoreCardsByPhase("mid")).thenReturn(List.of("card021"));
        when(cardCatalogService.listCoreCardsByPhase("late")).thenReturn(List.of("card046"));
        when(cardCatalogService.getRequiredCard(anyString())).thenAnswer(invocation -> coreIndustryCard(invocation.getArgument(0)));

        GameSessionDTO session = gameService.startSession();
        GameActionRequest request = new GameActionRequest();
        request.setSessionId(session.getId());
        request.setActionType(1);
        request.setActionData(objectMapper.createObjectNode().put("cardId", "card001").put("row", 0).put("col", 0));

        GameActionResponse response = gameService.performAction(request);
        ObjectNode next = (ObjectNode) response.getNewPondState();

        assertEquals(session.getId(), gameService.getSessionById(session.getId()).getId());
        assertEquals(1, next.withArray("placedCore").size());
        verify(gameSessionMapper).insert(any());
        verify(gameSessionMapper, times(2)).update(any());
        verifyNoInteractions(gameActionMapper);
    }

    private List<GameRuleConfigService.ComboRuleConfig> defaultComboRules() {
        return List.of(
            comboRule("policy_industry_chain", "card061", 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, comboEffect(10, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
            comboRule("policy_ecology_chain", "card064", 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, comboEffect(0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
            comboRule("policy_science_chain", "card065", 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, comboEffect(0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0)),
            comboRule("policy_society_chain", "card067", 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, comboEffect(0, 0, 0, 0, 0, 15, 0, 0, 0, 20, 0, 0, 0, 0)),
            comboRule("cross_science_industry", "", 0, 0, 3, 0, 3, 0, 0, 0, 0, 1, 0, 0, comboEffect(20, 15, 0, 0, -20, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
            comboRule("cross_industry_ecology", "", 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, comboEffect(0, 0, 0, 10, -25, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
            comboRule("cross_ecology_society", "", 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2, comboEffect(0, 0, 8, 8, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0)),
            comboRule("cross_science_ecology", "", 0, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, comboEffect(0, 10, 0, 15, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0)),
            comboRule("intra_industry_scale", "", 0, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 0, comboEffect(0, 0, 0, 0, -15, 0, 0, 0, 0, 0, 30, 0, 0, 0)),
            comboRule("intra_ecology_restore", "", 0, 4, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, comboEffect(0, 0, 0, 12, -8, 8, 0, 0, 0, 0, 0, 0, 0, 0)),
            comboRule("intra_science_boost", "", 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 0, 0, comboEffect(0, 0, 0, 0, 0, 0, 0, 0, 35, 0, 0, 8, 0, 0)),
            comboRule("intra_society_mobilize", "", 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 2, comboEffect(0, 0, 0, 0, 0, 10, 0, 0, 0, 25, 0, 0, 0, 0))
        );
    }

    private Map<String, GameRuleConfigService.EventRuleConfig> defaultEventRuleMap() {
        LinkedHashMap<String, GameRuleConfigService.EventRuleConfig> map = new LinkedHashMap<>();
        map.put("flood", new GameRuleConfigService.EventRuleConfig(
            "flood", 30, null, null, null, null, true, 35, 1, -10, 0, 0, -20, 0, 0,
            "内涝", "绿建度-10，当回合生态效果-20%", "使用 card063 或 card064 可立即化解", List.of("card063", "card064")
        ));
        map.put("sea_level_rise", new GameRuleConfigService.EventRuleConfig(
            "sea_level_rise", 30, null, 95, null, null, false, 40, 1, 0, 15, 0, 0, 0, -2,
            "海平面上升", "碳排放+15，额外配额消耗+2", "使用 card062 或 card066 可立即化解", List.of("card062", "card066")
        ));
        map.put("citizen_protest", new GameRuleConfigService.EventRuleConfig(
            "citizen_protest", 30, null, null, 70, 100, false, 25, 2, 0, 0, -12, 0, -15, 0,
            "市民抗议", "市民满意度-12，人口产出-15%", "使用 card067 或 card068 可立即化解", List.of("card067", "card068")
        ));
        return map;
    }

    private Map<String, List<String>> defaultCardTagMap() {
        LinkedHashMap<String, List<String>> map = new LinkedHashMap<>();
        map.put("shenzhen_ecology", List.of("card025", "card026", "card027"));
        map.put("low_carbon_core", List.of(
            "card006", "card009", "card010", "card015", "card018", "card020",
            "card021", "card022", "card023", "card024", "card025", "card026", "card027", "card028", "card029", "card030",
            "card031", "card032", "card033", "card034", "card035", "card038", "card041", "card042", "card043",
            "card048", "card049", "card050", "card054", "card055", "card056", "card057", "card059", "card060"
        ));
        map.put("shenzhen_tag", List.of("card025", "card026", "card027", "card036", "card037", "card054"));
        map.put("link_tag", List.of("card009", "card019", "card031", "card035", "card044", "card045", "card053", "card058"));
        map.put("new_energy_industry", List.of("card006", "card018", "card055"));
        map.put("traditional_industry", List.of("card001", "card002", "card003", "card004", "card005", "card011", "card012", "card013", "card014", "card057"));
        map.put("new_energy_effect", List.of("card006", "card018", "card055"));
        return map;
    }

    private List<GameRuleConfigService.PolicyUnlockRuleConfig> defaultPolicyUnlockRules() {
        return List.of(
            policyUnlockRule("card061", 6, 0, 0, 0, 50, 0, 0, null, null, null, null, 0, ""),
            policyUnlockRule("card062", 8, 0, 0, 0, 0, 0, 0, null, 100, null, null, 0, ""),
            policyUnlockRule("card063", 0, 6, 0, 0, 0, 0, 0, 70, null, null, null, 0, ""),
            policyUnlockRule("card064", 0, 0, 0, 0, 0, 0, 0, null, null, null, null, 2, "shenzhen_ecology"),
            policyUnlockRule("card065", 0, 0, 6, 0, 0, 70, 0, null, null, null, null, 0, ""),
            policyUnlockRule("card066", 5, 0, 5, 0, 0, 80, 0, null, null, null, null, 0, ""),
            policyUnlockRule("card067", 0, 5, 0, 5, 0, 0, 0, null, null, null, 75, 0, ""),
            policyUnlockRule("card068", 0, 0, 0, 6, 0, 0, 60, null, null, null, null, 0, "")
        );
    }

    private Map<String, GameRuleConfigService.CoreSpecialConditionConfig> defaultCoreSpecialConditionMap() {
        LinkedHashMap<String, GameRuleConfigService.CoreSpecialConditionConfig> map = new LinkedHashMap<>();
        map.put("card056", new GameRuleConfigService.CoreSpecialConditionConfig("card056", "flood", 0, 0, 0, 0));
        map.put("card059", new GameRuleConfigService.CoreSpecialConditionConfig("card059", "", 0, 2, 0, 0));
        return map;
    }

    private GameRuleConfigService.PolicyUnlockRuleConfig policyUnlockRule(
        String policyId,
        int minIndustry,
        int minEcology,
        int minScience,
        int minSociety,
        int minIndustryResource,
        int minTechResource,
        int minPopulationResource,
        Integer minGreen,
        Integer minCarbon,
        Integer maxCarbon,
        Integer minSatisfaction,
        int minTaggedCards,
        String requiredTag
    ) {
        return new GameRuleConfigService.PolicyUnlockRuleConfig(
            policyId,
            minIndustry,
            minEcology,
            minScience,
            minSociety,
            minIndustryResource,
            minTechResource,
            minPopulationResource,
            minGreen,
            minCarbon,
            maxCarbon,
            minSatisfaction,
            minTaggedCards,
            requiredTag
        );
    }

    private GameRuleConfigService.RuntimeParamConfig defaultRuntimeParam() {
        return new GameRuleConfigService.RuntimeParamConfig(6, 2, 2, 30, 10, 2, 3, 2.0D, 200, 15);
    }

    private GameRuleConfigService.BalanceRuleConfig defaultBalanceRule() {
        return new GameRuleConfigService.BalanceRuleConfig(
            "early",
            0,
            6,
            30,
            20,
            25,
            50,
            80,
            60,
            0,
            50,
            4,
            4,
            3,
            2,
            3,
            2,
            1,
            1,
            200,
            80,
            10,
            3,
            2,
            1,
            0.8D,
            0.4D,
            100,
            1.1D,
            60,
            0.9D,
            130,
            5,
            4,
            0D,
            120,
            8,
            5,
            3,
            8,
            10,
            10,
            10,
            80,
            3,
            15,
            50D,
            3,
            5,
            8,
            70,
            3,
            80,
            0,
            100,
            -2,
            130,
            -5,
            -8,
            15,
            59,
            16,
            30,
            60,
            100,
            31,
            101,
            10,
            70D,
            14,
            220,
            170,
            95,
            120D,
            14,
            140,
            170,
            70,
            30,
            12,
            92,
            110,
            8,
            165,
            80,
            3
        );
    }

    private Map<String, GameRuleConfigService.EndingContentConfig> defaultEndingContentMap() {
        LinkedHashMap<String, GameRuleConfigService.EndingContentConfig> map = new LinkedHashMap<>();
        map.put("innovation_technology", new GameRuleConfigService.EndingContentConfig(
            "innovation_technology",
            "创新科技结局",
            "endings/创新科技结局.jpg",
            "科技板块成为主导，城市通过技术迭代实现减排与增长。",
            "",
            "",
            "",
            ""
        ));
        map.put("ecology_priority", new GameRuleConfigService.EndingContentConfig(
            "ecology_priority",
            "生态优先结局",
            "endings/生态优先结局.jpg",
            "生态板块成为主导，绿建和碳汇能力达成高水平。",
            "",
            "",
            "",
            ""
        ));
        map.put("doughnut_city", new GameRuleConfigService.EndingContentConfig(
            "doughnut_city",
            "甜甜圈结局",
            "endings/甜甜圈结局.jpg",
            "社会公平与低碳协同，城市进入甜甜圈稳态。",
            "",
            "",
            "",
            ""
        ));
        map.put("failure", new GameRuleConfigService.EndingContentConfig(
            "failure",
            "失败结局",
            "endings/失败结局.jpg",
            "已达到终局边界但未满足任一正向结局条件。",
            "碳排放连续5回合高于130，系统进入失控状态。",
            "配额耗尽记录达到4次且碳交易盈利为负。",
            "终局时低碳总分低于120。",
            "已达到终局边界但未满足任一正向结局条件。"
        ));
        return map;
    }

    private GameRuleConfigService.ComboRuleConfig comboRule(
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
        int minSocietyEcologyAdjacentPairs,
        GameRuleConfigService.ComboEffectConfig effect
    ) {
        return new GameRuleConfigService.ComboRuleConfig(
            comboId,
            requiredPolicyId,
            minIndustry,
            minEcology,
            minScience,
            minSociety,
            minLowCarbonIndustry,
            minShenzhenEcology,
            minLinkCards,
            minIndustryLowCarbonAdjacentPairs,
            minScienceScienceAdjacentPairs,
            minScienceIndustryAdjacentPairs,
            minIndustryEcologyAdjacentPairs,
            minSocietyEcologyAdjacentPairs,
            effect
        );
    }

    private GameRuleConfigService.ComboEffectConfig comboEffect(
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
        return new GameRuleConfigService.ComboEffectConfig(
            industryDelta,
            techDelta,
            populationDelta,
            greenDelta,
            carbonDelta,
            satisfactionDelta,
            quotaDelta,
            lowCarbonDelta,
            techPct,
            populationPct,
            industryPct,
            lowCarbonPct,
            greenPct,
            globalPct
        );
    }

    private ObjectNode baseState() {
        ObjectNode state = objectMapper.createObjectNode();
        state.put("turn", 1);
        state.put("phase", "early");
        state.put("eventCooldown", 0);
        state.put("maxTurn", 30);
        state.put("guestSession", false);
        state.put("boardSize", 6);
        state.set("boardOccupied", objectMapper.createObjectNode());

        ObjectNode resources = state.putObject("resources");
        resources.put("industry", 30);
        resources.put("tech", 20);
        resources.put("population", 25);

        ObjectNode metrics = state.putObject("metrics");
        metrics.put("green", 50);
        metrics.put("carbon", 80);
        metrics.put("satisfaction", 60);
        metrics.put("lowCarbonScore", 0);
        ObjectNode domainProgress = state.putObject("domainProgress");
        domainProgress.put("industry", 0);
        domainProgress.put("ecology", 0);
        domainProgress.put("science", 0);
        domainProgress.put("society", 0);

        ObjectNode carbonTrade = state.putObject("carbonTrade");
        carbonTrade.put("quota", 50);
        carbonTrade.put("buyAmountTotal", 0D);
        carbonTrade.put("sellAmountTotal", 0D);
        carbonTrade.put("profit", 0D);
        carbonTrade.put("lastPrice", 2D);
        carbonTrade.put("lastWindowTurn", 0);
        carbonTrade.put("windowOpened", false);
        carbonTrade.put("windowExpiresAt", 0L);
        carbonTrade.put("pricePctModifier", 0);
        carbonTrade.put("quotaExhaustedCount", 0);
        carbonTrade.put("invalidOperationCount", 0);
        carbonTrade.set("history", objectMapper.createArrayNode());

        ObjectNode pools = state.putObject("remainingPools");
        pools.set("early", objectMapper.createArrayNode());
        pools.set("mid", objectMapper.createArrayNode());
        pools.set("late", objectMapper.createArrayNode());

        state.set("handCore", objectMapper.createArrayNode());
        state.set("handPolicy", objectMapper.createArrayNode());
        state.set("placedCore", objectMapper.createArrayNode());
        state.set("discardCore", objectMapper.createArrayNode());
        state.set("discardPolicy", objectMapper.createArrayNode());
        state.set("policyUnlocked", objectMapper.createArrayNode());
        state.set("activePolicies", objectMapper.createArrayNode());
        state.set("eventHistory", objectMapper.createArrayNode());
        state.set("activeNegativeEvents", objectMapper.createArrayNode());
        state.set("comboHistory", objectMapper.createArrayNode());
        state.set("policyHistory", objectMapper.createArrayNode());
        state.set("settlementHistory", objectMapper.createArrayNode());
        state.putNull("cardEffectSnapshot");
        state.set("handOverflowHistory", objectMapper.createArrayNode());
        ObjectNode eventStats = state.putObject("eventStats");
        eventStats.put("negativeTriggered", 0);
        eventStats.put("negativeResolved", 0);
        state.put("policyUsedThisTurn", false);
        state.put("corePlacedThisTurn", false);
        state.putNull("lastPolicyUsed");
        ObjectNode pendingDiscard = state.putObject("pendingDiscard");
        pendingDiscard.put("active", false);
        pendingDiscard.put("expiresAt", 0L);
        pendingDiscard.put("coreRequired", 0);
        pendingDiscard.put("policyRequired", 0);
        return state;
    }

    private GameSessionEntity activeSession(ObjectNode state) {
        GameSessionEntity session = new GameSessionEntity();
        session.setId(sessionId);
        session.setUserId(userId);
        session.setPondState(state);
        session.setScore(0L);
        session.setLevel(1);
        session.setStatus(1);
        session.setStartedAt(LocalDateTime.now());
        session.setLastActionAt(LocalDateTime.now());
        return session;
    }

    private GameCardMetaDTO policyCard(String cardId) {
        GameCardMetaDTO.GameCardMetaDTOBuilder builder = GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(61)
            .cardType("policy")
            .phaseBucket("policy")
            .domain("policy")
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0));
        switch (cardId) {
            case "card061" -> builder
                .policyImmediateIndustryDelta(15)
                .policyImmediateCarbonDelta(-8)
                .policyImmediateGroup("industry_support")
                .policyImmediateTurns(3)
                .policyContinuousIndustryDelta(5);
            case "card062" -> builder
                .policyImmediateCarbonDelta(-30)
                .policyImmediateGroup("carbon_control")
                .policyImmediateTurns(3)
                .policyContinuousCarbonDelta(-5)
                .policyContinuousIndustryCarbonReductionPct(20);
            case "card064" -> builder
                .policyImmediateGreenDelta(15)
                .policyImmediateQuotaDelta(3)
                .policyImmediateGroup("ecology")
                .policyImmediateTurns(3)
                .policyContinuousGreenPct(5);
            case "card065" -> builder
                .policyImmediateTechDelta(25)
                .policyImmediateGroup("science_support")
                .policyImmediateTurns(3)
                .policyContinuousTechDelta(6)
                .policyContinuousTechPct(12);
            default -> builder
                .policyImmediateGroup("")
                .policyImmediateTurns(0);
        }
        return builder.build();
    }

    private GameCardMetaDTO coreIndustryCard(String cardId) {
        GameCardMetaDTO.GameCardMetaDTOBuilder builder = GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(1)
            .cardType("core")
            .phaseBucket("early")
            .domain("industry")
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0));
        applyCoreConfig(cardId, builder);
        return builder.build();
    }

    private GameCardMetaDTO coreCard(String cardId, String domain) {
        GameCardMetaDTO.GameCardMetaDTOBuilder builder = GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(1)
            .cardType("core")
            .phaseBucket("early")
            .domain(domain)
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0));
        applyCoreConfig(cardId, builder);
        return builder.build();
    }

    private GameCardMetaDTO coreCardWithCost(String cardId, String domain, int industry, int tech, int population, int green) {
        GameCardMetaDTO.GameCardMetaDTOBuilder builder = GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(1)
            .cardType("core")
            .phaseBucket("early")
            .domain(domain)
            .unlockCost(new GameCardMetaDTO.UnlockCost(industry, tech, population, green));
        applyCoreConfig(cardId, builder);
        return builder.build();
    }

    private GameCardMetaDTO coreScienceLateCard(String cardId) {
        GameCardMetaDTO.GameCardMetaDTOBuilder builder = GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(46)
            .cardType("core")
            .phaseBucket("late")
            .domain("science")
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0));
        applyCoreConfig(cardId, builder);
        return builder.build();
    }

    private GameCardMetaDTO coreLateCard(String cardId, String domain) {
        GameCardMetaDTO.GameCardMetaDTOBuilder builder = GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(60)
            .cardType("core")
            .phaseBucket("late")
            .domain(domain)
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0));
        applyCoreConfig(cardId, builder);
        return builder.build();
    }

    private void applyCoreConfig(String cardId, GameCardMetaDTO.GameCardMetaDTOBuilder builder) {
        switch (cardId) {
            case "card001" -> builder.coreDomainProgressBonus(5).coreContinuousIndustryDelta(3).coreContinuousCarbonDelta(-2);
            case "card002" -> builder.coreDomainProgressBonus(4).coreContinuousIndustryDelta(2).coreContinuousCarbonDelta(-2);
            case "card003" -> builder.coreDomainProgressBonus(5).coreContinuousIndustryDelta(3).coreContinuousCarbonDelta(-2);
            case "card004" -> builder.coreDomainProgressBonus(4).coreContinuousIndustryDelta(2).coreContinuousCarbonDelta(-2);
            case "card006" -> builder.coreDomainProgressBonus(7).coreContinuousIndustryDelta(5).coreContinuousCarbonDelta(-1);
            case "card009" -> builder.coreDomainProgressBonus(10).coreContinuousIndustryDelta(25);
            case "card018" -> builder.coreDomainProgressBonus(13).coreContinuousIndustryDelta(27).coreContinuousCarbonDelta(-3);
            case "card019" -> builder.coreContinuousIndustryPct(20);
            case "card020" -> builder.coreContinuousIndustryCarbonReductionPct(5);
            case "card021" -> builder.coreDomainProgressBonus(3).coreContinuousGreenDelta(2).coreContinuousCarbonDelta(-1);
            case "card022" -> builder.coreDomainProgressBonus(2).coreContinuousGreenDelta(2).coreContinuousCarbonDelta(-1);
            case "card025" -> builder.coreDomainProgressBonus(6).coreContinuousGreenDelta(3).coreContinuousCarbonDelta(-2);
            case "card026" -> builder.coreDomainProgressBonus(7).coreContinuousGreenDelta(3).coreContinuousCarbonDelta(-2);
            case "card035" -> builder.coreSpecialEcologyCardCostReductionPct(20);
            case "card036" -> builder.coreDomainProgressBonus(3).coreContinuousTechDelta(1);
            case "card037" -> builder.coreDomainProgressBonus(2).coreContinuousTechDelta(1);
            case "card038" -> builder.coreDomainProgressBonus(6).coreContinuousCarbonDelta(-3);
            case "card039" -> builder.coreDomainProgressBonus(7).coreContinuousIndustryCarbonReductionPct(15);
            case "card040" -> builder.coreDomainProgressBonus(6).coreSpecialNewEnergyIndustryPct(20);
            case "card041" -> builder.coreDomainProgressBonus(5).coreContinuousCarbonDeltaReductionPct(5);
            case "card042" -> builder.coreDomainProgressBonus(10).coreContinuousTechDelta(3).coreContinuousGlobalPct(10);
            case "card045" -> builder.coreDomainProgressBonus(5).coreSpecialScienceCardCostReductionPct(20);
            case "card046" -> builder.coreDomainProgressBonus(3).coreContinuousPopulationDelta(1);
            case "card047" -> builder.coreDomainProgressBonus(2).coreContinuousPopulationDelta(1);
            case "card048" -> builder.coreDomainProgressBonus(5).coreContinuousCarbonDelta(-1).coreContinuousSatisfactionDelta(1);
            case "card049" -> builder.coreDomainProgressBonus(6).coreContinuousCarbonDelta(-2).coreContinuousSatisfactionDelta(2);
            case "card050" -> builder.coreDomainProgressBonus(5).coreContinuousCarbonDelta(-1).coreContinuousSatisfactionDelta(1);
            case "card051" -> builder.coreDomainProgressBonus(5).coreContinuousSatisfactionDelta(2);
            case "card054" -> builder.coreContinuousQuotaDelta(5).coreContinuousTradePricePct(50).coreConditionMinTurn(5);
            case "card055" -> builder
                .coreContinuousCarbonDelta(-8)
                .coreConditionMinTechResource(20)
                .coreConditionMinTaggedCards(1)
                .coreConditionRequiredTag("new_energy_industry");
            case "card056" -> builder
                .coreSpecialEcologyCardCostReductionPct(50)
                .coreSpecialFloodResistancePct(60);
            case "card057" -> builder
                .coreContinuousIndustryPct(50)
                .coreConditionMinIndustryCards(2)
                .coreConditionMinIndustryProgressPct(40)
                .coreConditionMinTaggedCards(2)
                .coreConditionRequiredTag("traditional_industry");
            case "card058" -> builder.coreContinuousComboPct(30);
            case "card059" -> builder
                .coreContinuousGreenDelta(3)
                .coreSpecialEcologyCarbonSinkPerTenGreen(5);
            case "card060" -> builder
                .coreContinuousIndustryDelta(8)
                .coreContinuousIndustryCarbonReductionPct(10)
                .coreConditionMinIndustryResource(100)
                .coreConditionMaxCarbon(60);
            default -> {
            }
        }
    }

    private int indexOf(ArrayNode arrayNode, String value) {
        for (int i = 0; i < arrayNode.size(); i++) {
            if (value.equals(arrayNode.get(i).asText())) {
                return i;
            }
        }
        return -1;
    }
}
