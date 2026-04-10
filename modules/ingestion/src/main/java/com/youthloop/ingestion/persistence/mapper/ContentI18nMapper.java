package com.youthloop.ingestion.persistence.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.UUID;

@Mapper
public interface ContentI18nMapper {

    int upsertLocalizedContent(
        @Param("contentId") UUID contentId,
        @Param("locale") String locale,
        @Param("title") String title,
        @Param("summary") String summary,
        @Param("body") String body,
        @Param("isMachineTranslated") boolean isMachineTranslated,
        @Param("translatedAt") LocalDateTime translatedAt
    );
}
