package com.youthloop.interaction.persistence.mapper;

import com.youthloop.interaction.persistence.entity.CommentStatsEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.UUID;

/**
 * 评论统计 Mapper
 */
@Mapper
public interface CommentStatsMapper {
    
    /**
     * 插入统计
     */
    int insert(CommentStatsEntity stats);
    
    /**
     * 根据评论 ID 查询统计
     */
    CommentStatsEntity selectByCommentId(@Param("commentId") UUID commentId);
    
    /**
     * 增加点赞数
     */
    int incrementLikeCount(@Param("commentId") UUID commentId);
    
    /**
     * 减少点赞数
     */
    int decrementLikeCount(@Param("commentId") UUID commentId);
    
    /**
     * 增加踩数
     */
    int incrementDownCount(@Param("commentId") UUID commentId);
    
    /**
     * 减少踩数
     */
    int decrementDownCount(@Param("commentId") UUID commentId);
    
    /**
     * 增加回复数
     */
    int incrementReplyCount(@Param("commentId") UUID commentId);
}
