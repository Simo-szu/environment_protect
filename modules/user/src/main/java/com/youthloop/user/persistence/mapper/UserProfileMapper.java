package com.youthloop.user.persistence.mapper;

import com.youthloop.user.persistence.entity.UserProfileEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.UUID;

/**
 * 用户档案 Mapper
 */
@Mapper
public interface UserProfileMapper {
    
    /**
     * 根据用户 ID 查询档案
     */
    UserProfileEntity selectByUserId(@Param("userId") UUID userId);
    
    /**
     * 插入用户档案
     */
    int insert(UserProfileEntity profile);
    
    /**
     * 更新用户档案
     */
    int update(UserProfileEntity profile);
    
    /**
     * 根据用户 ID 删除档案
     */
    int deleteByUserId(@Param("userId") UUID userId);
}
