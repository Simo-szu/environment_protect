package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.DailyTaskProgressEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 每日任务进度Mapper
 */
@Mapper
public interface DailyTaskProgressMapper {
    
    List<DailyTaskProgressEntity> selectByUserIdAndDate(@Param("userId") UUID userId, @Param("taskDate") LocalDate taskDate);
    
    DailyTaskProgressEntity selectByUserIdDateAndTaskId(@Param("userId") UUID userId, @Param("taskDate") LocalDate taskDate, @Param("taskId") UUID taskId);
    
    void insert(DailyTaskProgressEntity entity);
    
    void update(DailyTaskProgressEntity entity);
}
