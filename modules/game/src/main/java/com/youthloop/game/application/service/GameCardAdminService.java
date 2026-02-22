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
    public List<GameCardMetaDTO> listCards() {
        return gameCardMapper.selectAll().stream().map(this::toDTO).toList();
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
            .build();
    }

    private Integer defaultInt(Integer value) {
        return Objects.requireNonNullElse(value, 0);
    }
}
