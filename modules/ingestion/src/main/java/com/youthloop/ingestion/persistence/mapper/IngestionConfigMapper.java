package com.youthloop.ingestion.persistence.mapper;

import com.youthloop.ingestion.persistence.entity.IngestionConfigEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * Mapper for social.ingestion_config.
 */
@Mapper
public interface IngestionConfigMapper {

    IngestionConfigEntity selectCurrent();

    int insert(IngestionConfigEntity entity);

    int updateById(IngestionConfigEntity entity);
}
