package com.youthloop.host.persistence.mapper;

import com.youthloop.host.persistence.entity.HostVerificationEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 主办方认证 Mapper
 */
@Mapper
public interface HostVerificationMapper {
    
    /**
     * 插入认证申请
     */
    int insert(HostVerificationEntity entity);
    
    /**
     * 根据用户 ID 查询认证记录
     */
    HostVerificationEntity selectByUserId(@Param("userId") UUID userId);
    
    /**
     * 查询所有认证申请（管理端）
     */
    List<HostVerificationEntity> selectAll(@Param("status") Integer status);
    
    /**
     * 更新审核状态
     */
    int updateReviewStatus(
        @Param("userId") UUID userId,
        @Param("status") Integer status,
        @Param("reviewedBy") UUID reviewedBy,
        @Param("reviewNote") String reviewNote
    );
}
