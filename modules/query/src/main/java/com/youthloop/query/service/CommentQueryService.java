package com.youthloop.query.service;

import com.youthloop.common.api.PageResponse;
import com.youthloop.query.dto.CommentDTO;
import com.youthloop.query.dto.CommentTreeDTO;
import com.youthloop.query.mapper.CommentQueryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 评论查询服务（聚合查询）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentQueryService {
    
    private final CommentQueryMapper commentQueryMapper;
    
    /**
     * 查询评论树
     * 
     * @param targetType 目标类型：1=内容 2=活动
     * @param targetId 目标 ID
     * @param sort 排序：latest=最新 hot=热门
     * @param page 页码
     * @param size 每页数量
     * @return 评论树（根评论分页 + 每个根评论的回复）
     */
    @Transactional(readOnly = true)
    public CommentTreeDTO getCommentTree(Integer targetType, UUID targetId, String sort, Integer page, Integer size) {
        // 参数校验
        sort = sort != null ? sort : "latest";
        page = Math.max(1, page != null ? page : 1);
        size = Math.min(50, Math.max(1, size != null ? size : 10));
        int offset = (page - 1) * size;
        
        // 查询根评论总数
        Long total = commentQueryMapper.countRootComments(targetType, targetId);
        
        CommentTreeDTO result = new CommentTreeDTO();
        result.setSort(sort);
        
        if (total == 0) {
            result.setRootComments(PageResponse.of(Collections.emptyList(), total, page, size));
            return result;
        }
        
        // 查询根评论列表
        List<Map<String, Object>> rootRows = commentQueryMapper.selectRootComments(
            targetType, targetId, sort, offset, size
        );
        
        if (rootRows.isEmpty()) {
            result.setRootComments(PageResponse.of(Collections.emptyList(), total, page, size));
            return result;
        }
        
        // 转换为 DTO
        List<CommentDTO> rootComments = rootRows.stream()
            .map(this::mapToCommentDTO)
            .collect(Collectors.toList());
        
        // 批量查询回复（每个根评论最多返回 3 条最新回复）
        List<UUID> rootIds = rootComments.stream()
            .map(CommentDTO::getId)
            .collect(Collectors.toList());
        
        List<Map<String, Object>> replyRows = commentQueryMapper.selectRepliesByRootIds(rootIds, 3);
        
        // 按 root_id 分组
        Map<UUID, List<CommentDTO>> repliesMap = replyRows.stream()
            .map(this::mapToCommentDTO)
            .collect(Collectors.groupingBy(CommentDTO::getRootId));
        
        // 填充回复到根评论
        rootComments.forEach(root -> {
            List<CommentDTO> replies = repliesMap.get(root.getId());
            root.setReplies(replies != null ? replies : Collections.emptyList());
        });
        
        result.setRootComments(PageResponse.of(rootComments, total, page, size));
        return result;
    }
    
    /**
     * 映射到评论 DTO
     */
    private CommentDTO mapToCommentDTO(Map<String, Object> row) {
        CommentDTO dto = new CommentDTO();
        dto.setId((UUID) row.get("id"));
        dto.setTargetType((Integer) row.get("target_type"));
        dto.setTargetId((UUID) row.get("target_id"));
        dto.setUserId((UUID) row.get("user_id"));
        dto.setUserNickname((String) row.get("user_nickname"));
        dto.setUserAvatar((String) row.get("user_avatar"));
        dto.setParentId((UUID) row.get("parent_id"));
        dto.setRootId((UUID) row.get("root_id"));
        dto.setDepth((Integer) row.get("depth"));
        dto.setBody((String) row.get("body"));
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt((LocalDateTime) row.get("created_at"));
        dto.setUpdatedAt((LocalDateTime) row.get("updated_at"));
        
        // 统计信息（安全转换）
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setReplyCount(row.get("reply_count") != null ? ((Number) row.get("reply_count")).intValue() : 0);
        
        return dto;
    }
}
