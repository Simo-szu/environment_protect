package com.youthloop.game.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Loads immutable card metadata from classpath resource.
 */
@Service
@RequiredArgsConstructor
public class CardCatalogService {

    private static final String RESOURCE_PATH = "game/card-config.json";

    private final ObjectMapper objectMapper;

    private List<GameCardMetaDTO> cards = List.of();
    private Map<String, GameCardMetaDTO> cardMap = Map.of();

    @PostConstruct
    void init() {
        try (InputStream inputStream = new ClassPathResource(RESOURCE_PATH).getInputStream()) {
            List<GameCardMetaDTO> loaded = objectMapper.readValue(
                inputStream,
                new TypeReference<List<GameCardMetaDTO>>() {}
            );
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
            throw new BizException(ErrorCode.SYSTEM_ERROR, "Failed to load card catalog: " + e.getMessage());
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
        return cards.stream()
            .filter(card -> "core".equals(card.getCardType()))
            .filter(card -> Objects.equals(phaseBucket, card.getPhaseBucket()))
            .map(GameCardMetaDTO::getCardId)
            .toList();
    }
}
