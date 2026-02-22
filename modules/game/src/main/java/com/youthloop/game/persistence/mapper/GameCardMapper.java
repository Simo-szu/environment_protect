package com.youthloop.game.persistence.mapper;

import com.youthloop.game.persistence.entity.GameCardEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Game card mapper.
 */
@Mapper
public interface GameCardMapper {

    List<GameCardEntity> selectAll(@Param("offset") int offset, @Param("limit") int limit);

    long countAll();

    List<GameCardEntity> selectAllEnabled();

    List<String> selectCoreCardIdsByPhase(@Param("phaseBucket") String phaseBucket);

    GameCardEntity selectByCardId(@Param("cardId") String cardId);

    GameCardEntity selectEnabledByCardId(@Param("cardId") String cardId);

    int insert(GameCardEntity entity);

    int update(GameCardEntity entity);

    int deleteByCardId(@Param("cardId") String cardId);
}
