package com.youthloop.content.application.service;

import com.youthloop.content.persistence.entity.ContentStatsEntity;
import com.youthloop.content.persistence.mapper.ContentStatsMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 内容统计更新服务
 * 由 Worker 异步调用，更新统计表
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentStatsUpdateService {
    
    private final ContentStatsMapper contentStatsMapper;
    
    /**
     * 增加点赞数
     */
    @Transactional
    public void incrementLikeCount(UUID contentId) {
        ContentStatsEntity stats = getOrCreateStats(contentId);
        stats.setLikeCount(stats.getLikeCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());
        contentStatsMapper.update(stats);
        log.info("内容点赞数+1: contentId={}, newCount={}", contentId, stats.getLikeCount());
    }
    
    /**
     * 减少点赞数
     */
    @Transactional
    public void decrementLikeCount(UUID contentId) {
        ContentStatsEntity stats = getOrCreateStats(contentId);
        stats.setLikeCount(Math.max(0, stats.getLikeCount() - 1));
        stats.setUpdatedAt(LocalDateTime.now());
        contentStatsMapper.update(stats);
        log.info("内容点赞数-1: contentId={}, newCount={}", contentId, stats.getLikeCount());
    }
    
    /**
     * 增加收藏数
     */
    @Transactional
    public void incrementFavCount(UUID contentId) {
        ContentStatsEntity stats = getOrCreateStats(contentId);
        stats.setFavCount(stats.getFavCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());
        contentStatsMapper.update(stats);
        log.info("内容收藏数+1: contentId={}, newCount={}", contentId, stats.getFavCount());
    }
    
    /**
     * 减少收藏数
     */
    @Transactional
    public void decrementFavCount(UUID contentId) {
        ContentStatsEntity stats = getOrCreateStats(contentId);
        stats.setFavCount(Math.max(0, stats.getFavCount() - 1));
        stats.setUpdatedAt(LocalDateTime.now());
        contentStatsMapper.update(stats);
        log.info("内容收藏数-1: contentId={}, newCount={}", contentId, stats.getFavCount());
    }
    
    /**
     * 增加踩数
     */
    @Transactional
    public void incrementDownCount(UUID contentId) {
        ContentStatsEntity stats = getOrCreateStats(contentId);
        stats.setDownCount(stats.getDownCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());
        contentStatsMapper.update(stats);
        log.info("内容踩数+1: contentId={}, newCount={}", contentId, stats.getDownCount());
    }
    
    /**
     * 减少踩数
     */
    @Transactional
    public void decrementDownCount(UUID contentId) {
        ContentStatsEntity stats = getOrCreateStats(contentId);
        stats.setDownCount(Math.max(0, stats.getDownCount() - 1));
        stats.setUpdatedAt(LocalDateTime.now());
        contentStatsMapper.update(stats);
        log.info("内容踩数-1: contentId={}, newCount={}", contentId, stats.getDownCount());
    }
    
    /**
     * 增加评论数
     */
    @Transactional
    public void incrementCommentCount(UUID contentId) {
        ContentStatsEntity stats = getOrCreateStats(contentId);
        stats.setCommentCount(stats.getCommentCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());
        contentStatsMapper.update(stats);
        log.info("内容评论数+1: contentId={}, newCount={}", contentId, stats.getCommentCount());
    }
    
    /**
     * 减少评论数
     */
    @Transactional
    public void decrementCommentCount(UUID contentId) {
        ContentStatsEntity stats = getOrCreateStats(contentId);
        stats.setCommentCount(Math.max(0, stats.getCommentCount() - 1));
        stats.setUpdatedAt(LocalDateTime.now());
        contentStatsMapper.update(stats);
        log.info("内容评论数-1: contentId={}, newCount={}", contentId, stats.getCommentCount());
    }
    
    // === 私有方法 ===
    
    /**
     * 获取或创建统计记录
     */
    private ContentStatsEntity getOrCreateStats(UUID contentId) {
        ContentStatsEntity stats = contentStatsMapper.selectByContentId(contentId);
        
        if (stats == null) {
            // 如果不存在，创建新记录
            stats = new ContentStatsEntity();
            stats.setContentId(contentId);
            stats.setLikeCount(0);
            stats.setFavCount(0);
            stats.setDownCount(0);
            stats.setCommentCount(0);
            stats.setHotScore(0L);
            stats.setUpdatedAt(LocalDateTime.now());
            contentStatsMapper.insert(stats);
            log.info("创建内容统计记录: contentId={}", contentId);
        }
        
        return stats;
    }
}
