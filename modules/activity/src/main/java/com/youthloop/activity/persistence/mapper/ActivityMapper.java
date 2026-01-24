package com.youthloop.activity.persistence.mapper;

import com.youthloop.activity.persistence.entity.ActivityEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 活动 Mapper（写模型）
 */
@Mapper
public interface ActivityMapper {
    
    /**
     * 插入活动
     */
    int insert(ActivityEntity entity);
    
    /**
     * 更新活动
     */
    int update(ActivityEntity entity);
    
    /**
     * 根据 ID 查询活动
     */
    ActivityEntity selectById(@Param("activityId") UUID activityId);
    
    /**
     * 查询活动的报名策略
     */
    Integer selectSignupPolicy(@Param("activityId") UUID activityId);
    
    /**
     * 查询主办方发布的活动列表
     */
    List<Map<String, Object>> selectHostActivities(
        @Param("hostUserId") UUID hostUserId,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计主办方发布的活动总数
     */
    Long countHostActivities(@Param("hostUserId") UUID hostUserId);
}
