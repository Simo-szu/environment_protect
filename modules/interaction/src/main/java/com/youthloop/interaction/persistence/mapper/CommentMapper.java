package com.youthloop.interaction.persistence.mapper;

import com.youthloop.interaction.persistence.entity.CommentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 评论 Mapper
 */
@Mapper
public interface CommentMapper {
    
    /**
     * 插入评论
     */
    int insert(CommentEntity comment);
    
    /**
     * 根据 ID 查询评论
     */
    CommentEntity selectById(@Param("id") UUID id);
    
    /**
     * 查询目标的评论列表（分页）
     */
    List<CommentEntity> selectByTarget(
        @Param("targetType") Integer targetType,
        @Param("targetId") UUID targetId,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计目标的评论总数
     */
    Long countByTarget(
        @Param("targetType") Integer targetType,
        @Param("targetId") UUID targetId
    );
    
    /**
     * 查询根评论下的回复列表
     */
    List<CommentEntity> selectByRoot(
        @Param("rootId") UUID rootId,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 更新评论状态
     */
    int updateStatus(
        @Param("id") UUID id,
        @Param("status") Integer status
    );
}
