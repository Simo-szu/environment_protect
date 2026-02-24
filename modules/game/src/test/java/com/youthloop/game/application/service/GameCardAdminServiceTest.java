package com.youthloop.game.application.service;

import com.youthloop.game.api.dto.AdminCreateGameCardRequest;
import com.youthloop.game.api.dto.AdminUpdateGameCardRequest;
import com.youthloop.game.persistence.entity.GameCardEntity;
import com.youthloop.game.persistence.entity.GameCardUpgradeRequirementEntity;
import com.youthloop.game.persistence.mapper.GameCardMapper;
import com.youthloop.game.persistence.mapper.GameCardUpgradeRequirementMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameCardAdminServiceTest {

    @Mock
    private GameCardMapper gameCardMapper;

    @Mock
    private GameCardUpgradeRequirementMapper gameCardUpgradeRequirementMapper;

    @Mock
    private CardCatalogService cardCatalogService;

    @InjectMocks
    private GameCardAdminService gameCardAdminService;

    @Test
    void createCardShouldPersistCoreFields() {
        AdminCreateGameCardRequest request = new AdminCreateGameCardRequest();
        request.setCardId("card900");
        request.setCardNo(900);
        request.setChineseName("Core Config Test");
        request.setEnglishName("Core Config Test");
        request.setCardType("core");
        request.setDomain("industry");
        request.setStar(2);
        request.setPhaseBucket("mid");
        request.setUnlockCostIndustry(10);
        request.setUnlockCostTech(4);
        request.setUnlockCostPopulation(2);
        request.setUnlockCostGreen(1);
        request.setCoreDomainProgressBonus(11);
        request.setCoreContinuousIndustryDelta(3);
        request.setCoreContinuousTechDelta(2);
        request.setCoreContinuousComboPct(25);
        request.setCoreConditionMinTurn(4);
        request.setCoreConditionMaxCarbon(90);
        request.setCoreConditionMinGreen(30);
        request.setCoreConditionMinSocietyProgressPct(35);
        request.setCoreConditionRequiredTag("traditional_industry");
        request.setCoreSpecialFloodResistancePct(40);
        request.setCoreSpecialEcologyCarbonSinkPerTenGreen(5);
        request.setUpgradeDeltaIndustry(6);
        request.setUpgradeDeltaCarbon(-3);
        request.setUpgradeReqFromStar(2);
        request.setUpgradeReqToStar(3);
        request.setUpgradeReqDomain1("industry");
        request.setUpgradeReqDomain1MinPct(40);
        request.setUpgradeReqCostIndustry(30);
        request.setUpgradeReqCostTech(10);

        when(gameCardMapper.selectByCardId("card900")).thenReturn(null);

        gameCardAdminService.createCard(request);

        ArgumentCaptor<GameCardEntity> captor = ArgumentCaptor.forClass(GameCardEntity.class);
        verify(gameCardMapper).insert(captor.capture());
        GameCardEntity saved = captor.getValue();

        assertEquals(11, saved.getCoreDomainProgressBonus());
        assertEquals(3, saved.getCoreContinuousIndustryDelta());
        assertEquals(2, saved.getCoreContinuousTechDelta());
        assertEquals(25, saved.getCoreContinuousComboPct());
        assertEquals(4, saved.getCoreConditionMinTurn());
        assertEquals(90, saved.getCoreConditionMaxCarbon());
        assertEquals(30, saved.getCoreConditionMinGreen());
        assertEquals(35, saved.getCoreConditionMinSocietyProgressPct());
        assertEquals("traditional_industry", saved.getCoreConditionRequiredTag());
        assertEquals(40, saved.getCoreSpecialFloodResistancePct());
        assertEquals(5, saved.getCoreSpecialEcologyCarbonSinkPerTenGreen());
        assertEquals(6, saved.getUpgradeDeltaIndustry());
        assertEquals(-3, saved.getUpgradeDeltaCarbon());
        ArgumentCaptor<GameCardUpgradeRequirementEntity> requirementCaptor = ArgumentCaptor.forClass(GameCardUpgradeRequirementEntity.class);
        verify(gameCardUpgradeRequirementMapper).upsert(requirementCaptor.capture());
        GameCardUpgradeRequirementEntity requirement = requirementCaptor.getValue();
        assertEquals(2, requirement.getFromStar());
        assertEquals(3, requirement.getToStar());
        assertEquals("industry", requirement.getReqDomain1());
        assertEquals(40, requirement.getReqDomain1MinPct());
        assertEquals(30, requirement.getCostIndustry());
        assertEquals(10, requirement.getCostTech());
        verify(cardCatalogService).reloadFromDatabase();
    }

    @Test
    void updateCardShouldApplyProvidedCoreFields() {
        GameCardEntity existing = new GameCardEntity();
        existing.setCardId("card901");
        existing.setCardNo(901);
        existing.setNameZh("Old");
        existing.setNameEn("Old");
        existing.setCardType("core");
        existing.setDomain("ecology");
        existing.setStar(1);
        existing.setPhaseBucket("early");
        existing.setUnlockCostIndustry(0);
        existing.setUnlockCostTech(0);
        existing.setUnlockCostPopulation(0);
        existing.setUnlockCostGreen(0);
        existing.setIsEnabled(true);
        existing.setCoreConditionMaxCarbon(Integer.MAX_VALUE);

        AdminUpdateGameCardRequest request = new AdminUpdateGameCardRequest();
        request.setCoreContinuousGreenDelta(6);
        request.setCoreContinuousCarbonDelta(-4);
        request.setCoreConditionMinIndustryCards(3);
        request.setCoreConditionMaxCarbon(70);
        request.setCoreSpecialEcologyCardCostReductionPct(20);
        request.setCoreConditionMinGreen(25);
        request.setCoreConditionMinSocietyProgressPct(40);
        request.setUpgradeDeltaTech(2);
        request.setUpgradeDeltaTradePricePct(15);
        request.setUpgradeReqDomain1("ecology");
        request.setUpgradeReqDomain1MinPct(50);
        request.setUpgradeReqCostGreen(8);

        when(gameCardMapper.selectByCardId("card901")).thenReturn(existing);
        when(gameCardMapper.update(any())).thenReturn(1);
        GameCardUpgradeRequirementEntity existingRequirement = new GameCardUpgradeRequirementEntity();
        existingRequirement.setCardId("card901");
        existingRequirement.setFromStar(1);
        existingRequirement.setToStar(2);
        existingRequirement.setReqDomain1("ecology");
        existingRequirement.setReqDomain1MinPct(20);
        existingRequirement.setCostGreen(4);
        existingRequirement.setIsEnabled(true);
        when(gameCardUpgradeRequirementMapper.selectEnabledByCardId("card901")).thenReturn(existingRequirement);

        gameCardAdminService.updateCard("card901", request);

        ArgumentCaptor<GameCardEntity> captor = ArgumentCaptor.forClass(GameCardEntity.class);
        verify(gameCardMapper).update(captor.capture());
        GameCardEntity updated = captor.getValue();

        assertEquals(6, updated.getCoreContinuousGreenDelta());
        assertEquals(-4, updated.getCoreContinuousCarbonDelta());
        assertEquals(3, updated.getCoreConditionMinIndustryCards());
        assertEquals(70, updated.getCoreConditionMaxCarbon());
        assertEquals(20, updated.getCoreSpecialEcologyCardCostReductionPct());
        assertEquals(25, updated.getCoreConditionMinGreen());
        assertEquals(40, updated.getCoreConditionMinSocietyProgressPct());
        assertEquals(2, updated.getUpgradeDeltaTech());
        assertEquals(15, updated.getUpgradeDeltaTradePricePct());
        ArgumentCaptor<GameCardUpgradeRequirementEntity> updateRequirementCaptor = ArgumentCaptor.forClass(GameCardUpgradeRequirementEntity.class);
        verify(gameCardUpgradeRequirementMapper).upsert(updateRequirementCaptor.capture());
        GameCardUpgradeRequirementEntity updatedRequirement = updateRequirementCaptor.getValue();
        assertEquals("ecology", updatedRequirement.getReqDomain1());
        assertEquals(50, updatedRequirement.getReqDomain1MinPct());
        assertEquals(8, updatedRequirement.getCostGreen());
        verify(cardCatalogService).reloadFromDatabase();
    }
}
