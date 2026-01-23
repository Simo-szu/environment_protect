package com.youthloop.interaction.persistence.mapper;

import com.youthloop.interaction.persistence.entity.ReactionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.UUID;

/**
 * 反应 Mapper
 */
@Mapper
public interface ReactionMapper {
    
    /**
     * 插入反应（利用唯一约束做幂等）
     */
    int insert(ReactionEntity reaction);
    
    /**
     * 查询用户对目标的反应
     */
    ReactionEntity selectByUserAndTarget(
        @Param("userId") UUID userId,
        @Param("targetType") Integer targetType,
        @Param("targetId") UUID targetId,
        @Param("reactionType") Integer reactionType
    );
    
    /**
     * 删除反应
     */
    int deleteById(@Param("id") UUID id);
    
    /**
     * 删除用户对目标的反应
     */
    int deleteByUserAndTarget(
        @Param("userId") UUID userId,
        @Param("targetType") Integer targetType,
        @Param("targetId") UUID targetId,
        @Param("reactionType") Integer reactionType
    );
}
