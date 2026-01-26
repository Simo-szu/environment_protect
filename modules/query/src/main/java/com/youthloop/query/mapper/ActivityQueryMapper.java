package com.youthloop.query.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 活动查询 Mapper（只读）
 */
@Mapper
public interface ActivityQueryMapper {
    
    /**
     * 查询活动列表（分页 + 筛选 + 排序）
     */
    List<Map<String, Object>> selectActivityList(
        @Param("category") Integer category,
        @Param("status") Integer status,
        @Param("locale") String locale,
        @Param("sort") String sort,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计活动总数
     */
    Long countActivityList(
        @Param("category") Integer category,
        @Param("status") Integer status
    );
    
    /**
     * 查询活动详情
     */
    Map<String, Object> selectActivityDetail(
        @Param("activityId") UUID activityId,
        @Param("locale") String locale
    );
    
    /**
     * 查询活动场次列表
     */
    List<Map<String, Object>> selectActivitySessions(@Param("activityId") UUID activityId);
    
    /**
     * 批量查询用户状态（列表用）
     */
    List<Map<String, Object>> selectUserStates(
        @Param("userId") UUID userId,
        @Param("activityIds") List<UUID> activityIds
    );
    
    /**
     * 查询单个活动的用户状态（详情用）
     */
    Map<String, Object> selectUserState(
        @Param("userId") UUID userId,
        @Param("activityId") UUID activityId
    );
}
