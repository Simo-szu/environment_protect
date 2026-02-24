package com.youthloop.game.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.game.api.dto.AdminCreateGameCardRequest;
import com.youthloop.game.api.dto.AdminUpdateGameCardRequest;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.persistence.entity.GameCardEntity;
import com.youthloop.game.persistence.entity.GameCardUpgradeRequirementEntity;
import com.youthloop.game.persistence.mapper.GameCardMapper;
import com.youthloop.game.persistence.mapper.GameCardUpgradeRequirementMapper;
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
    private final GameCardUpgradeRequirementMapper gameCardUpgradeRequirementMapper;
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
        entity.setCoreConditionMinGreen(defaultInt(request.getCoreConditionMinGreen()));
        entity.setCoreConditionMinSocietyProgressPct(defaultInt(request.getCoreConditionMinSocietyProgressPct()));
        entity.setCoreConditionMinTaggedCards(defaultInt(request.getCoreConditionMinTaggedCards()));
        entity.setCoreConditionRequiredTag(defaultString(request.getCoreConditionRequiredTag()));
        entity.setCoreSpecialEcologyCardCostReductionPct(defaultInt(request.getCoreSpecialEcologyCardCostReductionPct()));
        entity.setCoreSpecialScienceCardCostReductionPct(defaultInt(request.getCoreSpecialScienceCardCostReductionPct()));
        entity.setCoreSpecialFloodResistancePct(defaultInt(request.getCoreSpecialFloodResistancePct()));
        entity.setCoreSpecialNewEnergyIndustryPct(defaultInt(request.getCoreSpecialNewEnergyIndustryPct()));
        entity.setCoreSpecialEcologyCarbonSinkPerTenGreen(defaultInt(request.getCoreSpecialEcologyCarbonSinkPerTenGreen()));
        entity.setUpgradeDeltaIndustry(defaultInt(request.getUpgradeDeltaIndustry()));
        entity.setUpgradeDeltaTech(defaultInt(request.getUpgradeDeltaTech()));
        entity.setUpgradeDeltaPopulation(defaultInt(request.getUpgradeDeltaPopulation()));
        entity.setUpgradeDeltaGreen(defaultInt(request.getUpgradeDeltaGreen()));
        entity.setUpgradeDeltaCarbon(defaultInt(request.getUpgradeDeltaCarbon()));
        entity.setUpgradeDeltaSatisfaction(defaultInt(request.getUpgradeDeltaSatisfaction()));
        entity.setUpgradeDeltaQuota(defaultInt(request.getUpgradeDeltaQuota()));
        entity.setUpgradeDeltaLowCarbon(defaultInt(request.getUpgradeDeltaLowCarbon()));
        entity.setUpgradeDeltaSectorProgressPct(defaultInt(request.getUpgradeDeltaSectorProgressPct()));
        entity.setUpgradeDeltaIndustryPct(defaultInt(request.getUpgradeDeltaIndustryPct()));
        entity.setUpgradeDeltaGreenPct(defaultInt(request.getUpgradeDeltaGreenPct()));
        entity.setUpgradeDeltaGlobalPct(defaultInt(request.getUpgradeDeltaGlobalPct()));
        entity.setUpgradeDeltaTechPct(defaultInt(request.getUpgradeDeltaTechPct()));
        entity.setUpgradeDeltaIndustryCarbonReductionPct(defaultInt(request.getUpgradeDeltaIndustryCarbonReductionPct()));
        entity.setUpgradeDeltaCarbonDeltaReductionPct(defaultInt(request.getUpgradeDeltaCarbonDeltaReductionPct()));
        entity.setUpgradeDeltaTradePricePct(defaultInt(request.getUpgradeDeltaTradePricePct()));
        entity.setUpgradeDeltaComboPct(defaultInt(request.getUpgradeDeltaComboPct()));
        entity.setUpgradeDeltaSharedMobilityPct(defaultInt(request.getUpgradeDeltaSharedMobilityPct()));
        entity.setUpgradeDeltaEcologyCardCostPct(defaultInt(request.getUpgradeDeltaEcologyCardCostPct()));
        entity.setUpgradeDeltaScienceCardCostPct(defaultInt(request.getUpgradeDeltaScienceCardCostPct()));
        entity.setUpgradeDeltaFloodResistancePct(defaultInt(request.getUpgradeDeltaFloodResistancePct()));
        entity.setUpgradeDeltaNewEnergyPct(defaultInt(request.getUpgradeDeltaNewEnergyPct()));
        entity.setUpgradeDeltaEcologySink(defaultInt(request.getUpgradeDeltaEcologySink()));
        entity.setUpgradeDeltaTradUpgradePct(defaultInt(request.getUpgradeDeltaTradUpgradePct()));
        entity.setUpgradeDeltaUpgradeCostPct(defaultInt(request.getUpgradeDeltaUpgradeCostPct()));
        entity.setIsEnabled(request.getIsEnabled() == null || request.getIsEnabled());
        gameCardMapper.insert(entity);
        upsertUpgradeRequirementOnCreate(request, entity);
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
        if (request.getCoreConditionMinGreen() != null) entity.setCoreConditionMinGreen(request.getCoreConditionMinGreen());
        if (request.getCoreConditionMinSocietyProgressPct() != null) {
            entity.setCoreConditionMinSocietyProgressPct(request.getCoreConditionMinSocietyProgressPct());
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
        if (request.getUpgradeDeltaIndustry() != null) entity.setUpgradeDeltaIndustry(request.getUpgradeDeltaIndustry());
        if (request.getUpgradeDeltaTech() != null) entity.setUpgradeDeltaTech(request.getUpgradeDeltaTech());
        if (request.getUpgradeDeltaPopulation() != null) entity.setUpgradeDeltaPopulation(request.getUpgradeDeltaPopulation());
        if (request.getUpgradeDeltaGreen() != null) entity.setUpgradeDeltaGreen(request.getUpgradeDeltaGreen());
        if (request.getUpgradeDeltaCarbon() != null) entity.setUpgradeDeltaCarbon(request.getUpgradeDeltaCarbon());
        if (request.getUpgradeDeltaSatisfaction() != null) entity.setUpgradeDeltaSatisfaction(request.getUpgradeDeltaSatisfaction());
        if (request.getUpgradeDeltaQuota() != null) entity.setUpgradeDeltaQuota(request.getUpgradeDeltaQuota());
        if (request.getUpgradeDeltaLowCarbon() != null) entity.setUpgradeDeltaLowCarbon(request.getUpgradeDeltaLowCarbon());
        if (request.getUpgradeDeltaSectorProgressPct() != null) {
            entity.setUpgradeDeltaSectorProgressPct(request.getUpgradeDeltaSectorProgressPct());
        }
        if (request.getUpgradeDeltaIndustryPct() != null) entity.setUpgradeDeltaIndustryPct(request.getUpgradeDeltaIndustryPct());
        if (request.getUpgradeDeltaGreenPct() != null) entity.setUpgradeDeltaGreenPct(request.getUpgradeDeltaGreenPct());
        if (request.getUpgradeDeltaGlobalPct() != null) entity.setUpgradeDeltaGlobalPct(request.getUpgradeDeltaGlobalPct());
        if (request.getUpgradeDeltaTechPct() != null) entity.setUpgradeDeltaTechPct(request.getUpgradeDeltaTechPct());
        if (request.getUpgradeDeltaIndustryCarbonReductionPct() != null) {
            entity.setUpgradeDeltaIndustryCarbonReductionPct(request.getUpgradeDeltaIndustryCarbonReductionPct());
        }
        if (request.getUpgradeDeltaCarbonDeltaReductionPct() != null) {
            entity.setUpgradeDeltaCarbonDeltaReductionPct(request.getUpgradeDeltaCarbonDeltaReductionPct());
        }
        if (request.getUpgradeDeltaTradePricePct() != null) entity.setUpgradeDeltaTradePricePct(request.getUpgradeDeltaTradePricePct());
        if (request.getUpgradeDeltaComboPct() != null) entity.setUpgradeDeltaComboPct(request.getUpgradeDeltaComboPct());
        if (request.getUpgradeDeltaSharedMobilityPct() != null) {
            entity.setUpgradeDeltaSharedMobilityPct(request.getUpgradeDeltaSharedMobilityPct());
        }
        if (request.getUpgradeDeltaEcologyCardCostPct() != null) {
            entity.setUpgradeDeltaEcologyCardCostPct(request.getUpgradeDeltaEcologyCardCostPct());
        }
        if (request.getUpgradeDeltaScienceCardCostPct() != null) {
            entity.setUpgradeDeltaScienceCardCostPct(request.getUpgradeDeltaScienceCardCostPct());
        }
        if (request.getUpgradeDeltaFloodResistancePct() != null) {
            entity.setUpgradeDeltaFloodResistancePct(request.getUpgradeDeltaFloodResistancePct());
        }
        if (request.getUpgradeDeltaNewEnergyPct() != null) entity.setUpgradeDeltaNewEnergyPct(request.getUpgradeDeltaNewEnergyPct());
        if (request.getUpgradeDeltaEcologySink() != null) entity.setUpgradeDeltaEcologySink(request.getUpgradeDeltaEcologySink());
        if (request.getUpgradeDeltaTradUpgradePct() != null) {
            entity.setUpgradeDeltaTradUpgradePct(request.getUpgradeDeltaTradUpgradePct());
        }
        if (request.getUpgradeDeltaUpgradeCostPct() != null) {
            entity.setUpgradeDeltaUpgradeCostPct(request.getUpgradeDeltaUpgradeCostPct());
        }
        if (request.getIsEnabled() != null) entity.setIsEnabled(request.getIsEnabled());

        gameCardMapper.update(entity);
        upsertUpgradeRequirementOnUpdate(request, entity);
        cardCatalogService.reloadFromDatabase();
    }

    @Transactional
    public void deleteCard(String cardId) {
        if (gameCardMapper.selectByCardId(cardId) == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown card id: " + cardId);
        }
        gameCardUpgradeRequirementMapper.deleteByCardId(cardId);
        gameCardMapper.deleteByCardId(cardId);
        cardCatalogService.reloadFromDatabase();
    }

    private GameCardMetaDTO toDTO(GameCardEntity entity) {
        GameCardUpgradeRequirementEntity requirement = gameCardUpgradeRequirementMapper.selectEnabledByCardId(entity.getCardId());
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
            .coreConditionMinGreen(defaultInt(entity.getCoreConditionMinGreen()))
            .coreConditionMinSocietyProgressPct(defaultInt(entity.getCoreConditionMinSocietyProgressPct()))
            .coreConditionMinTaggedCards(defaultInt(entity.getCoreConditionMinTaggedCards()))
            .coreConditionRequiredTag(defaultString(entity.getCoreConditionRequiredTag()))
            .coreSpecialEcologyCardCostReductionPct(defaultInt(entity.getCoreSpecialEcologyCardCostReductionPct()))
            .coreSpecialScienceCardCostReductionPct(defaultInt(entity.getCoreSpecialScienceCardCostReductionPct()))
            .coreSpecialFloodResistancePct(defaultInt(entity.getCoreSpecialFloodResistancePct()))
            .coreSpecialNewEnergyIndustryPct(defaultInt(entity.getCoreSpecialNewEnergyIndustryPct()))
            .coreSpecialEcologyCarbonSinkPerTenGreen(defaultInt(entity.getCoreSpecialEcologyCarbonSinkPerTenGreen()))
            .upgradeDeltaIndustry(defaultInt(entity.getUpgradeDeltaIndustry()))
            .upgradeDeltaTech(defaultInt(entity.getUpgradeDeltaTech()))
            .upgradeDeltaPopulation(defaultInt(entity.getUpgradeDeltaPopulation()))
            .upgradeDeltaGreen(defaultInt(entity.getUpgradeDeltaGreen()))
            .upgradeDeltaCarbon(defaultInt(entity.getUpgradeDeltaCarbon()))
            .upgradeDeltaSatisfaction(defaultInt(entity.getUpgradeDeltaSatisfaction()))
            .upgradeDeltaQuota(defaultInt(entity.getUpgradeDeltaQuota()))
            .upgradeDeltaLowCarbon(defaultInt(entity.getUpgradeDeltaLowCarbon()))
            .upgradeDeltaSectorProgressPct(defaultInt(entity.getUpgradeDeltaSectorProgressPct()))
            .upgradeDeltaIndustryPct(defaultInt(entity.getUpgradeDeltaIndustryPct()))
            .upgradeDeltaGreenPct(defaultInt(entity.getUpgradeDeltaGreenPct()))
            .upgradeDeltaGlobalPct(defaultInt(entity.getUpgradeDeltaGlobalPct()))
            .upgradeDeltaTechPct(defaultInt(entity.getUpgradeDeltaTechPct()))
            .upgradeDeltaIndustryCarbonReductionPct(defaultInt(entity.getUpgradeDeltaIndustryCarbonReductionPct()))
            .upgradeDeltaCarbonDeltaReductionPct(defaultInt(entity.getUpgradeDeltaCarbonDeltaReductionPct()))
            .upgradeDeltaTradePricePct(defaultInt(entity.getUpgradeDeltaTradePricePct()))
            .upgradeDeltaComboPct(defaultInt(entity.getUpgradeDeltaComboPct()))
            .upgradeDeltaSharedMobilityPct(defaultInt(entity.getUpgradeDeltaSharedMobilityPct()))
            .upgradeDeltaEcologyCardCostPct(defaultInt(entity.getUpgradeDeltaEcologyCardCostPct()))
            .upgradeDeltaScienceCardCostPct(defaultInt(entity.getUpgradeDeltaScienceCardCostPct()))
            .upgradeDeltaFloodResistancePct(defaultInt(entity.getUpgradeDeltaFloodResistancePct()))
            .upgradeDeltaNewEnergyPct(defaultInt(entity.getUpgradeDeltaNewEnergyPct()))
            .upgradeDeltaEcologySink(defaultInt(entity.getUpgradeDeltaEcologySink()))
            .upgradeDeltaTradUpgradePct(defaultInt(entity.getUpgradeDeltaTradUpgradePct()))
            .upgradeDeltaUpgradeCostPct(defaultInt(entity.getUpgradeDeltaUpgradeCostPct()))
            .upgradeEffect(entity.getUpgradeEffect())
            .upgradeRequirement(
                requirement == null ? null : GameCardMetaDTO.UpgradeRequirement.builder()
                    .fromStar(defaultInt(requirement.getFromStar()))
                    .toStar(defaultInt(requirement.getToStar()))
                    .reqDomain1(defaultString(requirement.getReqDomain1()))
                    .reqDomain1MinPct(defaultInt(requirement.getReqDomain1MinPct()))
                    .reqDomain2(defaultString(requirement.getReqDomain2()))
                    .reqDomain2MinPct(defaultInt(requirement.getReqDomain2MinPct()))
                    .costIndustry(defaultInt(requirement.getCostIndustry()))
                    .costTech(defaultInt(requirement.getCostTech()))
                    .costPopulation(defaultInt(requirement.getCostPopulation()))
                    .costGreen(defaultInt(requirement.getCostGreen()))
                    .configSnapshot(requirement.getConfigSnapshot())
                    .build()
            )
            .build();
    }

    private Integer defaultInt(Integer value) {
        return Objects.requireNonNullElse(value, 0);
    }

    private String defaultString(String value) {
        return Objects.requireNonNullElse(value, "");
    }

    private void upsertUpgradeRequirementOnCreate(AdminCreateGameCardRequest request, GameCardEntity entity) {
        if (!hasUpgradeRequirementInput(request)) {
            return;
        }
        int fromStar = request.getUpgradeReqFromStar() != null ? request.getUpgradeReqFromStar() : Math.max(1, defaultInt(entity.getStar()));
        int toStar = request.getUpgradeReqToStar() != null ? request.getUpgradeReqToStar() : fromStar + 1;
        if (toStar <= fromStar) {
            toStar = fromStar + 1;
        }
        GameCardUpgradeRequirementEntity requirement = new GameCardUpgradeRequirementEntity();
        requirement.setCardId(entity.getCardId());
        requirement.setFromStar(fromStar);
        requirement.setToStar(toStar);
        requirement.setReqDomain1(normalizeDomain(request.getUpgradeReqDomain1()));
        requirement.setReqDomain1MinPct(defaultInt(request.getUpgradeReqDomain1MinPct()));
        requirement.setReqDomain2(normalizeDomain(request.getUpgradeReqDomain2()));
        requirement.setReqDomain2MinPct(defaultInt(request.getUpgradeReqDomain2MinPct()));
        requirement.setCostIndustry(defaultInt(request.getUpgradeReqCostIndustry()));
        requirement.setCostTech(defaultInt(request.getUpgradeReqCostTech()));
        requirement.setCostPopulation(defaultInt(request.getUpgradeReqCostPopulation()));
        requirement.setCostGreen(defaultInt(request.getUpgradeReqCostGreen()));
        requirement.setConfigSnapshot(defaultJson(request.getUpgradeReqConfigSnapshot()));
        requirement.setIsEnabled(request.getUpgradeReqEnabled() == null || request.getUpgradeReqEnabled());
        gameCardUpgradeRequirementMapper.upsert(requirement);
    }

    private void upsertUpgradeRequirementOnUpdate(AdminUpdateGameCardRequest request, GameCardEntity entity) {
        if (!hasUpgradeRequirementInput(request)) {
            return;
        }
        GameCardUpgradeRequirementEntity existing = gameCardUpgradeRequirementMapper.selectEnabledByCardId(entity.getCardId());
        int fromStar = request.getUpgradeReqFromStar() != null
            ? request.getUpgradeReqFromStar()
            : (existing != null ? defaultInt(existing.getFromStar()) : Math.max(1, defaultInt(entity.getStar())));
        int toStar = request.getUpgradeReqToStar() != null
            ? request.getUpgradeReqToStar()
            : (existing != null ? defaultInt(existing.getToStar()) : fromStar + 1);
        if (toStar <= fromStar) {
            toStar = fromStar + 1;
        }
        GameCardUpgradeRequirementEntity requirement = new GameCardUpgradeRequirementEntity();
        requirement.setCardId(entity.getCardId());
        requirement.setFromStar(fromStar);
        requirement.setToStar(toStar);
        requirement.setReqDomain1(request.getUpgradeReqDomain1() != null
            ? normalizeDomain(request.getUpgradeReqDomain1())
            : (existing != null ? normalizeDomain(existing.getReqDomain1()) : null));
        requirement.setReqDomain1MinPct(request.getUpgradeReqDomain1MinPct() != null
            ? request.getUpgradeReqDomain1MinPct()
            : (existing != null ? defaultInt(existing.getReqDomain1MinPct()) : 0));
        requirement.setReqDomain2(request.getUpgradeReqDomain2() != null
            ? normalizeDomain(request.getUpgradeReqDomain2())
            : (existing != null ? normalizeDomain(existing.getReqDomain2()) : null));
        requirement.setReqDomain2MinPct(request.getUpgradeReqDomain2MinPct() != null
            ? request.getUpgradeReqDomain2MinPct()
            : (existing != null ? defaultInt(existing.getReqDomain2MinPct()) : 0));
        requirement.setCostIndustry(request.getUpgradeReqCostIndustry() != null
            ? request.getUpgradeReqCostIndustry()
            : (existing != null ? defaultInt(existing.getCostIndustry()) : 0));
        requirement.setCostTech(request.getUpgradeReqCostTech() != null
            ? request.getUpgradeReqCostTech()
            : (existing != null ? defaultInt(existing.getCostTech()) : 0));
        requirement.setCostPopulation(request.getUpgradeReqCostPopulation() != null
            ? request.getUpgradeReqCostPopulation()
            : (existing != null ? defaultInt(existing.getCostPopulation()) : 0));
        requirement.setCostGreen(request.getUpgradeReqCostGreen() != null
            ? request.getUpgradeReqCostGreen()
            : (existing != null ? defaultInt(existing.getCostGreen()) : 0));
        requirement.setConfigSnapshot(request.getUpgradeReqConfigSnapshot() != null
            ? request.getUpgradeReqConfigSnapshot()
            : defaultJson(existing != null ? existing.getConfigSnapshot() : null));
        requirement.setIsEnabled(request.getUpgradeReqEnabled() != null
            ? request.getUpgradeReqEnabled()
            : (existing == null || Boolean.TRUE.equals(existing.getIsEnabled())));
        gameCardUpgradeRequirementMapper.upsert(requirement);
    }

    private boolean hasUpgradeRequirementInput(AdminCreateGameCardRequest request) {
        return request.getUpgradeReqFromStar() != null
            || request.getUpgradeReqToStar() != null
            || request.getUpgradeReqDomain1() != null
            || request.getUpgradeReqDomain1MinPct() != null
            || request.getUpgradeReqDomain2() != null
            || request.getUpgradeReqDomain2MinPct() != null
            || request.getUpgradeReqCostIndustry() != null
            || request.getUpgradeReqCostTech() != null
            || request.getUpgradeReqCostPopulation() != null
            || request.getUpgradeReqCostGreen() != null
            || request.getUpgradeReqConfigSnapshot() != null
            || request.getUpgradeReqEnabled() != null;
    }

    private boolean hasUpgradeRequirementInput(AdminUpdateGameCardRequest request) {
        return request.getUpgradeReqFromStar() != null
            || request.getUpgradeReqToStar() != null
            || request.getUpgradeReqDomain1() != null
            || request.getUpgradeReqDomain1MinPct() != null
            || request.getUpgradeReqDomain2() != null
            || request.getUpgradeReqDomain2MinPct() != null
            || request.getUpgradeReqCostIndustry() != null
            || request.getUpgradeReqCostTech() != null
            || request.getUpgradeReqCostPopulation() != null
            || request.getUpgradeReqCostGreen() != null
            || request.getUpgradeReqConfigSnapshot() != null
            || request.getUpgradeReqEnabled() != null;
    }

    private String normalizeDomain(String domain) {
        if (domain == null) {
            return null;
        }
        String normalized = domain.trim().toLowerCase();
        return normalized.isEmpty() ? null : normalized;
    }

    private JsonNode defaultJson(JsonNode node) {
        return node == null ? JsonNodeFactory.instance.objectNode() : node;
    }
}
