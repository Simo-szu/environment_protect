package com.youthloop.ingestion.persistence.mapper;

import com.youthloop.ingestion.persistence.entity.CarbonMarketSyncStateEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * Mapper for social.carbon_market_sync_state.
 */
@Mapper
public interface CarbonMarketSyncStateMapper {

    CarbonMarketSyncStateEntity selectById(int id);

    int markSuccess(CarbonMarketSyncStateEntity entity);

    int markFailure(CarbonMarketSyncStateEntity entity);
}
