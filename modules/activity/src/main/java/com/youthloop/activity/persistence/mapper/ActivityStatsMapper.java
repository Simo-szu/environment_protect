package com.youthloop.activity.persistence.mapper;

import com.youthloop.activity.persistence.entity.ActivityStatsEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.UUID;

/**
 * 活动统计 Mapper
 */
@Mapper
public interface ActivityStatsMapper {
    
    /**
     * 插入统计记录
     */
    int insert(ActivityStatsEntity entity);
    
    /**
     * 根据活动 ID 查询统计
     */
    ActivityStatsEntity selectByActivityId(@Param("activityId") UUID activityId);
}
