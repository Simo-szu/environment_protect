package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.PointsLedgerEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 积分账本Mapper
 */
@Mapper
public interface PointsLedgerMapper {
    
    void insert(PointsLedgerEntity entity);
}
