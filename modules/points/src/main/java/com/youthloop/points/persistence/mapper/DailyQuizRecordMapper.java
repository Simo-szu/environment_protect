package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.DailyQuizRecordEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 每日问答记录Mapper
 */
@Mapper
public interface DailyQuizRecordMapper {
    
    DailyQuizRecordEntity selectByUserIdAndDate(@Param("userId") UUID userId, @Param("quizDate") LocalDate quizDate);
    
    void insert(DailyQuizRecordEntity entity);
}
