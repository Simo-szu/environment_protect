package com.youthloop.ingestion.persistence.mapper;

import com.youthloop.content.persistence.entity.ContentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ContentBackfillMapper {

    long countCandidates(
        @Param("status") Integer status,
        @Param("sourceType") Integer sourceType,
        @Param("onlyWithoutLocalization") Boolean onlyWithoutLocalization
    );

    List<ContentEntity> selectCandidates(
        @Param("status") Integer status,
        @Param("sourceType") Integer sourceType,
        @Param("onlyWithoutLocalization") Boolean onlyWithoutLocalization,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
}
