package com.youthloop.activity.application.service;

import com.youthloop.activity.persistence.entity.ActivityStatsEntity;
import com.youthloop.activity.persistence.mapper.ActivityStatsMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动统计更新服务
 * 由 Worker 异步调用，更新统计表
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityStatsUpdateService {
    
    private final ActivityStatsMapper activityStatsMapper;
    
    /**
     * 增加点赞数
     */
    @Transactional
    public void incrementLikeCount(UUID activityId) {
        ActivityStatsEntity stats = getOrCreateStats(activityId);
        stats.setLikeCount(stats.getLikeCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());
        activityStatsMapper.update(stats);
        log.info("活动点赞数+1: activityId={}, newCount={}", activityId, stats.getLikeCount());
    }
    
    /**
     * 减少点赞数
     */
    @Transactional
    public void decrementLikeCount(UUID activityId) {
        ActivityStatsEntity stats = getOrCreateStats(activityId);
        stats.setLikeCount(Math.max(0, stats.getLikeCount() - 1));
        stats.setUpdatedAt(LocalDateTime.now());
        activityStatsMapper.update(stats);
        log.info("活动点赞数-1: activityId={}, newCount={}", activityId, stats.getLikeCount());
    }
    
    /**
     * 增加收藏数
     */
    @Transactional
    public void incrementFavCount(UUID activityId) {
        ActivityStatsEntity stats = getOrCreateStats(activityId);
        stats.setFavCount(stats.getFavCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());
        activityStatsMapper.update(stats);
        log.info("活动收藏数+1: activityId={}, newCount={}", activityId, stats.getFavCount());
    }
    
    /**
     * 减少收藏数
     */
    @Transactional
    public void decrementFavCount(UUID activityId) {
        ActivityStatsEntity stats = getOrCreateStats(activityId);
        stats.setFavCount(Math.max(0, stats.getFavCount() - 1));
        stats.setUpdatedAt(LocalDateTime.now());
        activityStatsMapper.update(stats);
        log.info("活动收藏数-1: activityId={}, newCount={}", activityId, stats.getFavCount());
    }
    
    /**
     * 增加踩数
     */
    @Transactional
    public void incrementDownCount(UUID activityId) {
        ActivityStatsEntity stats = getOrCreateStats(activityId);
        stats.setDownCount(stats.getDownCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());
        activityStatsMapper.update(stats);
        log.info("活动踩数+1: activityId={}, newCount={}", activityId, stats.getDownCount());
    }
    
    /**
     * 减少踩数
     */
    @Transactional
    public void decrementDownCount(UUID activityId) {
        ActivityStatsEntity stats = getOrCreateStats(activityId);
        stats.setDownCount(Math.max(0, stats.getDownCount() - 1));
        stats.setUpdatedAt(LocalDateTime.now());
        activityStatsMapper.update(stats);
        log.info("活动踩数-1: activityId={}, newCount={}", activityId, stats.getDownCount());
    }
    
    /**
     * 增加评论数
     */
    @Transactional
    public void incrementCommentCount(UUID activityId) {
        ActivityStatsEntity stats = getOrCreateStats(activityId);
        stats.setCommentCount(stats.getCommentCount() + 1);
        stats.setUpdatedAt(LocalDateTime.now());
        activityStatsMapper.update(stats);
        log.info("活动评论数+1: activityId={}, newCount={}", activityId, stats.getCommentCount());
    }
    
    /**
     * 减少评论数
     */
    @Transactional
    public void decrementCommentCount(UUID activityId) {
        ActivityStatsEntity stats = getOrCreateStats(activityId);
        stats.setCommentCount(Math.max(0, stats.getCommentCount() - 1));
        stats.setUpdatedAt(LocalDateTime.now());
        activityStatsMapper.update(stats);
        log.info("活动评论数-1: activityId={}, newCount={}", activityId, stats.getCommentCount());
    }
    
    // === 私有方法 ===
    
    /**
     * 获取或创建统计记录
     */
    private ActivityStatsEntity getOrCreateStats(UUID activityId) {
        ActivityStatsEntity stats = activityStatsMapper.selectByActivityId(activityId);
        
        if (stats == null) {
            // 如果不存在，创建新记录
            stats = new ActivityStatsEntity();
            stats.setActivityId(activityId);
            stats.setLikeCount(0);
            stats.setFavCount(0);
            stats.setDownCount(0);
            stats.setCommentCount(0);
            stats.setHotScore(0L);
            stats.setUpdatedAt(LocalDateTime.now());
            activityStatsMapper.insert(stats);
            log.info("创建活动统计记录: activityId={}", activityId);
        }
        
        return stats;
    }
}
