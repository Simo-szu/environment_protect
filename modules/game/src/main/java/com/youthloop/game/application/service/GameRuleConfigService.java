package com.youthloop.game.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.game.persistence.entity.GameComboRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameCardTagMapEntity;
import com.youthloop.game.persistence.entity.GameBalanceRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameCoreSpecialConditionConfigEntity;
import com.youthloop.game.persistence.entity.GameEventRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameEndingContentConfigEntity;
import com.youthloop.game.persistence.entity.GamePolicyUnlockRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameRuntimeParamConfigEntity;
import com.youthloop.game.persistence.mapper.GameRuleConfigMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Loads and caches game runtime rule configs from database.
 */
@Service
@RequiredArgsConstructor
public class GameRuleConfigService {

    private final GameRuleConfigMapper gameRuleConfigMapper;

    private volatile List<ComboRuleConfig> comboRules = List.of();
    private volatile Map<String, EventRuleConfig> eventRuleMap = Map.of();
    private volatile Map<String, List<String>> cardTagMap = Map.of();
    private volatile List<PolicyUnlockRuleConfig> policyUnlockRules = List.of();
    private volatile Map<String, CoreSpecialConditionConfig> coreSpecialConditionMap = Map.of();
    private volatile RuntimeParamConfig runtimeParam;
    private volatile BalanceRuleConfig balanceRule;
    private volatile Map<String, EndingContentConfig> endingContentMap = Map.of();
    private volatile int eventTriggerProbabilityPct = 30;

    @PostConstruct
    void init() {
        reloadFromDatabase();
    }

    public synchronized void reloadFromDatabase() {
        try {
            List<GameComboRuleConfigEntity> comboEntities = gameRuleConfigMapper.selectEnabledComboRules();
            List<GameEventRuleConfigEntity> eventEntities = gameRuleConfigMapper.selectEnabledEventRules();
            List<GameCardTagMapEntity> cardTagEntities = gameRuleConfigMapper.selectEnabledCardTags();
            List<GamePolicyUnlockRuleConfigEntity> policyUnlockEntities = gameRuleConfigMapper.selectEnabledPolicyUnlockRules();
            List<GameCoreSpecialConditionConfigEntity> coreSpecialConditionEntities = gameRuleConfigMapper.selectEnabledCoreSpecialConditions();
            GameRuntimeParamConfigEntity runtimeParamEntity = gameRuleConfigMapper.selectEnabledRuntimeParamConfig();
            GameBalanceRuleConfigEntity balanceRuleEntity = gameRuleConfigMapper.selectEnabledBalanceRuleConfig();
            List<GameEndingContentConfigEntity> endingContentEntities = gameRuleConfigMapper.selectEnabledEndingContents();

            List<ComboRuleConfig> loadedCombos = comboEntities.stream().map(this::toComboConfig).toList();
            this.comboRules = Collections.unmodifiableList(new ArrayList<>(loadedCombos));

            LinkedHashMap<String, EventRuleConfig> loadedEventMap = new LinkedHashMap<>();
            Integer probabilityPct = null;
            for (GameEventRuleConfigEntity entity : eventEntities) {
                EventRuleConfig config = toEventConfig(entity);
                loadedEventMap.put(config.eventType(), config);
                if (probabilityPct == null) {
                    probabilityPct = config.triggerProbabilityPct();
                } else if (!probabilityPct.equals(config.triggerProbabilityPct())) {
                    throw new BizException(
                        ErrorCode.SYSTEM_ERROR,
                        "Inconsistent trigger_probability_pct across enabled event rules"
                    );
                }
            }
            this.eventRuleMap = Collections.unmodifiableMap(loadedEventMap);
            this.eventTriggerProbabilityPct = probabilityPct == null ? 30 : probabilityPct;

            LinkedHashMap<String, List<String>> loadedTagMap = new LinkedHashMap<>();
            for (GameCardTagMapEntity entity : cardTagEntities) {
                loadedTagMap.computeIfAbsent(entity.getTagCode(), k -> new ArrayList<>()).add(entity.getCardId());
            }
            LinkedHashMap<String, List<String>> immutableTagMap = new LinkedHashMap<>();
            for (Map.Entry<String, List<String>> entry : loadedTagMap.entrySet()) {
                immutableTagMap.put(entry.getKey(), Collections.unmodifiableList(new ArrayList<>(entry.getValue())));
            }
            this.cardTagMap = Collections.unmodifiableMap(immutableTagMap);

            List<PolicyUnlockRuleConfig> loadedUnlockRules = policyUnlockEntities.stream().map(this::toPolicyUnlockRule).toList();
            this.policyUnlockRules = Collections.unmodifiableList(new ArrayList<>(loadedUnlockRules));

            LinkedHashMap<String, CoreSpecialConditionConfig> loadedCoreSpecialConditionMap = new LinkedHashMap<>();
            for (GameCoreSpecialConditionConfigEntity entity : coreSpecialConditionEntities) {
                CoreSpecialConditionConfig config = toCoreSpecialCondition(entity);
                loadedCoreSpecialConditionMap.put(config.cardId(), config);
            }
            this.coreSpecialConditionMap = Collections.unmodifiableMap(loadedCoreSpecialConditionMap);

            if (runtimeParamEntity == null) {
                throw new BizException(ErrorCode.SYSTEM_ERROR, "Missing enabled runtime parameter config");
            }
            this.runtimeParam = toRuntimeParam(runtimeParamEntity);
            if (balanceRuleEntity == null) {
                throw new BizException(ErrorCode.SYSTEM_ERROR, "Missing enabled balance rule config");
            }
            this.balanceRule = toBalanceRule(balanceRuleEntity);
            LinkedHashMap<String, EndingContentConfig> loadedEndingContentMap = new LinkedHashMap<>();
            for (GameEndingContentConfigEntity entity : endingContentEntities) {
                EndingContentConfig config = toEndingContent(entity);
                loadedEndingContentMap.put(config.endingId(), config);
            }
            this.endingContentMap = Collections.unmodifiableMap(loadedEndingContentMap);
        } catch (Exception e) {
            throw new BizException(
                ErrorCode.SYSTEM_ERROR,
                "Failed to load game rule config: " + e.getClass().getSimpleName() + ": " + e.getMessage()
            );
        }
    }

