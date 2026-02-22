package com.youthloop.game.persistence.entity;

import lombok.Data;

/**
 * Ending display content config entity.
 */
@Data
public class GameEndingContentConfigEntity {
    private String endingId;
    private String endingName;
    private String imageKey;
    private String defaultReason;
    private String failureReasonHighCarbon;
    private String failureReasonTrade;
    private String failureReasonLowScore;
    private String failureReasonBoundaryDefault;
    private Boolean isEnabled;
}
