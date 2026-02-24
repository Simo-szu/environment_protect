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
 * Aggregated editable game rule configuration for admin.
 */
@Data
public class AdminGameRulesConfigDTO {
    private GameRuntimeParamConfigEntity runtimeParam;
    private GameBalanceRuleConfigEntity balanceRule;
    private List<GameEventRuleConfigEntity> eventRules;
    private List<GameComboRuleConfigEntity> comboRules;
    private List<GamePolicyUnlockRuleConfigEntity> policyUnlockRules;
    private List<GameCardTagMapEntity> cardTags;
    private List<GameEndingContentConfigEntity> endingContents;
}
