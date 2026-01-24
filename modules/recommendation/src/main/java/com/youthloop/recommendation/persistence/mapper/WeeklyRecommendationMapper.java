package com.youthloop.recommendation.persistence.mapper;

import com.youthloop.recommendation.persistence.entity.WeeklyRecommendationEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 每周推荐Mapper
 */
@Mapper
public interface WeeklyRecommendationMapper {
    
    WeeklyRecommendationEntity selectByUserIdAndWeek(@Param("userId") UUID userId, @Param("weekStart") LocalDate weekStart);
    
    void insert(WeeklyRecommendationEntity entity);
    
    void update(WeeklyRecommendationEntity entity);
}
