package com.youthloop.game.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.persistence.entity.GameCardEntity;
import com.youthloop.game.persistence.mapper.GameCardMapper;
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

    private volatile List<GameCardMetaDTO> cards = List.of();
    private volatile Map<String, GameCardMetaDTO> cardMap = Map.of();

    @PostConstruct
    void init() {
        reloadFromDatabase();
    }

    public synchronized void reloadFromDatabase() {
        try {
            List<GameCardEntity> dbCards = gameCardMapper.selectAllEnabled();
            List<GameCardMetaDTO> loaded = new ArrayList<>(dbCards.stream()
                .map(this::toDTO)
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

    private GameCardMetaDTO toDTO(GameCardEntity entity) {
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
            .coreConditionMinTurn(entity.getCoreConditionMinTurn())
            .coreConditionMinIndustryResource(entity.getCoreConditionMinIndustryResource())
            .coreConditionMinTechResource(entity.getCoreConditionMinTechResource())
            .coreConditionMaxCarbon(entity.getCoreConditionMaxCarbon())
            .coreConditionMinIndustryCards(entity.getCoreConditionMinIndustryCards())
            .coreConditionMinIndustryProgressPct(entity.getCoreConditionMinIndustryProgressPct())
            .coreConditionMinTaggedCards(entity.getCoreConditionMinTaggedCards())
            .coreConditionRequiredTag(entity.getCoreConditionRequiredTag())
            .coreSpecialEcologyCardCostReductionPct(entity.getCoreSpecialEcologyCardCostReductionPct())
            .coreSpecialScienceCardCostReductionPct(entity.getCoreSpecialScienceCardCostReductionPct())
            .coreSpecialFloodResistancePct(entity.getCoreSpecialFloodResistancePct())
            .coreSpecialNewEnergyIndustryPct(entity.getCoreSpecialNewEnergyIndustryPct())
            .coreSpecialEcologyCarbonSinkPerTenGreen(entity.getCoreSpecialEcologyCarbonSinkPerTenGreen())
            .build();
    }
}
