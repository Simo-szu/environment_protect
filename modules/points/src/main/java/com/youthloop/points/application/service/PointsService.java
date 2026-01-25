package com.youthloop.points.application.service;

import com.youthloop.common.api.PageResponse;
import com.youthloop.points.api.dto.PointsLedgerDTO;
import com.youthloop.points.persistence.entity.PointsAccountEntity;
import com.youthloop.points.persistence.entity.PointsLedgerEntity;
import com.youthloop.points.persistence.mapper.PointsAccountMapper;
import com.youthloop.points.persistence.mapper.PointsLedgerMapper;
import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.List;
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
     * 获取积分流水
     */
    public PageResponse<PointsLedgerDTO> getLedger(UUID userId, int page, int size) {
        if (page < 1) page = 1;
        if (size < 1) size = 20;
        int offset = (page - 1) * size;
        
        Long total = pointsLedgerMapper.countByUserId(userId);
        if (total == 0) {
            return PageResponse.of(new ArrayList<>(), 0L, page, size);
        }
        
        List<PointsLedgerEntity> entities = pointsLedgerMapper.selectByUserId(userId, offset, size);
        List<PointsLedgerDTO> items = entities.stream().map(e -> PointsLedgerDTO.builder()
            .id(e.getId())
            .userId(e.getUserId())
            .amount(e.getDelta())
            .reason(e.getReason())
            .reasonDesc(getReasonDesc(e.getReason()))
            .memo(e.getMemo())
            .createdAt(e.getCreatedAt())
            .balance(0L) // 暂无流水余额快照
            .sourceType(getSourceType(e.getRefType() != null ? e.getRefType() : e.getReason())) // 暂时若refType为空则用reason回退
            .sourceId(e.getRefId())
            .build()
        ).toList();
        
        return PageResponse.of(items, total, page, size);
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

    private String getReasonDesc(Integer code) {
        if (code == null) return "未知";
        return switch (code) {
            case 1 -> "签到";
            case 2 -> "任务";
            case 3 -> "问答";
            case 4 -> "管理员调整";
            case 5 -> "其他";
            default -> "未知";
        };
    }

    private String getSourceType(Integer type) {
        if (type == null) return "UNKNOWN";
        return switch (type) {
            case 1 -> "SIGNIN";
            case 2 -> "TASK";
            case 3 -> "QUIZ";
            case 4 -> "ADMIN";
            case 5 -> "OTHER";
            default -> "UNKNOWN";
        };
    }
}
