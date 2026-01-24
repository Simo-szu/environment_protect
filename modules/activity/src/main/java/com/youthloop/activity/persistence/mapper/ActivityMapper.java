package com.youthloop.activity.persistence.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.UUID;

/**
 * 活动 Mapper（写模型）
 */
@Mapper
public interface ActivityMapper {
    
    /**
     * 查询活动的报名策略
     */
    Integer selectSignupPolicy(@Param("activityId") UUID activityId);
}
