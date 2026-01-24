package com.youthloop.query.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 我的查询 Mapper（只读）
 * 包含：我的收藏/点赞、我的通知
 */
@Mapper
public interface MeQueryMapper {
    
    /**
     * 查询我的收藏/点赞列表
     */
    List<Map<String, Object>> selectMyReactions(
        @Param("userId") UUID userId,
        @Param("reactionType") Integer reactionType,
        @Param("targetType") Integer targetType,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计我的收藏/点赞总数
     */
    Long countMyReactions(
        @Param("userId") UUID userId,
        @Param("reactionType") Integer reactionType,
        @Param("targetType") Integer targetType
    );
    
    /**
     * 查询我的通知列表
     */
    List<Map<String, Object>> selectMyNotifications(
        @Param("userId") UUID userId,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计我的通知总数
     */
    Long countMyNotifications(@Param("userId") UUID userId);
    
    /**
     * 查询我报名的活动列表
     */
    List<Map<String, Object>> selectMyActivities(
        @Param("userId") UUID userId,
        @Param("status") Integer status,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计我报名的活动总数
     */
    Long countMyActivities(
        @Param("userId") UUID userId,
        @Param("status") Integer status
    );
}
