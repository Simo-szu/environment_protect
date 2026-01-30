package com.youthloop.points.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.youthloop.points.persistence.entity.BadgeEntity;
import com.youthloop.points.persistence.mapper.BadgeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 等级服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LevelService {
    
    private final BadgeMapper badgeMapper;
    
    /**
     * 根据积分余额计算用户等级
     * 
     * @param balance 积分余额
     * @return 等级数字（从1开始）
     */
    @Transactional(readOnly = true)
    public int calculateLevel(Long balance) {
        List<BadgeEntity> badges = badgeMapper.selectBySeries(1); // 1=积分等级系列
        
        if (badges == null || badges.isEmpty()) {
            return 1;
        }
        
        int level = 1;
        for (BadgeEntity badge : badges) {
            JsonNode threshold = badge.getThreshold();
            if (threshold != null && threshold.has("balanceGte")) {
                long requiredBalance = threshold.get("balanceGte").asLong();
                if (balance >= requiredBalance) {
                    level = badge.getSortOrder();
                }
            }
        }
        
        return level;
    }
    
    /**
     * 计算距离下一级所需积分
     * 
     * @param balance 当前积分余额
     * @return 距离下一级所需积分，如果已是最高级返回0
     */
    @Transactional(readOnly = true)
    public long calculatePointsToNextLevel(Long balance) {
        List<BadgeEntity> badges = badgeMapper.selectBySeries(1);
        
        if (badges == null || badges.isEmpty()) {
            return 100; // 默认下一级需要100积分
        }
        
        // 找到第一个大于当前积分的等级阈值
        for (BadgeEntity badge : badges) {
            JsonNode threshold = badge.getThreshold();
            if (threshold != null && threshold.has("balanceGte")) {
                long requiredBalance = threshold.get("balanceGte").asLong();
                if (balance < requiredBalance) {
                    return requiredBalance - balance;
                }
            }
        }
        
        // 已经是最高级
        return 0;
    }
    
    /**
     * 获取指定等级的最低积分要求
     * 
     * @param level 等级
     * @return 该等级的最低积分，如果等级不存在返回0
     */
    @Transactional(readOnly = true)
    public long getLevelMinPoints(int level) {
        List<BadgeEntity> badges = badgeMapper.selectBySeries(1);
        
        if (badges == null || badges.isEmpty()) {
            return 0;
        }
        
        for (BadgeEntity badge : badges) {
            if (badge.getSortOrder() == level) {
                JsonNode threshold = badge.getThreshold();
                if (threshold != null && threshold.has("balanceGte")) {
                    return threshold.get("balanceGte").asLong();
                }
            }
        }
        
        return 0;
    }
}
