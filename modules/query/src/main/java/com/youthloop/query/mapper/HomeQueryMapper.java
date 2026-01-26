package com.youthloop.query.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 首页查询 Mapper（只读）
 */
@Mapper
public interface HomeQueryMapper {
    
    /**
     * 查询启用的轮播/运营位
     * 
     * @return 轮播列表（按 sort_order 排序）
     */
    List<Map<String, Object>> selectActiveBanners();
    
    /**
     * 查询最新活动（首页用）
     * 
     * @param locale 语言代码
     * @param limit 限制数量
     * @return 活动列表
     */
    List<Map<String, Object>> selectLatestActivities(
        @Param("locale") String locale,
        @Param("limit") Integer limit
    );
}
