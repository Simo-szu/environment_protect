package com.youthloop.user.persistence.mapper;

import com.youthloop.user.persistence.entity.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 用户 Mapper
 */
@Mapper
public interface UserMapper {
    
    /**
     * 根据 ID 查询用户
     */
    UserEntity selectById(@Param("id") UUID id);
    
    /**
     * 插入用户
     */
    int insert(UserEntity user);
    
    /**
     * 更新用户
     */
    int update(UserEntity user);
    
    /**
     * 根据 ID 删除用户
     */
    int deleteById(@Param("id") UUID id);
    
    /**
     * 分页查询用户列表
     */
    List<UserEntity> selectList(@Param("offset") Integer offset, 
                                 @Param("limit") Integer limit);
    
    /**
     * 统计用户总数
     */
    Long countTotal();
    
    /**
     * 更新最后登录时间
     */
    int updateLastLoginAt(@Param("id") UUID id);
    
    /**
     * 更新用户角色
     */
    int updateRole(@Param("id") UUID id, @Param("role") Integer role);
}
