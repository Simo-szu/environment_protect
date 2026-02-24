package com.youthloop.game.api.dto;

import com.youthloop.game.persistence.entity.GameBalanceRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameCardTagMapEntity;
import com.youthloop.game.persistence.entity.GameComboRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameEndingContentConfigEntity;
import com.youthloop.game.persistence.entity.GameEventRuleConfigEntity;
import com.youthloop.game.persistence.entity.GamePolicyUnlockRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameRuntimeParamConfigEntity;
import lombok.Data;

import java.util.List;

/**
 * Partial update payload for game rule configuration.
 */
@Data
public class AdminUpdateGameRulesRequest {
    private GameRuntimeParamConfigEntity runtimeParam;
    private GameBalanceRuleConfigEntity balanceRule;
    private List<GameEventRuleConfigEntity> eventRules;
    private List<GameComboRuleConfigEntity> comboRules;
    private List<GamePolicyUnlockRuleConfigEntity> policyUnlockRules;
    private List<GameCardTagMapEntity> cardTags;
    private List<GameEndingContentConfigEntity> endingContents;
}
