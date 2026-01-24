package com.youthloop.auth.persistence.mapper;

import com.youthloop.auth.persistence.entity.VerificationCodeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 验证码 Mapper
 */
@Mapper
public interface VerificationCodeMapper {
    
    /**
     * 插入验证码
     */
    int insert(VerificationCodeEntity entity);
    
    /**
     * 查询最新的有效验证码
     */
    VerificationCodeEntity selectLatestValid(
        @Param("account") String account,
        @Param("purpose") Integer purpose,
        @Param("now") LocalDateTime now
    );
    
    /**
     * 增加尝试次数
     */
    int incrementAttempts(@Param("id") UUID id);
    
    /**
     * 根据 ID 删除验证码
     */
    int deleteById(@Param("id") UUID id);
    
    /**
     * 删除过期的验证码（清理任务）
     */
    int deleteExpired(@Param("before") LocalDateTime before);
}
