package com.youthloop.game.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.game.api.dto.AdminCreateGameCardRequest;
import com.youthloop.game.api.dto.AdminUpdateGameCardRequest;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.persistence.entity.GameCardEntity;
import com.youthloop.game.persistence.mapper.GameCardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.youthloop.common.api.PageResponse;
import java.util.List;
import java.util.Objects;

/**
 * Admin service for game card CRUD.
 */
@Service
@RequiredArgsConstructor
public class GameCardAdminService {

    private final GameCardMapper gameCardMapper;
    private final CardCatalogService cardCatalogService;

    @Transactional(readOnly = true)
    public PageResponse<GameCardMetaDTO> listCards(int page, int size) {
        int validPage = Math.max(1, page);
        int validSize = Math.min(100, Math.max(1, size));
        int offset = (validPage - 1) * validSize;
        long total = gameCardMapper.countAll();
        List<GameCardMetaDTO> items = gameCardMapper.selectAll(offset, validSize).stream().map(this::toDTO).toList();
        return PageResponse.of(items, total, validPage, validSize);
    }

    @Transactional(readOnly = true)
    public GameCardMetaDTO getCardById(String cardId) {
        GameCardEntity entity = gameCardMapper.selectByCardId(cardId);
        if (entity == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown card id: " + cardId);
        }
        return toDTO(entity);
    }

