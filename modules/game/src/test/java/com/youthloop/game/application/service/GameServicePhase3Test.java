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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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

@ExtendWith(MockitoExtension.class)
class GameServicePhase3Test {

    @Mock
    private GameSessionMapper gameSessionMapper;
    @Mock
    private GameActionMapper gameActionMapper;
    @Mock
    private CardCatalogService cardCatalogService;

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
        assertEquals(17, next.with("metrics").path("lowCarbonScore").asInt());
        assertTrue(indexOf(next.withArray("comboTriggeredThisTurn"), "intra_science_boost") >= 0);
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
        verifyNoInteractions(gameSessionMapper, gameActionMapper);
    }

    private ObjectNode baseState() {
        ObjectNode state = objectMapper.createObjectNode();
        state.put("turn", 1);
        state.put("phase", "early");
        state.put("eventCooldown", 0);
        state.put("maxTurn", 30);
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
        return GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(61)
            .cardType("policy")
            .phaseBucket("policy")
            .domain("policy")
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0))
            .build();
    }

    private GameCardMetaDTO coreIndustryCard(String cardId) {
        return GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(1)
            .cardType("core")
            .phaseBucket("early")
            .domain("industry")
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0))
            .build();
    }

    private GameCardMetaDTO coreCard(String cardId, String domain) {
        return GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(1)
            .cardType("core")
            .phaseBucket("early")
            .domain(domain)
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0))
            .build();
    }

    private GameCardMetaDTO coreCardWithCost(String cardId, String domain, int industry, int tech, int population, int green) {
        return GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(1)
            .cardType("core")
            .phaseBucket("early")
            .domain(domain)
            .unlockCost(new GameCardMetaDTO.UnlockCost(industry, tech, population, green))
            .build();
    }

    private GameCardMetaDTO coreScienceLateCard(String cardId) {
        return GameCardMetaDTO.builder()
            .cardId(cardId)
            .cardNo(46)
            .cardType("core")
            .phaseBucket("late")
            .domain("science")
            .unlockCost(new GameCardMetaDTO.UnlockCost(0, 0, 0, 0))
            .build();
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
