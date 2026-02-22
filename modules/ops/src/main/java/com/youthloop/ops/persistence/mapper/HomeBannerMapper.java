package com.youthloop.ops.persistence.mapper;

import com.youthloop.ops.persistence.entity.HomeBannerEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 首页轮播 Mapper
 */
@Mapper
public interface HomeBannerMapper {
    
    /**
     * 根据 ID 查询
     */
    HomeBannerEntity selectById(@Param("id") UUID id);
    
    /**
     * 查询所有轮播（管理端用，分页）
     */
    List<HomeBannerEntity> selectAll(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 查询所有轮播总数
     */
    long countAll();
    
    /**
     * 查询启用的轮播（用户端用）
     */
    List<HomeBannerEntity> selectActive();
    
    /**
     * 插入
     */
    int insert(HomeBannerEntity entity);
    
    /**
     * 更新
     */
    int update(HomeBannerEntity entity);
    
    /**
     * 删除
     */
    int deleteById(@Param("id") UUID id);
}
