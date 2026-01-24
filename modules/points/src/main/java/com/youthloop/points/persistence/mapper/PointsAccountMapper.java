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
}
