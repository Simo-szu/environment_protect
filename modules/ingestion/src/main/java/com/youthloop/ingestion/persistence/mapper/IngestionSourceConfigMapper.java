package com.youthloop.ingestion.persistence.mapper;

import com.youthloop.ingestion.persistence.entity.IngestionSourceConfigEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper for social.ingestion_source_config.
 */
@Mapper
public interface IngestionSourceConfigMapper {

    List<IngestionSourceConfigEntity> selectAll();

    IngestionSourceConfigEntity selectBySourceKey(@Param("sourceKey") String sourceKey);

    int upsert(IngestionSourceConfigEntity entity);
}

