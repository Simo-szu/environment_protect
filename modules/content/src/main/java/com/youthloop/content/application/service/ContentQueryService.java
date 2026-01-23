package com.youthloop.content.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.exception.BizException;
import com.youthloop.content.application.dto.ContentDTO;
import com.youthloop.content.application.dto.ContentListDTO;
import com.youthloop.content.application.dto.ContentQueryRequest;
import com.youthloop.content.persistence.entity.ContentEntity;
import com.youthloop.content.persistence.entity.ContentStatsEntity;
import com.youthloop.content.persistence.mapper.ContentMapper;
import com.youthloop.content.persistence.mapper.ContentStatsMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 内容查询服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentQueryService {
    
    private final ContentMapper contentMapper;
    private final ContentStatsMapper contentStatsMapper;
    
    /**
     * 分页查询内容列表
     */
    public PageResponse<ContentListDTO> getContentList(ContentQueryRequest request) {
        // 默认只查询已发布的内容
        Integer status = request.getStatus() != null ? request.getStatus() : 1;
        
        // 计算分页参数
        int page = Math.max(1, request.getPage());
        int pageSize = Math.min(100, Math.max(1, request.getPageSize()));
        int offset = (page - 1) * pageSize;
        
        // 查询总数
        Long total = contentMapper.countList(request.getType(), status);
        
        // 查询列表
        List<ContentEntity> entities = contentMapper.selectList(
            request.getType(),
            status,
            offset,
            pageSize
        );
        
        // 如果没有数据，直接返回空列表
        if (entities.isEmpty()) {
            return PageResponse.of(Collections.emptyList(), total, page, pageSize);
        }
        
        // 批量查询统计信息
        List<UUID> contentIds = entities.stream()
            .map(ContentEntity::getId)
            .collect(Collectors.toList());
        
        List<ContentStatsEntity> statsList = contentStatsMapper.selectByContentIds(contentIds);
        Map<UUID, ContentStatsEntity> statsMap = statsList.stream()
            .collect(Collectors.toMap(ContentStatsEntity::getContentId, s -> s));
        
        // 组装 DTO
        List<ContentListDTO> dtoList = entities.stream()
            .map(entity -> {
                ContentListDTO dto = new ContentListDTO();
                dto.setId(entity.getId());
                dto.setType(entity.getType());
                dto.setTitle(entity.getTitle());
                dto.setSummary(entity.getSummary());
                dto.setCoverUrl(entity.getCoverUrl());
                dto.setPublishedAt(entity.getPublishedAt());
                dto.setStatus(entity.getStatus());
                dto.setCreatedAt(entity.getCreatedAt());
                
                // 填充统计信息
                ContentStatsEntity stats = statsMap.get(entity.getId());
                if (stats != null) {
                    dto.setLikeCount(stats.getLikeCount());
                    dto.setFavCount(stats.getFavCount());
                    dto.setCommentCount(stats.getCommentCount());
                    dto.setHotScore(stats.getHotScore());
                }
                
                return dto;
            })
            .collect(Collectors.toList());
        
        return PageResponse.of(dtoList, total, page, pageSize);
    }
    
    /**
     * 根据 ID 查询内容详情
     */
    public ContentDTO getContentById(UUID id) {
        ContentEntity entity = contentMapper.selectById(id);
        
        if (entity == null) {
            throw new BizException(ErrorCode.CONTENT_NOT_FOUND);
        }
        
        // 组装 DTO
        ContentDTO dto = new ContentDTO();
        dto.setId(entity.getId());
        dto.setType(entity.getType());
        dto.setTitle(entity.getTitle());
        dto.setSummary(entity.getSummary());
        dto.setCoverUrl(entity.getCoverUrl());
        dto.setBody(entity.getBody());
        dto.setSourceType(entity.getSourceType());
        dto.setSourceUrl(entity.getSourceUrl());
        dto.setPublishedAt(entity.getPublishedAt());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // 查询统计信息
        ContentStatsEntity stats = contentStatsMapper.selectByContentId(id);
        if (stats != null) {
            dto.setLikeCount(stats.getLikeCount());
            dto.setFavCount(stats.getFavCount());
            dto.setDownCount(stats.getDownCount());
            dto.setCommentCount(stats.getCommentCount());
            dto.setHotScore(stats.getHotScore());
        }
        
        return dto;
    }
}
