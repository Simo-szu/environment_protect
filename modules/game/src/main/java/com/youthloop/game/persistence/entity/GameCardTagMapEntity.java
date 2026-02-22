package com.youthloop.game.persistence.entity;

import lombok.Data;

/**
 * Game card tag mapping entity.
 */
@Data
public class GameCardTagMapEntity {
    private String cardId;
    private String tagCode;
    private Boolean isEnabled;
}
