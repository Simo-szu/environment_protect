package com.youthloop.activity.persistence.mapper;

import com.youthloop.activity.persistence.entity.ActivitySessionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.UUID;

/**
 * 活动场次 Mapper
 */
@Mapper
public interface ActivitySessionMapper {
    
    /**
     * 插入场次
     */
    int insert(ActivitySessionEntity entity);
    
    /**
     * 更新场次
     */
    int update(ActivitySessionEntity entity);
    
    /**
     * 根据 ID 查询场次
     */
    ActivitySessionEntity selectById(@Param("id") UUID id);
}
