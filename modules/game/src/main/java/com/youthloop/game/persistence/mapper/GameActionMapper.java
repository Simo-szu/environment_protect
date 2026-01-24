package com.youthloop.game.persistence.mapper;

import com.youthloop.game.persistence.entity.GameActionEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 游戏操作Mapper
 */
@Mapper
public interface GameActionMapper {
    
    void insert(GameActionEntity entity);
}
