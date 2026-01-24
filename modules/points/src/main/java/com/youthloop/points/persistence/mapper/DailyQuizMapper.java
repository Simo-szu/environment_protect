package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.DailyQuizEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;

/**
 * 每日问答Mapper
 */
@Mapper
public interface DailyQuizMapper {
    
    DailyQuizEntity selectByDate(@Param("quizDate") LocalDate quizDate);
    
    void insert(DailyQuizEntity entity);
}
