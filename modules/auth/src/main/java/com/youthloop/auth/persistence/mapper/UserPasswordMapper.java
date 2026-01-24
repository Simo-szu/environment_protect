package com.youthloop.auth.persistence.mapper;

import com.youthloop.auth.persistence.entity.UserPasswordEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户密码 Mapper
 */
@Mapper
public interface UserPasswordMapper {
    
    /**
     * 根据用户 ID 查询密码
     */
    UserPasswordEntity selectByUserId(@Param("userId") UUID userId);
    
    /**
     * 插入密码
     */
    int insert(UserPasswordEntity password);
    
    /**
     * 更新密码
     */
    int update(UserPasswordEntity password);
    
    /**
     * 更新密码哈希
     */
    int updatePassword(
        @Param("userId") UUID userId,
        @Param("passwordHash") String passwordHash,
        @Param("updatedAt") LocalDateTime updatedAt
    );
    
    /**
     * 删除密码
     */
    int deleteByUserId(@Param("userId") UUID userId);
}
