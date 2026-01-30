package com.youthloop.points.persistence.mapper;

import com.youthloop.points.persistence.entity.BadgeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 徽章Mapper
 */
@Mapper
public interface BadgeMapper {
    
    /**
     * 查询指定系列的所有徽章，按sortOrder排序
     */
    List<BadgeEntity> selectBySeries(@Param("series") Integer series);
}
