package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.SigninRecordEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 签到记录Mapper
 */
@Mapper
public interface SigninRecordMapper {
    
    SigninRecordEntity selectByUserIdAndDate(@Param("userId") UUID userId, @Param("signinDate") LocalDate signinDate);
    
    SigninRecordEntity selectLatestByUserId(@Param("userId") UUID userId);
    
    void insert(SigninRecordEntity entity);
}
