package com.youthloop.game.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Card catalog response payload.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameCardCatalogDTO {
    private List<GameCardMetaDTO> items;
}
