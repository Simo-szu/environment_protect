package com.youthloop.auth.persistence.mapper;

import com.youthloop.auth.persistence.entity.RefreshTokenEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.UUID;

/**
 * 刷新令牌 Mapper
 */
@Mapper
public interface RefreshTokenMapper {
    
    /**
     * 根据 token hash 查询
     */
    RefreshTokenEntity selectByTokenHash(@Param("tokenHash") String tokenHash);
    
    /**
     * 查询用户的有效令牌数量
     */
    int countActiveByUserId(@Param("userId") UUID userId);
    
    /**
     * 查询用户最旧的令牌
     */
    RefreshTokenEntity selectOldestByUserId(@Param("userId") UUID userId);
    
    /**
     * 插入刷新令牌
     */
    int insert(RefreshTokenEntity token);
    
    /**
     * 撤销令牌
     */
    int revokeByTokenHash(@Param("tokenHash") String tokenHash);
    
    /**
     * 撤销用户的所有令牌
     */
    int revokeAllByUserId(@Param("userId") UUID userId);
    
    /**
     * 根据 ID 撤销令牌
     */
    int revokeById(@Param("id") UUID id);
    
    /**
     * 删除过期的令牌
     */
    int deleteExpired();
}
