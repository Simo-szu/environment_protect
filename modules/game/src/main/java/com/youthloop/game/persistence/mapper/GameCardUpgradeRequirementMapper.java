package com.youthloop.game.persistence.mapper;

import com.youthloop.game.persistence.entity.GameCardUpgradeRequirementEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper for card upgrade requirements.
 */
@Mapper
public interface GameCardUpgradeRequirementMapper {

    List<GameCardUpgradeRequirementEntity> selectAllEnabled();

    GameCardUpgradeRequirementEntity selectEnabledByCardId(@Param("cardId") String cardId);

    int upsert(GameCardUpgradeRequirementEntity entity);

    int deleteByCardId(@Param("cardId") String cardId);
}
