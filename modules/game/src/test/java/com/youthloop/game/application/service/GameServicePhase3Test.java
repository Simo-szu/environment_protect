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
        assertEquals(42, next.path("resources").path("industry").asInt());
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
        assertTrue(next.path("resources").path("industry").asInt() > 68);
        assertTrue(indexOf(next.withArray("policyUnlocked"), "card061") >= 0);
        assertEquals(1, next.withArray("handPolicy").size());
        assertEquals("card061", next.withArray("handPolicy").get(0).asText());
        assertTrue(next.withArray("comboTriggeredThisTurn").size() > 0);
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

        assertEquals(6, next.withArray("handCore").size());
        assertEquals("card001", next.withArray("discardCore").get(0).asText());
        assertEquals(-1, indexOf(next.withArray("handCore"), "card001"));
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

        assertEquals(2, next.withArray("handPolicy").size());
        assertEquals(1, next.withArray("discardPolicy").size());
        assertEquals("card061", next.withArray("discardPolicy").get(0).asText());
        assertEquals(1, next.withArray("handOverflowHistory").size());
        assertEquals("policy", next.withArray("handOverflowHistory").get(0).path("handType").asText());
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
        request.setActionData(objectMapper.createObjectNode().put("cardId", "card001"));

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

        ObjectNode resources = state.putObject("resources");
        resources.put("industry", 30);
        resources.put("tech", 20);
        resources.put("population", 25);

        ObjectNode metrics = state.putObject("metrics");
        metrics.put("green", 50);
        metrics.put("carbon", 80);
        metrics.put("satisfaction", 60);
        metrics.put("lowCarbonScore", 0);

        ObjectNode carbonTrade = state.putObject("carbonTrade");
        carbonTrade.put("quota", 50);
        carbonTrade.put("buyAmountTotal", 0D);
        carbonTrade.put("sellAmountTotal", 0D);
        carbonTrade.put("profit", 0D);
        carbonTrade.put("lastPrice", 2D);
        carbonTrade.put("lastWindowTurn", 0);
        carbonTrade.put("windowOpened", false);
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
        state.set("handOverflowHistory", objectMapper.createArrayNode());
        ObjectNode eventStats = state.putObject("eventStats");
        eventStats.put("negativeTriggered", 0);
        eventStats.put("negativeResolved", 0);
        state.put("policyUsedThisTurn", false);
        state.putNull("lastPolicyUsed");
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
