package com.youthloop.ingestion.persistence.mapper;

import com.youthloop.ingestion.persistence.entity.CarbonMarketRealtimeSnapshotEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * Mapper for social.carbon_market_realtime_snapshot.
 */
@Mapper
public interface CarbonMarketRealtimeSnapshotMapper {

    int upsert(CarbonMarketRealtimeSnapshotEntity entity);
}