    public List<ComboRuleConfig> listComboRules() {
        return comboRules;
    }

    public Map<String, EventRuleConfig> eventRuleMap() {
        return eventRuleMap;
    }

    public int eventTriggerProbabilityPct() {
        return eventTriggerProbabilityPct;
    }

    public Map<String, List<String>> cardTagMap() {
        return cardTagMap;
    }

    public List<PolicyUnlockRuleConfig> listPolicyUnlockRules() {
        return policyUnlockRules;
    }

    public Map<String, CoreSpecialConditionConfig> coreSpecialConditionMap() {
        return coreSpecialConditionMap;
    }

    public RuntimeParamConfig runtimeParam() {
        if (runtimeParam == null) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "Runtime parameter config is not loaded");
        }
        return runtimeParam;
    }

    public BalanceRuleConfig balanceRule() {
        if (balanceRule == null) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "Balance rule config is not loaded");
        }
        return balanceRule;
    }

    public Map<String, EndingContentConfig> endingContentMap() {
        return endingContentMap;
    }

    private ComboRuleConfig toComboConfig(GameComboRuleConfigEntity entity) {
        return new ComboRuleConfig(
            entity.getComboId(),
            defaultString(entity.getRequiredPolicyId()),
            defaultInt(entity.getMinIndustry()),
            defaultInt(entity.getMinEcology()),
            defaultInt(entity.getMinScience()),
            defaultInt(entity.getMinSociety()),
            defaultInt(entity.getMinLowCarbonIndustry()),
            defaultInt(entity.getMinShenzhenEcology()),
            defaultInt(entity.getMinLinkCards()),
            defaultInt(entity.getMinIndustryLowCarbonAdjacentPairs()),
            defaultInt(entity.getMinScienceScienceAdjacentPairs()),
            defaultInt(entity.getMinScienceIndustryAdjacentPairs()),
            defaultInt(entity.getMinIndustryEcologyAdjacentPairs()),
            defaultInt(entity.getMinSocietyEcologyAdjacentPairs()),
            new ComboEffectConfig(
                defaultInt(entity.getEffectIndustryDelta()),
                defaultInt(entity.getEffectTechDelta()),
                defaultInt(entity.getEffectPopulationDelta()),
                defaultInt(entity.getEffectGreenDelta()),
                defaultInt(entity.getEffectCarbonDelta()),
                defaultInt(entity.getEffectSatisfactionDelta()),
                defaultInt(entity.getEffectQuotaDelta()),
                defaultInt(entity.getEffectLowCarbonDelta()),
                defaultInt(entity.getEffectTechPct()),
                defaultInt(entity.getEffectPopulationPct()),
                defaultInt(entity.getEffectIndustryPct()),
                defaultInt(entity.getEffectLowCarbonPct()),
                defaultInt(entity.getEffectGreenPct()),
                defaultInt(entity.getEffectGlobalPct())
            )
        );
    }

    private EventRuleConfig toEventConfig(GameEventRuleConfigEntity entity) {
        return new EventRuleConfig(
            entity.getEventType(),
            clamp(defaultInt(entity.getTriggerProbabilityPct()), 0, 100),
            entity.getMinGreen(),
            entity.getMinCarbon(),
            entity.getMaxSatisfaction(),
            entity.getMinPopulation(),
            Boolean.TRUE.equals(entity.getRequireEvenTurn()),
            Math.max(1, defaultInt(entity.getWeight())),
            Math.max(1, defaultInt(entity.getDurationTurns())),
            defaultInt(entity.getGreenDelta()),
            defaultInt(entity.getCarbonDelta()),
            defaultInt(entity.getSatisfactionDelta()),
            defaultInt(entity.getGreenPctDelta()),
            defaultInt(entity.getPopulationPctDelta()),
            defaultInt(entity.getQuotaDelta()),
            defaultString(entity.getDisplayName()),
            defaultString(entity.getEffectSummary()),
            defaultString(entity.getResolutionHint()),
            splitCsv(entity.getResolvablePolicyIdsCsv())
        );
    }

    private PolicyUnlockRuleConfig toPolicyUnlockRule(GamePolicyUnlockRuleConfigEntity entity) {
        return new PolicyUnlockRuleConfig(
            entity.getPolicyId(),
            defaultInt(entity.getMinIndustry()),
            defaultInt(entity.getMinEcology()),
            defaultInt(entity.getMinScience()),
            defaultInt(entity.getMinSociety()),
            defaultInt(entity.getMinIndustryResource()),
            defaultInt(entity.getMinTechResource()),
            defaultInt(entity.getMinPopulationResource()),
            entity.getMinGreen(),
            entity.getMinCarbon(),
            entity.getMaxCarbon(),
            entity.getMinSatisfaction(),
            defaultInt(entity.getMinTaggedCards()),
            defaultString(entity.getRequiredTag())
        );
    }

    private CoreSpecialConditionConfig toCoreSpecialCondition(GameCoreSpecialConditionConfigEntity entity) {
        return new CoreSpecialConditionConfig(
            entity.getCardId(),
            defaultString(entity.getRequiredEventType()),
            defaultInt(entity.getMinIndustryCards()),
            defaultInt(entity.getMinEcologyCards()),
            defaultInt(entity.getMinScienceCards()),
            defaultInt(entity.getMinSocietyCards())
        );
    }

    private RuntimeParamConfig toRuntimeParam(GameRuntimeParamConfigEntity entity) {
        return new RuntimeParamConfig(
            Math.max(1, defaultInt(entity.getCoreHandLimit())),
            Math.max(1, defaultInt(entity.getPolicyHandLimit())),
            Math.max(1, defaultInt(entity.getMaxComboPerTurn())),
            Math.max(1, defaultInt(entity.getMaxTurn())),
            Math.max(1, defaultInt(entity.getTradeWindowInterval())),
            defaultDouble(entity.getBaseCarbonPrice()),
            Math.max(1, defaultInt(entity.getMaxCarbonQuota())),
            Math.max(1, defaultInt(entity.getDomainProgressCardCap())),
            defaultBoolean(entity.getFreePlacementEnabled(), true),
            Math.max(1, entity.getEndingDisplaySeconds() == null ? 5 : entity.getEndingDisplaySeconds()),
            defaultBoolean(entity.getTurnTransitionAnimationEnabledDefault(), true),
            Math.max(1, entity.getTurnTransitionAnimationSeconds() == null ? 2 : entity.getTurnTransitionAnimationSeconds())
        );
    }

    private BalanceRuleConfig toBalanceRule(GameBalanceRuleConfigEntity entity) {
        return new BalanceRuleConfig(
            defaultString(entity.getInitialPhase()),
            defaultInt(entity.getInitialEventCooldown()),
            Math.max(1, defaultInt(entity.getBoardSize())),
            defaultInt(entity.getInitialIndustry()),
            defaultInt(entity.getInitialTech()),
            defaultInt(entity.getInitialPopulation()),
            defaultInt(entity.getInitialGreen()),
            defaultInt(entity.getInitialCarbon()),
            defaultInt(entity.getInitialSatisfaction()),
            defaultInt(entity.getInitialLowCarbonScore()),
            defaultInt(entity.getInitialQuota()),
            Math.max(0, defaultInt(entity.getInitialDrawEarly())),
            Math.max(0, defaultInt(entity.getDrawCountEarly())),
            Math.max(0, defaultInt(entity.getDrawCountMid())),
            Math.max(0, defaultInt(entity.getDrawCountLate())),
            Math.max(1, defaultInt(entity.getEventCooldownResetTurns())),
            defaultInt(entity.getSettlementBaseIndustryGain()),
            defaultInt(entity.getSettlementBaseTechGain()),
            defaultInt(entity.getSettlementBasePopulationGain()),
            Math.max(1, defaultInt(entity.getSatisfactionMax())),
            defaultInt(entity.getCarbonQuotaBaseLine()),
            Math.max(1, defaultInt(entity.getCarbonQuotaPerNOver())),
            defaultInt(entity.getCarbonIndustryEmissionPerCard()),
            defaultInt(entity.getCarbonEcologyReductionPerCard()),
            defaultInt(entity.getCarbonScienceReductionPerCard()),
            defaultDouble(entity.getTradeRandomBaseMin()),
            defaultDouble(entity.getTradeRandomSpan()),
            defaultInt(entity.getTradeHighCarbonThreshold()),
            defaultDouble(entity.getTradeHighCarbonFactor()),
            defaultInt(entity.getTradeLowCarbonThreshold()),
            defaultDouble(entity.getTradeLowCarbonFactor()),
            defaultInt(entity.getFailureHighCarbonThreshold()),
            Math.max(1, defaultInt(entity.getFailureHighCarbonStreakLimit())),
            Math.max(1, defaultInt(entity.getTradeFailureQuotaExhaustedLimit())),
            defaultDouble(entity.getTradeFailureProfitThreshold()),
            defaultInt(entity.getLowCarbonMinForPositiveEnding()),
            defaultInt(entity.getLowCarbonDomainThreshold()),
            defaultInt(entity.getLowCarbonDomainBonus()),
            defaultInt(entity.getLowCarbonPolicyUnlockScore()),
            defaultInt(entity.getLowCarbonPolicyUnlockAllCount()),
            defaultInt(entity.getLowCarbonPolicyUnlockAllBonus()),
            defaultInt(entity.getLowCarbonEventResolvedScore()),
            defaultInt(entity.getLowCarbonEventTriggeredPenalty()),
            defaultInt(entity.getLowCarbonOverLimitCarbonThreshold()),
            defaultInt(entity.getLowCarbonOverLimitStreakThreshold()),
            defaultInt(entity.getLowCarbonOverLimitStreakPenalty()),
            defaultDouble(entity.getLowCarbonTradeProfitDivisor()),
            defaultInt(entity.getLowCarbonTradeProfitBonus()),
            defaultInt(entity.getLowCarbonQuotaExhaustedPenalty()),
            defaultInt(entity.getLowCarbonInvalidOperationPenalty()),
            defaultInt(entity.getCarbonTier1Max()),
            defaultInt(entity.getCarbonTier1Score()),
            defaultInt(entity.getCarbonTier2Max()),
            defaultInt(entity.getCarbonTier2Score()),
            defaultInt(entity.getCarbonTier3Max()),
            defaultInt(entity.getCarbonTier3Score()),
            defaultInt(entity.getCarbonTier4Max()),
            defaultInt(entity.getCarbonTier4Score()),
            defaultInt(entity.getCarbonTier5Score()),
            defaultInt(entity.getPhaseEarlyMaxCards()),
            defaultInt(entity.getPhaseEarlyMaxScore()),
            defaultInt(entity.getPhaseMidMinCards()),
            defaultInt(entity.getPhaseMidMaxCards()),
            defaultInt(entity.getPhaseMidMinScore()),
            defaultInt(entity.getPhaseMidMaxScore()),
            defaultInt(entity.getPhaseLateMinCards()),
            defaultInt(entity.getPhaseLateMinScore()),
            defaultInt(entity.getPhaseLateRemainingCardsThreshold()),
            defaultDouble(entity.getEndingEventResolveRateRequired()),
            defaultInt(entity.getEndingInnovationMinScience()),
            defaultInt(entity.getEndingInnovationMinTech()),
            defaultInt(entity.getEndingInnovationMinLowCarbon()),
            defaultInt(entity.getEndingInnovationMaxCarbon()),
            defaultDouble(entity.getEndingInnovationMinProfit()),
            defaultInt(entity.getEndingEcologyMinEcology()),
            defaultInt(entity.getEndingEcologyMinGreen()),
            defaultInt(entity.getEndingEcologyMinLowCarbon()),
            defaultInt(entity.getEndingEcologyMaxCarbon()),
            defaultInt(entity.getEndingEcologyMinQuota()),
            defaultInt(entity.getEndingDoughnutMinSociety()),
            defaultInt(entity.getEndingDoughnutMinSatisfaction()),
            defaultInt(entity.getEndingDoughnutMinPopulation()),
            defaultInt(entity.getEndingDoughnutMinDomain()),
            defaultInt(entity.getEndingDoughnutMinLowCarbon()),
            defaultInt(entity.getEndingDoughnutMaxCarbon()),
            defaultInt(entity.getEndingDoughnutMinPolicyUsage6768())
        );
    }

    private EndingContentConfig toEndingContent(GameEndingContentConfigEntity entity) {
        return new EndingContentConfig(
            defaultString(entity.getEndingId()),
            defaultString(entity.getEndingName()),
            defaultString(entity.getImageKey()),
            defaultString(entity.getDefaultReason()),
            defaultString(entity.getFailureReasonHighCarbon()),
            defaultString(entity.getFailureReasonTrade()),
            defaultString(entity.getFailureReasonLowScore()),
            defaultString(entity.getFailureReasonBoundaryDefault())
        );
    }

    private List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        String[] parts = value.split(",");
        List<String> ids = new ArrayList<>(parts.length);
        for (String part : parts) {
            String token = part.trim();
            if (!token.isEmpty()) {
                ids.add(token);
            }
        }
        return Collections.unmodifiableList(ids);
    }

    private int defaultInt(Integer value) {
        return Objects.requireNonNullElse(value, 0);
    }

    private double defaultDouble(Double value) {
        return value == null ? 0D : value;
    }

    private String defaultString(String value) {
        return Objects.requireNonNullElse(value, "");
    }

    private boolean defaultBoolean(Boolean value, boolean fallback) {
        return value == null ? fallback : value;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    public record ComboRuleConfig(
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
        ComboEffectConfig effect
    ) {
    }

    public record ComboEffectConfig(
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

    public record EventRuleConfig(
        String eventType,
        int triggerProbabilityPct,
        Integer minGreen,
        Integer minCarbon,
        Integer maxSatisfaction,
        Integer minPopulation,
        boolean requireEvenTurn,
        int weight,
        int durationTurns,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int greenPctDelta,
        int populationPctDelta,
        int quotaDelta,
        String displayName,
        String effectSummary,
        String resolutionHint,
        List<String> resolvablePolicyIds
    ) {
    }

    public record PolicyUnlockRuleConfig(
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
    }

    public record CoreSpecialConditionConfig(
        String cardId,
        String requiredEventType,
        int minIndustryCards,
        int minEcologyCards,
        int minScienceCards,
        int minSocietyCards
    ) {
    }

    public record RuntimeParamConfig(
        int coreHandLimit,
        int policyHandLimit,
        int maxComboPerTurn,
        int maxTurn,
        int tradeWindowInterval,
        double baseCarbonPrice,
        int maxCarbonQuota,
        int domainProgressCardCap,
        boolean freePlacementEnabled,
        int endingDisplaySeconds,
        boolean turnTransitionAnimationEnabledDefault,
        int turnTransitionAnimationSeconds
    ) {
    }

    public record BalanceRuleConfig(
        String initialPhase,
        int initialEventCooldown,
        int boardSize,
        int initialIndustry,
        int initialTech,
        int initialPopulation,
        int initialGreen,
        int initialCarbon,
        int initialSatisfaction,
        int initialLowCarbonScore,
        int initialQuota,
        int initialDrawEarly,
        int drawCountEarly,
        int drawCountMid,
        int drawCountLate,
        int eventCooldownResetTurns,
        int settlementBaseIndustryGain,
        int settlementBaseTechGain,
        int settlementBasePopulationGain,
        int satisfactionMax,
        int carbonQuotaBaseLine,
        int carbonQuotaPerNOver,
        int carbonIndustryEmissionPerCard,
        int carbonEcologyReductionPerCard,
        int carbonScienceReductionPerCard,
        double tradeRandomBaseMin,
        double tradeRandomSpan,
        int tradeHighCarbonThreshold,
        double tradeHighCarbonFactor,
        int tradeLowCarbonThreshold,
        double tradeLowCarbonFactor,
        int failureHighCarbonThreshold,
        int failureHighCarbonStreakLimit,
        int tradeFailureQuotaExhaustedLimit,
        double tradeFailureProfitThreshold,
        int lowCarbonMinForPositiveEnding,
        int lowCarbonDomainThreshold,
        int lowCarbonDomainBonus,
        int lowCarbonPolicyUnlockScore,
        int lowCarbonPolicyUnlockAllCount,
        int lowCarbonPolicyUnlockAllBonus,
        int lowCarbonEventResolvedScore,
        int lowCarbonEventTriggeredPenalty,
        int lowCarbonOverLimitCarbonThreshold,
        int lowCarbonOverLimitStreakThreshold,
        int lowCarbonOverLimitStreakPenalty,
        double lowCarbonTradeProfitDivisor,
        int lowCarbonTradeProfitBonus,
        int lowCarbonQuotaExhaustedPenalty,
        int lowCarbonInvalidOperationPenalty,
        int carbonTier1Max,
        int carbonTier1Score,
        int carbonTier2Max,
        int carbonTier2Score,
        int carbonTier3Max,
        int carbonTier3Score,
        int carbonTier4Max,
        int carbonTier4Score,
        int carbonTier5Score,
        int phaseEarlyMaxCards,
        int phaseEarlyMaxScore,
        int phaseMidMinCards,
        int phaseMidMaxCards,
        int phaseMidMinScore,
        int phaseMidMaxScore,
        int phaseLateMinCards,
        int phaseLateMinScore,
        int phaseLateRemainingCardsThreshold,
        double endingEventResolveRateRequired,
        int endingInnovationMinScience,
        int endingInnovationMinTech,
        int endingInnovationMinLowCarbon,
        int endingInnovationMaxCarbon,
        double endingInnovationMinProfit,
        int endingEcologyMinEcology,
        int endingEcologyMinGreen,
        int endingEcologyMinLowCarbon,
        int endingEcologyMaxCarbon,
        int endingEcologyMinQuota,
        int endingDoughnutMinSociety,
        int endingDoughnutMinSatisfaction,
        int endingDoughnutMinPopulation,
        int endingDoughnutMinDomain,
        int endingDoughnutMinLowCarbon,
        int endingDoughnutMaxCarbon,
        int endingDoughnutMinPolicyUsage6768
    ) {
    }

    public record EndingContentConfig(
        String endingId,
        String endingName,
        String imageKey,
        String defaultReason,
        String failureReasonHighCarbon,
        String failureReasonTrade,
        String failureReasonLowScore,
        String failureReasonBoundaryDefault
    ) {
    }
}
