package com.youthloop.query.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 评论查询 Mapper（只读）
 * 用于评论树聚合查询
 */
@Mapper
public interface CommentQueryMapper {
    
    /**
     * 查询根评论列表（分页）
     * 
     * @param targetType 目标类型：1=内容 2=活动
     * @param targetId 目标 ID
     * @param sort 排序：latest=最新 hot=热门
     * @param offset 偏移量
     * @param limit 限制数量
     * @return 根评论列表（含用户信息和统计）
     */
    List<Map<String, Object>> selectRootComments(
        @Param("targetType") Integer targetType,
        @Param("targetId") UUID targetId,
        @Param("sort") String sort,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计根评论总数
     */
    Long countRootComments(
        @Param("targetType") Integer targetType,
        @Param("targetId") UUID targetId
    );
    
    /**
     * 批量查询根评论的回复
     * 
     * @param rootIds 根评论 ID 列表
     * @param limit 每个根评论最多返回的回复数
     * @return 回复列表（含用户信息）
     */
    List<Map<String, Object>> selectRepliesByRootIds(
        @Param("rootIds") List<UUID> rootIds,
        @Param("limit") Integer limit
    );
}