    @Transactional
    public String createCard(AdminCreateGameCardRequest request) {
        if (gameCardMapper.selectByCardId(request.getCardId()) != null) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Card already exists: " + request.getCardId());
        }
        GameCardEntity entity = new GameCardEntity();
        entity.setCardId(request.getCardId());
        entity.setCardNo(request.getCardNo());
        entity.setNameZh(request.getChineseName());
        entity.setNameEn(request.getEnglishName());
        entity.setCardType(request.getCardType());
        entity.setDomain(request.getDomain());
        entity.setStar(request.getStar());
        entity.setPhaseBucket(request.getPhaseBucket());
        entity.setUnlockCostIndustry(request.getUnlockCostIndustry());
        entity.setUnlockCostTech(request.getUnlockCostTech());
        entity.setUnlockCostPopulation(request.getUnlockCostPopulation());
        entity.setUnlockCostGreen(request.getUnlockCostGreen());
        entity.setImageKey(request.getImageKey());
        entity.setAdvancedImageKey(request.getAdvancedImageKey());
        entity.setPolicyImmediateIndustryDelta(defaultInt(request.getPolicyImmediateIndustryDelta()));
        entity.setPolicyImmediateTechDelta(defaultInt(request.getPolicyImmediateTechDelta()));
        entity.setPolicyImmediatePopulationDelta(defaultInt(request.getPolicyImmediatePopulationDelta()));
        entity.setPolicyImmediateGreenDelta(defaultInt(request.getPolicyImmediateGreenDelta()));
        entity.setPolicyImmediateCarbonDelta(defaultInt(request.getPolicyImmediateCarbonDelta()));
        entity.setPolicyImmediateSatisfactionDelta(defaultInt(request.getPolicyImmediateSatisfactionDelta()));
        entity.setPolicyImmediateQuotaDelta(defaultInt(request.getPolicyImmediateQuotaDelta()));
        entity.setPolicyImmediateGroup(defaultString(request.getPolicyImmediateGroup()));
        entity.setPolicyImmediateTurns(defaultInt(request.getPolicyImmediateTurns()));
        entity.setPolicyContinuousIndustryDelta(defaultInt(request.getPolicyContinuousIndustryDelta()));
        entity.setPolicyContinuousTechDelta(defaultInt(request.getPolicyContinuousTechDelta()));
        entity.setPolicyContinuousPopulationDelta(defaultInt(request.getPolicyContinuousPopulationDelta()));
        entity.setPolicyContinuousGreenDelta(defaultInt(request.getPolicyContinuousGreenDelta()));
        entity.setPolicyContinuousCarbonDelta(defaultInt(request.getPolicyContinuousCarbonDelta()));
        entity.setPolicyContinuousSatisfactionDelta(defaultInt(request.getPolicyContinuousSatisfactionDelta()));
        entity.setPolicyContinuousLowCarbonDelta(defaultInt(request.getPolicyContinuousLowCarbonDelta()));
        entity.setPolicyContinuousGreenPct(defaultInt(request.getPolicyContinuousGreenPct()));
        entity.setPolicyContinuousTechPct(defaultInt(request.getPolicyContinuousTechPct()));
        entity.setPolicyContinuousPopulationPct(defaultInt(request.getPolicyContinuousPopulationPct()));
        entity.setPolicyContinuousIndustryPct(defaultInt(request.getPolicyContinuousIndustryPct()));
        entity.setPolicyContinuousIndustryCarbonReductionPct(defaultInt(request.getPolicyContinuousIndustryCarbonReductionPct()));
        entity.setCoreDomainProgressBonus(defaultInt(request.getCoreDomainProgressBonus()));
        entity.setCoreContinuousIndustryDelta(defaultInt(request.getCoreContinuousIndustryDelta()));
        entity.setCoreContinuousTechDelta(defaultInt(request.getCoreContinuousTechDelta()));
        entity.setCoreContinuousPopulationDelta(defaultInt(request.getCoreContinuousPopulationDelta()));
        entity.setCoreContinuousGreenDelta(defaultInt(request.getCoreContinuousGreenDelta()));
        entity.setCoreContinuousCarbonDelta(defaultInt(request.getCoreContinuousCarbonDelta()));
        entity.setCoreContinuousSatisfactionDelta(defaultInt(request.getCoreContinuousSatisfactionDelta()));
        entity.setCoreContinuousQuotaDelta(defaultInt(request.getCoreContinuousQuotaDelta()));
        entity.setCoreContinuousLowCarbonDelta(defaultInt(request.getCoreContinuousLowCarbonDelta()));
        entity.setCoreContinuousIndustryPct(defaultInt(request.getCoreContinuousIndustryPct()));
        entity.setCoreContinuousTechPct(defaultInt(request.getCoreContinuousTechPct()));
        entity.setCoreContinuousPopulationPct(defaultInt(request.getCoreContinuousPopulationPct()));
        entity.setCoreContinuousGreenPct(defaultInt(request.getCoreContinuousGreenPct()));
        entity.setCoreContinuousGlobalPct(defaultInt(request.getCoreContinuousGlobalPct()));
        entity.setCoreContinuousLowCarbonPct(defaultInt(request.getCoreContinuousLowCarbonPct()));
        entity.setCoreContinuousIndustryCarbonReductionPct(defaultInt(request.getCoreContinuousIndustryCarbonReductionPct()));
        entity.setCoreContinuousCarbonDeltaReductionPct(defaultInt(request.getCoreContinuousCarbonDeltaReductionPct()));
        entity.setCoreContinuousTradePricePct(defaultInt(request.getCoreContinuousTradePricePct()));
        entity.setCoreContinuousComboPct(defaultInt(request.getCoreContinuousComboPct()));
        entity.setCoreConditionMinTurn(defaultInt(request.getCoreConditionMinTurn()));
        entity.setCoreConditionMinIndustryResource(defaultInt(request.getCoreConditionMinIndustryResource()));
        entity.setCoreConditionMinTechResource(defaultInt(request.getCoreConditionMinTechResource()));
        entity.setCoreConditionMaxCarbon(request.getCoreConditionMaxCarbon() == null ? Integer.MAX_VALUE : request.getCoreConditionMaxCarbon());
        entity.setCoreConditionMinIndustryCards(defaultInt(request.getCoreConditionMinIndustryCards()));
        entity.setCoreConditionMinIndustryProgressPct(defaultInt(request.getCoreConditionMinIndustryProgressPct()));
        entity.setCoreConditionMinTaggedCards(defaultInt(request.getCoreConditionMinTaggedCards()));
        entity.setCoreConditionRequiredTag(defaultString(request.getCoreConditionRequiredTag()));
        entity.setCoreSpecialEcologyCardCostReductionPct(defaultInt(request.getCoreSpecialEcologyCardCostReductionPct()));
        entity.setCoreSpecialScienceCardCostReductionPct(defaultInt(request.getCoreSpecialScienceCardCostReductionPct()));
        entity.setCoreSpecialFloodResistancePct(defaultInt(request.getCoreSpecialFloodResistancePct()));
        entity.setCoreSpecialNewEnergyIndustryPct(defaultInt(request.getCoreSpecialNewEnergyIndustryPct()));
        entity.setCoreSpecialEcologyCarbonSinkPerTenGreen(defaultInt(request.getCoreSpecialEcologyCarbonSinkPerTenGreen()));
        entity.setIsEnabled(request.getIsEnabled() == null || request.getIsEnabled());
        gameCardMapper.insert(entity);
        cardCatalogService.reloadFromDatabase();
        return entity.getCardId();
    }

    @Transactional
    public void updateCard(String cardId, AdminUpdateGameCardRequest request) {
        GameCardEntity entity = gameCardMapper.selectByCardId(cardId);
        if (entity == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown card id: " + cardId);
        }

        if (request.getCardNo() != null) entity.setCardNo(request.getCardNo());
        if (request.getChineseName() != null) entity.setNameZh(request.getChineseName());
        if (request.getEnglishName() != null) entity.setNameEn(request.getEnglishName());
        if (request.getCardType() != null) entity.setCardType(request.getCardType());
        if (request.getDomain() != null) entity.setDomain(request.getDomain());
        if (request.getStar() != null) entity.setStar(request.getStar());
        if (request.getPhaseBucket() != null) entity.setPhaseBucket(request.getPhaseBucket());
        if (request.getUnlockCostIndustry() != null) entity.setUnlockCostIndustry(request.getUnlockCostIndustry());
        if (request.getUnlockCostTech() != null) entity.setUnlockCostTech(request.getUnlockCostTech());
        if (request.getUnlockCostPopulation() != null) entity.setUnlockCostPopulation(request.getUnlockCostPopulation());
        if (request.getUnlockCostGreen() != null) entity.setUnlockCostGreen(request.getUnlockCostGreen());
        if (request.getImageKey() != null) entity.setImageKey(request.getImageKey());
        if (request.getAdvancedImageKey() != null) entity.setAdvancedImageKey(request.getAdvancedImageKey());
        if (request.getPolicyImmediateIndustryDelta() != null) entity.setPolicyImmediateIndustryDelta(request.getPolicyImmediateIndustryDelta());
        if (request.getPolicyImmediateTechDelta() != null) entity.setPolicyImmediateTechDelta(request.getPolicyImmediateTechDelta());
        if (request.getPolicyImmediatePopulationDelta() != null) entity.setPolicyImmediatePopulationDelta(request.getPolicyImmediatePopulationDelta());
        if (request.getPolicyImmediateGreenDelta() != null) entity.setPolicyImmediateGreenDelta(request.getPolicyImmediateGreenDelta());
        if (request.getPolicyImmediateCarbonDelta() != null) entity.setPolicyImmediateCarbonDelta(request.getPolicyImmediateCarbonDelta());
        if (request.getPolicyImmediateSatisfactionDelta() != null) entity.setPolicyImmediateSatisfactionDelta(request.getPolicyImmediateSatisfactionDelta());
        if (request.getPolicyImmediateQuotaDelta() != null) entity.setPolicyImmediateQuotaDelta(request.getPolicyImmediateQuotaDelta());
        if (request.getPolicyImmediateGroup() != null) entity.setPolicyImmediateGroup(request.getPolicyImmediateGroup());
        if (request.getPolicyImmediateTurns() != null) entity.setPolicyImmediateTurns(request.getPolicyImmediateTurns());
        if (request.getPolicyContinuousIndustryDelta() != null) entity.setPolicyContinuousIndustryDelta(request.getPolicyContinuousIndustryDelta());
        if (request.getPolicyContinuousTechDelta() != null) entity.setPolicyContinuousTechDelta(request.getPolicyContinuousTechDelta());
        if (request.getPolicyContinuousPopulationDelta() != null) entity.setPolicyContinuousPopulationDelta(request.getPolicyContinuousPopulationDelta());
        if (request.getPolicyContinuousGreenDelta() != null) entity.setPolicyContinuousGreenDelta(request.getPolicyContinuousGreenDelta());
        if (request.getPolicyContinuousCarbonDelta() != null) entity.setPolicyContinuousCarbonDelta(request.getPolicyContinuousCarbonDelta());
        if (request.getPolicyContinuousSatisfactionDelta() != null) entity.setPolicyContinuousSatisfactionDelta(request.getPolicyContinuousSatisfactionDelta());
        if (request.getPolicyContinuousLowCarbonDelta() != null) entity.setPolicyContinuousLowCarbonDelta(request.getPolicyContinuousLowCarbonDelta());
        if (request.getPolicyContinuousGreenPct() != null) entity.setPolicyContinuousGreenPct(request.getPolicyContinuousGreenPct());
        if (request.getPolicyContinuousTechPct() != null) entity.setPolicyContinuousTechPct(request.getPolicyContinuousTechPct());
        if (request.getPolicyContinuousPopulationPct() != null) entity.setPolicyContinuousPopulationPct(request.getPolicyContinuousPopulationPct());
        if (request.getPolicyContinuousIndustryPct() != null) entity.setPolicyContinuousIndustryPct(request.getPolicyContinuousIndustryPct());
        if (request.getPolicyContinuousIndustryCarbonReductionPct() != null) {
            entity.setPolicyContinuousIndustryCarbonReductionPct(request.getPolicyContinuousIndustryCarbonReductionPct());
        }
        if (request.getCoreDomainProgressBonus() != null) entity.setCoreDomainProgressBonus(request.getCoreDomainProgressBonus());
        if (request.getCoreContinuousIndustryDelta() != null) entity.setCoreContinuousIndustryDelta(request.getCoreContinuousIndustryDelta());
        if (request.getCoreContinuousTechDelta() != null) entity.setCoreContinuousTechDelta(request.getCoreContinuousTechDelta());
        if (request.getCoreContinuousPopulationDelta() != null) entity.setCoreContinuousPopulationDelta(request.getCoreContinuousPopulationDelta());
        if (request.getCoreContinuousGreenDelta() != null) entity.setCoreContinuousGreenDelta(request.getCoreContinuousGreenDelta());
        if (request.getCoreContinuousCarbonDelta() != null) entity.setCoreContinuousCarbonDelta(request.getCoreContinuousCarbonDelta());
        if (request.getCoreContinuousSatisfactionDelta() != null) {
            entity.setCoreContinuousSatisfactionDelta(request.getCoreContinuousSatisfactionDelta());
        }
        if (request.getCoreContinuousQuotaDelta() != null) entity.setCoreContinuousQuotaDelta(request.getCoreContinuousQuotaDelta());
        if (request.getCoreContinuousLowCarbonDelta() != null) {
            entity.setCoreContinuousLowCarbonDelta(request.getCoreContinuousLowCarbonDelta());
        }
        if (request.getCoreContinuousIndustryPct() != null) entity.setCoreContinuousIndustryPct(request.getCoreContinuousIndustryPct());
        if (request.getCoreContinuousTechPct() != null) entity.setCoreContinuousTechPct(request.getCoreContinuousTechPct());
        if (request.getCoreContinuousPopulationPct() != null) {
            entity.setCoreContinuousPopulationPct(request.getCoreContinuousPopulationPct());
        }
        if (request.getCoreContinuousGreenPct() != null) entity.setCoreContinuousGreenPct(request.getCoreContinuousGreenPct());
        if (request.getCoreContinuousGlobalPct() != null) entity.setCoreContinuousGlobalPct(request.getCoreContinuousGlobalPct());
        if (request.getCoreContinuousLowCarbonPct() != null) {
            entity.setCoreContinuousLowCarbonPct(request.getCoreContinuousLowCarbonPct());
        }
        if (request.getCoreContinuousIndustryCarbonReductionPct() != null) {
            entity.setCoreContinuousIndustryCarbonReductionPct(request.getCoreContinuousIndustryCarbonReductionPct());
        }
        if (request.getCoreContinuousCarbonDeltaReductionPct() != null) {
            entity.setCoreContinuousCarbonDeltaReductionPct(request.getCoreContinuousCarbonDeltaReductionPct());
        }
        if (request.getCoreContinuousTradePricePct() != null) {
            entity.setCoreContinuousTradePricePct(request.getCoreContinuousTradePricePct());
        }
        if (request.getCoreContinuousComboPct() != null) entity.setCoreContinuousComboPct(request.getCoreContinuousComboPct());
        if (request.getCoreConditionMinTurn() != null) entity.setCoreConditionMinTurn(request.getCoreConditionMinTurn());
        if (request.getCoreConditionMinIndustryResource() != null) {
            entity.setCoreConditionMinIndustryResource(request.getCoreConditionMinIndustryResource());
        }
        if (request.getCoreConditionMinTechResource() != null) entity.setCoreConditionMinTechResource(request.getCoreConditionMinTechResource());
        if (request.getCoreConditionMaxCarbon() != null) entity.setCoreConditionMaxCarbon(request.getCoreConditionMaxCarbon());
        if (request.getCoreConditionMinIndustryCards() != null) entity.setCoreConditionMinIndustryCards(request.getCoreConditionMinIndustryCards());
        if (request.getCoreConditionMinIndustryProgressPct() != null) {
            entity.setCoreConditionMinIndustryProgressPct(request.getCoreConditionMinIndustryProgressPct());
        }
        if (request.getCoreConditionMinTaggedCards() != null) entity.setCoreConditionMinTaggedCards(request.getCoreConditionMinTaggedCards());
        if (request.getCoreConditionRequiredTag() != null) entity.setCoreConditionRequiredTag(request.getCoreConditionRequiredTag());
        if (request.getCoreSpecialEcologyCardCostReductionPct() != null) {
            entity.setCoreSpecialEcologyCardCostReductionPct(request.getCoreSpecialEcologyCardCostReductionPct());
        }
        if (request.getCoreSpecialScienceCardCostReductionPct() != null) {
            entity.setCoreSpecialScienceCardCostReductionPct(request.getCoreSpecialScienceCardCostReductionPct());
        }
        if (request.getCoreSpecialFloodResistancePct() != null) {
            entity.setCoreSpecialFloodResistancePct(request.getCoreSpecialFloodResistancePct());
        }
        if (request.getCoreSpecialNewEnergyIndustryPct() != null) {
            entity.setCoreSpecialNewEnergyIndustryPct(request.getCoreSpecialNewEnergyIndustryPct());
        }
        if (request.getCoreSpecialEcologyCarbonSinkPerTenGreen() != null) {
            entity.setCoreSpecialEcologyCarbonSinkPerTenGreen(request.getCoreSpecialEcologyCarbonSinkPerTenGreen());
        }
        if (request.getIsEnabled() != null) entity.setIsEnabled(request.getIsEnabled());

        gameCardMapper.update(entity);
        cardCatalogService.reloadFromDatabase();
    }

    @Transactional
    public void deleteCard(String cardId) {
        if (gameCardMapper.selectByCardId(cardId) == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown card id: " + cardId);
        }
        gameCardMapper.deleteByCardId(cardId);
        cardCatalogService.reloadFromDatabase();
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
                    .industry(defaultInt(entity.getUnlockCostIndustry()))
                    .tech(defaultInt(entity.getUnlockCostTech()))
                    .population(defaultInt(entity.getUnlockCostPopulation()))
                    .green(defaultInt(entity.getUnlockCostGreen()))
                    .build()
            )
            .imageKey(entity.getImageKey())
            .advancedImageKey(entity.getAdvancedImageKey())
            .policyImmediateIndustryDelta(defaultInt(entity.getPolicyImmediateIndustryDelta()))
            .policyImmediateTechDelta(defaultInt(entity.getPolicyImmediateTechDelta()))
            .policyImmediatePopulationDelta(defaultInt(entity.getPolicyImmediatePopulationDelta()))
            .policyImmediateGreenDelta(defaultInt(entity.getPolicyImmediateGreenDelta()))
            .policyImmediateCarbonDelta(defaultInt(entity.getPolicyImmediateCarbonDelta()))
            .policyImmediateSatisfactionDelta(defaultInt(entity.getPolicyImmediateSatisfactionDelta()))
            .policyImmediateQuotaDelta(defaultInt(entity.getPolicyImmediateQuotaDelta()))
            .policyImmediateGroup(defaultString(entity.getPolicyImmediateGroup()))
            .policyImmediateTurns(defaultInt(entity.getPolicyImmediateTurns()))
            .policyContinuousIndustryDelta(defaultInt(entity.getPolicyContinuousIndustryDelta()))
            .policyContinuousTechDelta(defaultInt(entity.getPolicyContinuousTechDelta()))
            .policyContinuousPopulationDelta(defaultInt(entity.getPolicyContinuousPopulationDelta()))
            .policyContinuousGreenDelta(defaultInt(entity.getPolicyContinuousGreenDelta()))
            .policyContinuousCarbonDelta(defaultInt(entity.getPolicyContinuousCarbonDelta()))
            .policyContinuousSatisfactionDelta(defaultInt(entity.getPolicyContinuousSatisfactionDelta()))
            .policyContinuousLowCarbonDelta(defaultInt(entity.getPolicyContinuousLowCarbonDelta()))
            .policyContinuousGreenPct(defaultInt(entity.getPolicyContinuousGreenPct()))
            .policyContinuousTechPct(defaultInt(entity.getPolicyContinuousTechPct()))
            .policyContinuousPopulationPct(defaultInt(entity.getPolicyContinuousPopulationPct()))
            .policyContinuousIndustryPct(defaultInt(entity.getPolicyContinuousIndustryPct()))
            .policyContinuousIndustryCarbonReductionPct(defaultInt(entity.getPolicyContinuousIndustryCarbonReductionPct()))
            .coreDomainProgressBonus(defaultInt(entity.getCoreDomainProgressBonus()))
            .coreContinuousIndustryDelta(defaultInt(entity.getCoreContinuousIndustryDelta()))
            .coreContinuousTechDelta(defaultInt(entity.getCoreContinuousTechDelta()))
            .coreContinuousPopulationDelta(defaultInt(entity.getCoreContinuousPopulationDelta()))
            .coreContinuousGreenDelta(defaultInt(entity.getCoreContinuousGreenDelta()))
            .coreContinuousCarbonDelta(defaultInt(entity.getCoreContinuousCarbonDelta()))
            .coreContinuousSatisfactionDelta(defaultInt(entity.getCoreContinuousSatisfactionDelta()))
            .coreContinuousQuotaDelta(defaultInt(entity.getCoreContinuousQuotaDelta()))
            .coreContinuousLowCarbonDelta(defaultInt(entity.getCoreContinuousLowCarbonDelta()))
            .coreContinuousIndustryPct(defaultInt(entity.getCoreContinuousIndustryPct()))
            .coreContinuousTechPct(defaultInt(entity.getCoreContinuousTechPct()))
            .coreContinuousPopulationPct(defaultInt(entity.getCoreContinuousPopulationPct()))
            .coreContinuousGreenPct(defaultInt(entity.getCoreContinuousGreenPct()))
            .coreContinuousGlobalPct(defaultInt(entity.getCoreContinuousGlobalPct()))
            .coreContinuousLowCarbonPct(defaultInt(entity.getCoreContinuousLowCarbonPct()))
            .coreContinuousIndustryCarbonReductionPct(defaultInt(entity.getCoreContinuousIndustryCarbonReductionPct()))
            .coreContinuousCarbonDeltaReductionPct(defaultInt(entity.getCoreContinuousCarbonDeltaReductionPct()))
            .coreContinuousTradePricePct(defaultInt(entity.getCoreContinuousTradePricePct()))
            .coreContinuousComboPct(defaultInt(entity.getCoreContinuousComboPct()))
            .coreConditionMinTurn(defaultInt(entity.getCoreConditionMinTurn()))
            .coreConditionMinIndustryResource(defaultInt(entity.getCoreConditionMinIndustryResource()))
            .coreConditionMinTechResource(defaultInt(entity.getCoreConditionMinTechResource()))
            .coreConditionMaxCarbon(entity.getCoreConditionMaxCarbon() == null ? Integer.MAX_VALUE : entity.getCoreConditionMaxCarbon())
            .coreConditionMinIndustryCards(defaultInt(entity.getCoreConditionMinIndustryCards()))
            .coreConditionMinIndustryProgressPct(defaultInt(entity.getCoreConditionMinIndustryProgressPct()))
            .coreConditionMinTaggedCards(defaultInt(entity.getCoreConditionMinTaggedCards()))
            .coreConditionRequiredTag(defaultString(entity.getCoreConditionRequiredTag()))
            .coreSpecialEcologyCardCostReductionPct(defaultInt(entity.getCoreSpecialEcologyCardCostReductionPct()))
            .coreSpecialScienceCardCostReductionPct(defaultInt(entity.getCoreSpecialScienceCardCostReductionPct()))
            .coreSpecialFloodResistancePct(defaultInt(entity.getCoreSpecialFloodResistancePct()))
            .coreSpecialNewEnergyIndustryPct(defaultInt(entity.getCoreSpecialNewEnergyIndustryPct()))
            .coreSpecialEcologyCarbonSinkPerTenGreen(defaultInt(entity.getCoreSpecialEcologyCarbonSinkPerTenGreen()))
            .build();
    }

    private Integer defaultInt(Integer value) {
        return Objects.requireNonNullElse(value, 0);
    }

    private String defaultString(String value) {
        return Objects.requireNonNullElse(value, "");
    }
}
