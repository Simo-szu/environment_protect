package com.youthloop.query.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * Query mapper for carbon market database-backed homepage data.
 */
@Mapper
public interface CarbonMarketQueryMapper {

    Map<String, Object> selectLatestRealtimeSnapshot();

    List<Map<String, Object>> selectLatestDailyKlines(@Param("limit") Integer limit);
}
