package com.youthloop.game.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.persistence.entity.GameCardEntity;
import com.youthloop.game.persistence.entity.GameCardUpgradeRequirementEntity;
import com.youthloop.game.persistence.mapper.GameCardMapper;
import com.youthloop.game.persistence.mapper.GameCardUpgradeRequirementMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Loads card metadata from database.
 */
@Service
@RequiredArgsConstructor
public class CardCatalogService {

    private final GameCardMapper gameCardMapper;
    private final GameCardUpgradeRequirementMapper gameCardUpgradeRequirementMapper;

    private volatile List<GameCardMetaDTO> cards = List.of();
    private volatile Map<String, GameCardMetaDTO> cardMap = Map.of();

    @PostConstruct
    void init() {
        reloadFromDatabase();
    }

    public synchronized void reloadFromDatabase() {
        try {
            List<GameCardEntity> dbCards = gameCardMapper.selectAllEnabled();
            Map<String, GameCardUpgradeRequirementEntity> requirementMap = gameCardUpgradeRequirementMapper.selectAllEnabled()
                .stream()
                .collect(Collectors.toMap(
                    GameCardUpgradeRequirementEntity::getCardId,
                    value -> value,
                    (a, b) -> compareUpgradePriority(a, b) >= 0 ? a : b
                ));
            List<GameCardMetaDTO> loaded = new ArrayList<>(dbCards.stream()
                .map(card -> toDTO(card, requirementMap.get(card.getCardId())))
                .toList());
            loaded.sort(Comparator.comparing(GameCardMetaDTO::getCardNo));
            this.cards = Collections.unmodifiableList(new ArrayList<>(loaded));
            this.cardMap = Collections.unmodifiableMap(
                loaded.stream().collect(Collectors.toMap(
                    GameCardMetaDTO::getCardId,
                    c -> c,
                    (a, b) -> a,
                    LinkedHashMap::new
                ))
            );
        } catch (Exception e) {
            throw new BizException(
                ErrorCode.SYSTEM_ERROR,
                "Failed to load card catalog: " + e.getClass().getSimpleName() + ": " + e.getMessage()
            );
        }
    }

    public List<GameCardMetaDTO> listCards(boolean includePolicy) {
        if (includePolicy) {
            return cards;
        }
        return cards.stream()
            .filter(card -> "core".equals(card.getCardType()))
            .toList();
    }

    public GameCardMetaDTO getRequiredCard(String cardId) {
        GameCardMetaDTO card = cardMap.get(cardId);
        if (card == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown card id: " + cardId);
        }
        return card;
    }

    public List<String> listCoreCardsByPhase(String phaseBucket) {
        return gameCardMapper.selectCoreCardIdsByPhase(phaseBucket);
    }

    private int compareUpgradePriority(GameCardUpgradeRequirementEntity left, GameCardUpgradeRequirementEntity right) {
        int leftTo = left.getToStar() == null ? 0 : left.getToStar();
        int rightTo = right.getToStar() == null ? 0 : right.getToStar();
        if (leftTo != rightTo) {
            return Integer.compare(leftTo, rightTo);
        }
        int leftFrom = left.getFromStar() == null ? 0 : left.getFromStar();
        int rightFrom = right.getFromStar() == null ? 0 : right.getFromStar();
        return Integer.compare(leftFrom, rightFrom);
    }

