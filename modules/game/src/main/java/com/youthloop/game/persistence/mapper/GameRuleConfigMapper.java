package com.youthloop.game.persistence.mapper;

import com.youthloop.game.persistence.entity.GameComboRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameCardTagMapEntity;
import com.youthloop.game.persistence.entity.GameBalanceRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameCoreSpecialConditionConfigEntity;
import com.youthloop.game.persistence.entity.GameEventRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameEndingContentConfigEntity;
import com.youthloop.game.persistence.entity.GamePolicyUnlockRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameRuntimeParamConfigEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * Mapper for game runtime rule configs.
 */
@Mapper
public interface GameRuleConfigMapper {

    List<GameEventRuleConfigEntity> selectEnabledEventRules();

    List<GameComboRuleConfigEntity> selectEnabledComboRules();

    List<GameCardTagMapEntity> selectEnabledCardTags();

    List<GamePolicyUnlockRuleConfigEntity> selectEnabledPolicyUnlockRules();

    List<GameCoreSpecialConditionConfigEntity> selectEnabledCoreSpecialConditions();

    GameRuntimeParamConfigEntity selectEnabledRuntimeParamConfig();

    GameBalanceRuleConfigEntity selectEnabledBalanceRuleConfig();

    List<GameEndingContentConfigEntity> selectEnabledEndingContents();
}
