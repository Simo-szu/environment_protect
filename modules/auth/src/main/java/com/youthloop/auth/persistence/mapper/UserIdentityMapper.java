package com.youthloop.auth.persistence.mapper;

import com.youthloop.auth.persistence.entity.UserIdentityEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 用户身份 Mapper
 */
@Mapper
public interface UserIdentityMapper {
    
    /**
     * 根据身份类型和标识符查询
     */
    UserIdentityEntity selectByTypeAndIdentifier(
        @Param("identityType") Integer identityType,
        @Param("identityIdentifier") String identityIdentifier
    );
    
    /**
     * 根据用户 ID 查询所有身份
     */
    List<UserIdentityEntity> selectByUserId(@Param("userId") UUID userId);
    
    /**
     * 插入身份
     */
    int insert(UserIdentityEntity identity);
    
    /**
     * 更新身份
     */
    int update(UserIdentityEntity identity);
    
    /**
     * 删除身份
     */
    int deleteById(@Param("id") UUID id);
}
