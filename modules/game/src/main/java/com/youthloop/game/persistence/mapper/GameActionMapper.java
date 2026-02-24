package com.youthloop.game.persistence.mapper;

import com.youthloop.game.persistence.entity.GameActionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 游戏操作Mapper
 */
@Mapper
public interface GameActionMapper {
    
    void insert(GameActionEntity entity);

    long countBySessionId(@Param("sessionId") UUID sessionId);

    List<GameActionEntity> selectBySessionId(
        @Param("sessionId") UUID sessionId,
        @Param("offset") int offset,
        @Param("limit") int limit
    );
}
