package com.youthloop.game.persistence.mapper;

import com.youthloop.game.persistence.entity.GameSessionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.UUID;

/**
 * 游戏会话Mapper
 */
@Mapper
public interface GameSessionMapper {
    
    GameSessionEntity selectById(@Param("id") UUID id);
    
    GameSessionEntity selectActiveByUserId(@Param("userId") UUID userId);
    
    void insert(GameSessionEntity entity);
    
    void update(GameSessionEntity entity);
}
