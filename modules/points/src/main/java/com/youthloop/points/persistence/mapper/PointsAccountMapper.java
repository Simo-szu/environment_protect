package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.PointsAccountEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.UUID;

/**
 * 积分账户Mapper
 */
@Mapper
public interface PointsAccountMapper {
    
    PointsAccountEntity selectByUserId(@Param("userId") UUID userId);
    
    void insert(PointsAccountEntity entity);
    
    void updateBalance(@Param("userId") UUID userId, @Param("delta") Integer delta);
    
    /**
     * 带余额检查的原子更新（防止并发超扣）
     * @param userId 用户ID
     * @param delta 变化量（扣除时为负数）
     * @param minBalance 最小余额要求（扣除金额的绝对值）
     * @return 影响行数（0表示余额不足或账户不存在）
     */
    int updateBalanceWithCheck(@Param("userId") UUID userId, @Param("delta") Integer delta, @Param("minBalance") Integer minBalance);
}
