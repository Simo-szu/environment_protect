package com.youthloop.points.application.service;

import com.youthloop.points.persistence.entity.PointsAccountEntity;
import com.youthloop.points.persistence.entity.PointsLedgerEntity;
import com.youthloop.points.persistence.mapper.PointsAccountMapper;
import com.youthloop.points.persistence.mapper.PointsLedgerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 积分服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PointsService {
    
    private final PointsAccountMapper pointsAccountMapper;
    private final PointsLedgerMapper pointsLedgerMapper;
    
    /**
     * 增加积分
     */
    @Transactional
    public void addPoints(UUID userId, Integer delta, Integer reason, Integer refType, UUID refId, String memo) {
        if (delta <= 0) {
            throw new IllegalArgumentException("积分增量必须大于0");
        }
        
        // 确保账户存在
        ensureAccountExists(userId);
        
        // 更新账户余额
        pointsAccountMapper.updateBalance(userId, delta);
        
        // 记录账本
        PointsLedgerEntity ledger = new PointsLedgerEntity();
        ledger.setId(UUID.randomUUID());
        ledger.setUserId(userId);
        ledger.setDelta(delta);
        ledger.setReason(reason);
        ledger.setRefType(refType);
        ledger.setRefId(refId);
        ledger.setMemo(memo);
        ledger.setCreatedAt(LocalDateTime.now());
        
        pointsLedgerMapper.insert(ledger);
        
        log.info("积分增加: userId={}, delta={}, reason={}, memo={}", userId, delta, reason, memo);
    }
    
    /**
     * 扣除积分
     */
    @Transactional
    public void deductPoints(UUID userId, Integer amount, Integer reason, Integer refType, UUID refId, String memo) {
        if (amount <= 0) {
            throw new IllegalArgumentException("扣除金额必须大于0");
        }
        
        // 检查余额
        Long balance = getBalance(userId);
        if (balance < amount) {
            throw new IllegalStateException("积分余额不足");
        }
        
        // 更新账户余额(负数)
        pointsAccountMapper.updateBalance(userId, -amount);
        
        // 记录账本(负数)
        PointsLedgerEntity ledger = new PointsLedgerEntity();
        ledger.setId(UUID.randomUUID());
        ledger.setUserId(userId);
        ledger.setDelta(-amount);
        ledger.setReason(reason);
        ledger.setRefType(refType);
        ledger.setRefId(refId);
        ledger.setMemo(memo);
        ledger.setCreatedAt(LocalDateTime.now());
        
        pointsLedgerMapper.insert(ledger);
        
        log.info("积分扣除: userId={}, amount={}, reason={}, memo={}", userId, amount, reason, memo);
    }
    
    /**
     * 获取用户积分余额
     */
    public Long getBalance(UUID userId) {
        PointsAccountEntity account = pointsAccountMapper.selectByUserId(userId);
        return account != null ? account.getBalance() : 0L;
    }
    
    /**
     * 确保账户存在
     */
    private void ensureAccountExists(UUID userId) {
        PointsAccountEntity existing = pointsAccountMapper.selectByUserId(userId);
        if (existing == null) {
            PointsAccountEntity account = new PointsAccountEntity();
            account.setUserId(userId);
            account.setBalance(0L);
            account.setUpdatedAt(LocalDateTime.now());
            pointsAccountMapper.insert(account);
            log.info("创建积分账户: userId={}", userId);
        }
    }
}
