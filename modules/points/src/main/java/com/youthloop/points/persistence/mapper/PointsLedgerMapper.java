package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.PointsLedgerEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.UUID;

/**
 * 积分账本Mapper
 */
@Mapper
public interface PointsLedgerMapper {
    
    void insert(PointsLedgerEntity entity);
    
    List<PointsLedgerEntity> selectByUserId(@Param("userId") UUID userId, @Param("offset") int offset, @Param("limit") int limit);
    
    Long countByUserId(@Param("userId") UUID userId);
}
