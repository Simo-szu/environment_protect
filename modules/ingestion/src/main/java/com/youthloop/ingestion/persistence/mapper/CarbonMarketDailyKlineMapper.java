package com.youthloop.ingestion.persistence.mapper;

import com.youthloop.ingestion.persistence.entity.CarbonMarketDailyKlineEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper for social.carbon_market_daily_kline.
 */
@Mapper
public interface CarbonMarketDailyKlineMapper {

    int upsertBatch(@Param("items") List<CarbonMarketDailyKlineEntity> items);
}
