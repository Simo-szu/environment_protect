package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.DailyTaskEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.UUID;

/**
 * 每日任务Mapper
 */
@Mapper
public interface DailyTaskMapper {
    
    List<DailyTaskEntity> selectAllEnabled();
    
    DailyTaskEntity selectById(@Param("id") UUID id);
}
