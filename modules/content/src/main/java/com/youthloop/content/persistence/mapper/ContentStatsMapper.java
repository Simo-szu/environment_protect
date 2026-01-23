package com.youthloop.content.persistence.mapper;

import com.youthloop.content.persistence.entity.ContentStatsEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 内容统计 Mapper
 */
@Mapper
public interface ContentStatsMapper {
    
    /**
     * 根据内容 ID 查询统计
     */
    ContentStatsEntity selectByContentId(@Param("contentId") UUID contentId);
    
    /**
     * 批量查询统计（用于列表）
     */
    List<ContentStatsEntity> selectByContentIds(@Param("contentIds") List<UUID> contentIds);
    
    /**
     * 插入统计
     */
    int insert(ContentStatsEntity stats);
    
    /**
     * 更新统计
     */
    int update(ContentStatsEntity stats);
}
