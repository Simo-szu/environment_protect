package com.youthloop.game.application.service;

import com.youthloop.game.api.dto.AdminCreateGameCardRequest;
import com.youthloop.game.api.dto.AdminUpdateGameCardRequest;
import com.youthloop.game.persistence.entity.GameCardEntity;
import com.youthloop.game.persistence.mapper.GameCardMapper;
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
        request.setCoreConditionRequiredTag("traditional_industry");
        request.setCoreSpecialFloodResistancePct(40);
        request.setCoreSpecialEcologyCarbonSinkPerTenGreen(5);

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
        assertEquals("traditional_industry", saved.getCoreConditionRequiredTag());
        assertEquals(40, saved.getCoreSpecialFloodResistancePct());
        assertEquals(5, saved.getCoreSpecialEcologyCarbonSinkPerTenGreen());
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

        when(gameCardMapper.selectByCardId("card901")).thenReturn(existing);
        when(gameCardMapper.update(any())).thenReturn(1);

        gameCardAdminService.updateCard("card901", request);

        ArgumentCaptor<GameCardEntity> captor = ArgumentCaptor.forClass(GameCardEntity.class);
        verify(gameCardMapper).update(captor.capture());
        GameCardEntity updated = captor.getValue();

        assertEquals(6, updated.getCoreContinuousGreenDelta());
        assertEquals(-4, updated.getCoreContinuousCarbonDelta());
        assertEquals(3, updated.getCoreConditionMinIndustryCards());
        assertEquals(70, updated.getCoreConditionMaxCarbon());
        assertEquals(20, updated.getCoreSpecialEcologyCardCostReductionPct());
        verify(cardCatalogService).reloadFromDatabase();
    }
}
