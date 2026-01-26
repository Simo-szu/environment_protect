package com.youthloop.query.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 内容查询 Mapper（只读）
 * 用于聚合查询，可以直接 join 多表
 */
@Mapper
public interface ContentQueryMapper {
    
    /**
     * 查询内容列表（含统计）
     * 
     * @param type 内容类型（可选）
     * @param status 状态（默认 1=已发布）
     * @param locale 语言代码
     * @param offset 偏移量
     * @param limit 限制数量
     * @return 内容列表（Map 格式，包含主数据和统计）
     */
    List<Map<String, Object>> selectContentListWithStats(
        @Param("type") Integer type,
        @Param("status") Integer status,
        @Param("locale") String locale,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 查询内容总数
     */
    Long countContentList(
        @Param("type") Integer type,
        @Param("status") Integer status
    );
    
    /**
     * 查询内容详情（含统计）
     * 
     * @param contentId 内容 ID
     * @param locale 语言代码
     * @return 内容详情（Map 格式，包含主数据和统计）
     */
    Map<String, Object> selectContentDetailWithStats(
        @Param("contentId") UUID contentId,
        @Param("locale") String locale
    );
    
    /**
     * 批量查询用户对内容的反应状态
     * 
     * @param userId 用户 ID
     * @param contentIds 内容 ID 列表
     * @return Map<contentId, Map<reactionType, exists>>
     */
    List<Map<String, Object>> selectUserReactionsForContents(
        @Param("userId") UUID userId,
        @Param("contentIds") List<UUID> contentIds
    );
    
    /**
     * 查询最新内容（首页用）
     * 
     * @param locale 语言代码
     * @param limit 限制数量
     * @return 内容列表
     */
    List<Map<String, Object>> selectLatestContents(
        @Param("locale") String locale,
        @Param("limit") Integer limit
    );
}
