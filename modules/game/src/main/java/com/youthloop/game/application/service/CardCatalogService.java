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
            .build();
    }
}
