package com.youthloop.content.persistence.mapper;

import com.youthloop.content.persistence.entity.ContentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 内容 Mapper
 */
@Mapper
public interface ContentMapper {
    
    /**
     * 根据 ID 查询内容
     */
    ContentEntity selectById(@Param("id") UUID id);
    
    /**
     * 分页查询内容列表
     */
    List<ContentEntity> selectList(
        @Param("type") Integer type,
        @Param("status") Integer status,
        @Param("keyword") String keyword,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计内容总数
     */
    Long countList(
        @Param("type") Integer type,
        @Param("status") Integer status,
        @Param("keyword") String keyword
    );
    
    /**
     * 插入内容
     */
    int insert(ContentEntity content);
    
    /**
     * 更新内容
     */
    int update(ContentEntity content);
    
    /**
     * 删除内容
     */
    int deleteById(@Param("id") UUID id);
    
    /**
     * 根据来源 URL 查询内容
     */
    ContentEntity selectBySourceUrl(@Param("sourceUrl") String sourceUrl);

    /**
     * Query only id text by source url to keep dedupe checks lightweight.
     */
    String selectIdBySourceUrl(@Param("sourceUrl") String sourceUrl);
}
