package com.youthloop.content.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.content.application.dto.CreateContentRequest;
import com.youthloop.content.application.dto.UpdateContentRequest;
import com.youthloop.content.persistence.entity.ContentEntity;
import com.youthloop.content.persistence.entity.ContentStatsEntity;
import com.youthloop.content.persistence.mapper.ContentMapper;
import com.youthloop.content.persistence.mapper.ContentStatsMapper;
import com.youthloop.event.application.service.OutboxEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 内容命令服务（写操作）
 * 
 * 事务边界：Application 层负责事务管理
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentCommandService {
    
    private final ContentMapper contentMapper;
    private final ContentStatsMapper contentStatsMapper;
    private final OutboxEventService outboxEventService;
    
    /**
     * 创建内容
     */
    @Transactional
    public UUID createContent(CreateContentRequest request) {
        log.info("创建内容: type={}, title={}, status={}", 
            request.getType(), request.getTitle(), request.getStatus());
        
        // 校验来源 URL 唯一性（如果提供）
        if (request.getSourceUrl() != null && !request.getSourceUrl().isEmpty()) {
            // TODO: 添加唯一性校验（需要在 Mapper 中添加 selectBySourceUrl 方法）
        }
        
        // 构建实体
        ContentEntity entity = new ContentEntity();
        entity.setId(UUID.randomUUID());
        entity.setType(request.getType());
        entity.setTitle(request.getTitle());
        entity.setSummary(request.getSummary());
        entity.setCoverUrl(request.getCoverUrl());
        entity.setBody(request.getBody());
        entity.setSourceType(request.getSourceType());
        entity.setSourceUrl(request.getSourceUrl());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : 2); // 默认草稿
        
        // 如果状态是已发布，设置发布时间
        if (entity.getStatus() == 1) {
            entity.setPublishedAt(LocalDateTime.now());
        }
        
        LocalDateTime now = LocalDateTime.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        
        // 插入内容
        int rows = contentMapper.insert(entity);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "创建内容失败");
        }
        
        // 同步创建统计记录（避免列表查询时 stats 为空）
        ContentStatsEntity stats = new ContentStatsEntity();
        stats.setContentId(entity.getId());
        stats.setLikeCount(0);
        stats.setFavCount(0);
        stats.setDownCount(0);
        stats.setCommentCount(0);
        stats.setHotScore(0L);
        stats.setUpdatedAt(now);
        
        contentStatsMapper.insert(stats);
        
        // 发布 Outbox 事件
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("contentId", entity.getId().toString());
        eventPayload.put("type", entity.getType());
        eventPayload.put("title", entity.getTitle());
        eventPayload.put("status", entity.getStatus());
        outboxEventService.publishEvent("CONTENT_CREATED", eventPayload);
        
        log.info("内容创建成功: id={}", entity.getId());
        return entity.getId();
    }
    
    /**
     * 更新内容
     */
    @Transactional
    public void updateContent(UUID contentId, UpdateContentRequest request) {
        log.info("更新内容: id={}", contentId);
        
        // 查询现有内容
        ContentEntity existing = contentMapper.selectById(contentId);
        if (existing == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "内容不存在");
        }
        
        // 更新字段
        ContentEntity entity = new ContentEntity();
        entity.setId(contentId);
        
        if (request.getType() != null) {
            entity.setType(request.getType());
        }
        if (request.getTitle() != null) {
            entity.setTitle(request.getTitle());
        }
        if (request.getSummary() != null) {
            entity.setSummary(request.getSummary());
        }
        if (request.getCoverUrl() != null) {
            entity.setCoverUrl(request.getCoverUrl());
        }
        if (request.getBody() != null) {
            entity.setBody(request.getBody());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
            
            // 如果从草稿变为已发布，设置发布时间
            if (request.getStatus() == 1 && existing.getPublishedAt() == null) {
                entity.setPublishedAt(LocalDateTime.now());
            }
        }
        
        entity.setUpdatedAt(LocalDateTime.now());
        
        int rows = contentMapper.update(entity);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "更新内容失败");
        }
        
        // 发布 Outbox 事件
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("contentId", contentId.toString());
        if (request.getStatus() != null) {
            eventPayload.put("status", request.getStatus());
        }
        outboxEventService.publishEvent("CONTENT_UPDATED", eventPayload);
        
        log.info("内容更新成功: id={}", contentId);
    }
    
    /**
     * 发布内容（将草稿变为已发布）
     */
    @Transactional
    public void publishContent(UUID contentId) {
        log.info("发布内容: id={}", contentId);
        
        ContentEntity existing = contentMapper.selectById(contentId);
        if (existing == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "内容不存在");
        }
        
        if (existing.getStatus() == 1) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "内容已发布");
        }
        
        ContentEntity entity = new ContentEntity();
        entity.setId(contentId);
        entity.setStatus(1); // 已发布
        entity.setPublishedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        int rows = contentMapper.update(entity);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "发布内容失败");
        }
        
        log.info("内容发布成功: id={}", contentId);
    }
    
    /**
     * 删除内容（物理删除）
     */
    @Transactional
    public void deleteContent(UUID contentId) {
        log.info("删除内容: id={}", contentId);
        
        ContentEntity existing = contentMapper.selectById(contentId);
        if (existing == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "内容不存在");
        }
        
        // 删除内容（stats 会因为外键级联删除）
        int rows = contentMapper.deleteById(contentId);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "删除内容失败");
        }
        
        log.info("内容删除成功: id={}", contentId);
    }
}