    private GameCardMetaDTO toDTO(GameCardEntity entity, GameCardUpgradeRequirementEntity requirement) {
        return GameCardMetaDTO.builder()
            .cardId(entity.getCardId())
            .cardNo(entity.getCardNo())
            .chineseName(entity.getNameZh())
            .englishName(entity.getNameEn())
            .cardType(entity.getCardType())
            .domain(entity.getDomain())
            .star(entity.getStar())
            .phaseBucket(entity.getPhaseBucket())
            .unlockCost(
                GameCardMetaDTO.UnlockCost.builder()
                    .industry(entity.getUnlockCostIndustry())
                    .tech(entity.getUnlockCostTech())
                    .population(entity.getUnlockCostPopulation())
                    .green(entity.getUnlockCostGreen())
                    .build()
            )
            .imageKey(entity.getImageKey())
            .advancedImageKey(entity.getAdvancedImageKey())
            .policyImmediateIndustryDelta(entity.getPolicyImmediateIndustryDelta())
            .policyImmediateTechDelta(entity.getPolicyImmediateTechDelta())
            .policyImmediatePopulationDelta(entity.getPolicyImmediatePopulationDelta())
            .policyImmediateGreenDelta(entity.getPolicyImmediateGreenDelta())
            .policyImmediateCarbonDelta(entity.getPolicyImmediateCarbonDelta())
            .policyImmediateSatisfactionDelta(entity.getPolicyImmediateSatisfactionDelta())
            .policyImmediateQuotaDelta(entity.getPolicyImmediateQuotaDelta())
            .policyImmediateGroup(entity.getPolicyImmediateGroup())
            .policyImmediateTurns(entity.getPolicyImmediateTurns())
            .policyContinuousIndustryDelta(entity.getPolicyContinuousIndustryDelta())
            .policyContinuousTechDelta(entity.getPolicyContinuousTechDelta())
            .policyContinuousPopulationDelta(entity.getPolicyContinuousPopulationDelta())
            .policyContinuousGreenDelta(entity.getPolicyContinuousGreenDelta())
            .policyContinuousCarbonDelta(entity.getPolicyContinuousCarbonDelta())
            .policyContinuousSatisfactionDelta(entity.getPolicyContinuousSatisfactionDelta())
            .policyContinuousLowCarbonDelta(entity.getPolicyContinuousLowCarbonDelta())
            .policyContinuousGreenPct(entity.getPolicyContinuousGreenPct())
            .policyContinuousTechPct(entity.getPolicyContinuousTechPct())
            .policyContinuousPopulationPct(entity.getPolicyContinuousPopulationPct())
            .policyContinuousIndustryPct(entity.getPolicyContinuousIndustryPct())
            .policyContinuousIndustryCarbonReductionPct(entity.getPolicyContinuousIndustryCarbonReductionPct())
            .policyImmediateEffect(entity.getPolicyImmediateEffect())
            .policyContinuousEffect(entity.getPolicyContinuousEffect())
            .policyImmediateExt(entity.getPolicyImmediateExt())
            .policyContinuousExt(entity.getPolicyContinuousExt())
            .coreImmediateIndustryDelta(entity.getCoreImmediateIndustryDelta())
            .coreImmediateTechDelta(entity.getCoreImmediateTechDelta())
            .coreImmediatePopulationDelta(entity.getCoreImmediatePopulationDelta())
            .coreImmediateGreenDelta(entity.getCoreImmediateGreenDelta())
            .coreImmediateCarbonDelta(entity.getCoreImmediateCarbonDelta())
            .coreImmediateSatisfactionDelta(entity.getCoreImmediateSatisfactionDelta())
            .coreImmediateQuotaDelta(entity.getCoreImmediateQuotaDelta())
            .coreImmediateComboPct(entity.getCoreImmediateComboPct())
            .coreImmediateIndustryCarbonDelta(entity.getCoreImmediateIndustryCarbonDelta())
            .coreImmediateIndustryCarbonReductionPct(entity.getCoreImmediateIndustryCarbonReductionPct())
            .coreImmediateEffect(entity.getCoreImmediateEffect())
            .coreImmediateExt(entity.getCoreImmediateExt())
            .coreDomainProgressBonus(entity.getCoreDomainProgressBonus())
            .coreContinuousIndustryDelta(entity.getCoreContinuousIndustryDelta())
            .coreContinuousTechDelta(entity.getCoreContinuousTechDelta())
            .coreContinuousPopulationDelta(entity.getCoreContinuousPopulationDelta())
            .coreContinuousGreenDelta(entity.getCoreContinuousGreenDelta())
            .coreContinuousCarbonDelta(entity.getCoreContinuousCarbonDelta())
            .coreContinuousSatisfactionDelta(entity.getCoreContinuousSatisfactionDelta())
            .coreContinuousQuotaDelta(entity.getCoreContinuousQuotaDelta())
            .coreContinuousLowCarbonDelta(entity.getCoreContinuousLowCarbonDelta())
            .coreContinuousIndustryPct(entity.getCoreContinuousIndustryPct())
            .coreContinuousTechPct(entity.getCoreContinuousTechPct())
            .coreContinuousPopulationPct(entity.getCoreContinuousPopulationPct())
            .coreContinuousGreenPct(entity.getCoreContinuousGreenPct())
            .coreContinuousGlobalPct(entity.getCoreContinuousGlobalPct())
            .coreContinuousLowCarbonPct(entity.getCoreContinuousLowCarbonPct())
            .coreContinuousIndustryCarbonReductionPct(entity.getCoreContinuousIndustryCarbonReductionPct())
            .coreContinuousCarbonDeltaReductionPct(entity.getCoreContinuousCarbonDeltaReductionPct())
            .coreContinuousTradePricePct(entity.getCoreContinuousTradePricePct())
            .coreContinuousComboPct(entity.getCoreContinuousComboPct())
            .coreContinuousSciencePct(entity.getCoreContinuousSciencePct())
            .coreContinuousSharedMobilityPct(entity.getCoreContinuousSharedMobilityPct())
            .coreContinuousCrossDomainCarbonDelta(entity.getCoreContinuousCrossDomainCarbonDelta())
            .coreContinuousCrossDomainComboPct(entity.getCoreContinuousCrossDomainComboPct())
            .coreContinuousIndustryCarbonOffset(entity.getCoreContinuousIndustryCarbonOffset())
            .coreContinuousEffect(entity.getCoreContinuousEffect())
            .coreContinuousExt(entity.getCoreContinuousExt())
            .coreConditionMinTurn(entity.getCoreConditionMinTurn())
            .coreConditionMinIndustryResource(entity.getCoreConditionMinIndustryResource())
            .coreConditionMinTechResource(entity.getCoreConditionMinTechResource())
            .coreConditionMinCarbon(entity.getCoreConditionMinCarbon())
            .coreConditionMaxCarbon(entity.getCoreConditionMaxCarbon())
            .coreConditionMinIndustryCards(entity.getCoreConditionMinIndustryCards())
            .coreConditionMinEcologyCards(entity.getCoreConditionMinEcologyCards())
            .coreConditionMinScienceCards(entity.getCoreConditionMinScienceCards())
            .coreConditionMinSocietyCards(entity.getCoreConditionMinSocietyCards())
            .coreConditionMinIndustryProgressPct(entity.getCoreConditionMinIndustryProgressPct())
            .coreConditionMinGreen(entity.getCoreConditionMinGreen())
            .coreConditionMinPopulation(entity.getCoreConditionMinPopulation())
            .coreConditionMinSatisfaction(entity.getCoreConditionMinSatisfaction())
            .coreConditionMinSocietyProgressPct(entity.getCoreConditionMinSocietyProgressPct())
            .coreConditionMinTaggedCards(entity.getCoreConditionMinTaggedCards())
            .coreConditionRequiredTag(entity.getCoreConditionRequiredTag())
            .coreConditionEffect(entity.getCoreConditionEffect())
            .coreConditionExt(entity.getCoreConditionExt())
            .coreSpecialEcologyCardCostReductionPct(entity.getCoreSpecialEcologyCardCostReductionPct())
            .coreSpecialScienceCardCostReductionPct(entity.getCoreSpecialScienceCardCostReductionPct())
            .coreSpecialFloodResistancePct(entity.getCoreSpecialFloodResistancePct())
            .coreSpecialNewEnergyIndustryPct(entity.getCoreSpecialNewEnergyIndustryPct())
            .coreSpecialEcologyCarbonSinkPerTenGreen(entity.getCoreSpecialEcologyCarbonSinkPerTenGreen())
            .coreSpecialEcologyCarbonSinkBaseGreen(entity.getCoreSpecialEcologyCarbonSinkBaseGreen())
            .coreSpecialEcologyCarbonSinkPct(entity.getCoreSpecialEcologyCarbonSinkPct())
            .coreSpecialUpgradeCostReductionPct(entity.getCoreSpecialUpgradeCostReductionPct())
            .coreSpecialEffect(entity.getCoreSpecialEffect())
            .coreSpecialExt(entity.getCoreSpecialExt())
            .upgradeDeltaIndustry(entity.getUpgradeDeltaIndustry())
            .upgradeDeltaTech(entity.getUpgradeDeltaTech())
            .upgradeDeltaPopulation(entity.getUpgradeDeltaPopulation())
            .upgradeDeltaGreen(entity.getUpgradeDeltaGreen())
            .upgradeDeltaCarbon(entity.getUpgradeDeltaCarbon())
            .upgradeDeltaSatisfaction(entity.getUpgradeDeltaSatisfaction())
            .upgradeDeltaQuota(entity.getUpgradeDeltaQuota())
            .upgradeDeltaLowCarbon(entity.getUpgradeDeltaLowCarbon())
            .upgradeDeltaSectorProgressPct(entity.getUpgradeDeltaSectorProgressPct())
            .upgradeDeltaIndustryPct(entity.getUpgradeDeltaIndustryPct())
            .upgradeDeltaGreenPct(entity.getUpgradeDeltaGreenPct())
            .upgradeDeltaGlobalPct(entity.getUpgradeDeltaGlobalPct())
            .upgradeDeltaTechPct(entity.getUpgradeDeltaTechPct())
            .upgradeDeltaIndustryCarbonReductionPct(entity.getUpgradeDeltaIndustryCarbonReductionPct())
            .upgradeDeltaCarbonDeltaReductionPct(entity.getUpgradeDeltaCarbonDeltaReductionPct())
            .upgradeDeltaTradePricePct(entity.getUpgradeDeltaTradePricePct())
            .upgradeDeltaComboPct(entity.getUpgradeDeltaComboPct())
            .upgradeDeltaSharedMobilityPct(entity.getUpgradeDeltaSharedMobilityPct())
            .upgradeDeltaEcologyCardCostPct(entity.getUpgradeDeltaEcologyCardCostPct())
            .upgradeDeltaScienceCardCostPct(entity.getUpgradeDeltaScienceCardCostPct())
            .upgradeDeltaFloodResistancePct(entity.getUpgradeDeltaFloodResistancePct())
            .upgradeDeltaNewEnergyPct(entity.getUpgradeDeltaNewEnergyPct())
            .upgradeDeltaEcologySink(entity.getUpgradeDeltaEcologySink())
            .upgradeDeltaTradUpgradePct(entity.getUpgradeDeltaTradUpgradePct())
            .upgradeDeltaUpgradeCostPct(entity.getUpgradeDeltaUpgradeCostPct())
            .upgradeEffect(entity.getUpgradeEffect())
            .upgradeExt(entity.getUpgradeExt())
            .upgradeRequirement(
                requirement == null ? null : GameCardMetaDTO.UpgradeRequirement.builder()
                    .fromStar(requirement.getFromStar())
                    .toStar(requirement.getToStar())
                    .reqDomain1(requirement.getReqDomain1())
                    .reqDomain1MinPct(requirement.getReqDomain1MinPct())
                    .reqDomain2(requirement.getReqDomain2())
                    .reqDomain2MinPct(requirement.getReqDomain2MinPct())
                    .costIndustry(requirement.getCostIndustry())
                    .costTech(requirement.getCostTech())
                    .costPopulation(requirement.getCostPopulation())
                    .costGreen(requirement.getCostGreen())
                    .ruleJson(requirement.getRuleJson())
                    .costJson(requirement.getCostJson())
                    .configSnapshot(requirement.getConfigSnapshot())
                    .build()
            )
            .build();
    }
}
