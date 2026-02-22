package com.youthloop.ingestion.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.ingestion.api.dto.IngestionSettingsDTO;
import com.youthloop.ingestion.api.dto.UpdateIngestionSettingsRequest;
import com.youthloop.ingestion.persistence.entity.IngestionConfigEntity;
import com.youthloop.ingestion.persistence.mapper.IngestionConfigMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

/**
 * Service for ingestion settings persistence and validation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IngestionSettingsService {

    private static final int SINGLETON_ID = 1;

    private final IngestionConfigMapper ingestionConfigMapper;

    @Transactional(readOnly = true)
    public IngestionSettingsDTO getSettings() {
        IngestionConfigEntity entity = ingestionConfigMapper.selectCurrent();
        if (entity == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "Ingestion settings not found");
        }
        return toDto(entity);
    }

    @Transactional
    public IngestionSettingsDTO updateSettings(UpdateIngestionSettingsRequest request) {
        validateRequest(request);

        UUID currentUserId = SecurityUtil.getCurrentUserId();
        OffsetDateTime now = OffsetDateTime.now();

        IngestionConfigEntity entity = toEntity(request);
        entity.setId(SINGLETON_ID);
        entity.setUpdatedBy(currentUserId);
        entity.setUpdatedAt(now);

        int updated = ingestionConfigMapper.updateById(entity);
        if (updated == 0) {
            entity.setCreatedBy(currentUserId);
            entity.setCreatedAt(now);
            ingestionConfigMapper.insert(entity);
        }

        log.info("Updated ingestion settings by user={}", currentUserId);
        return getSettings();
    }

    private void validateRequest(UpdateIngestionSettingsRequest request) {
        try {
            CronExpression.parse(request.getCron());
        } catch (Exception ex) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Invalid cron expression");
        }

        try {
            ZoneId.of(request.getZone());
        } catch (Exception ex) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Invalid time zone");
        }
    }

    private IngestionSettingsDTO toDto(IngestionConfigEntity entity) {
        IngestionSettingsDTO dto = new IngestionSettingsDTO();
        dto.setCron(entity.getCron());
        dto.setZone(entity.getZoneId());
        dto.setEnabled(Boolean.TRUE.equals(entity.getIsEnabled()));
        dto.setPublishStatus(entity.getPublishStatus());
        dto.setRequestTimeoutMs(entity.getRequestTimeoutMs());
        dto.setRequestIntervalMs(entity.getRequestIntervalMs());

        IngestionSettingsDTO.SourceSettings earth = new IngestionSettingsDTO.SourceSettings();
        earth.setEnabled(Boolean.TRUE.equals(entity.getEarthEnabled()));
        earth.setMaxPages(entity.getEarthMaxPages());
        earth.setMaxArticles(entity.getEarthMaxArticles());
        dto.setEarth(earth);

        IngestionSettingsDTO.SourceSettings ecoepn = new IngestionSettingsDTO.SourceSettings();
        ecoepn.setEnabled(Boolean.TRUE.equals(entity.getEcoepnEnabled()));
        ecoepn.setMaxPages(entity.getEcoepnMaxPages());
        ecoepn.setMaxArticles(entity.getEcoepnMaxArticles());
        dto.setEcoepn(ecoepn);

        return dto;
    }

    private IngestionConfigEntity toEntity(UpdateIngestionSettingsRequest request) {
        IngestionConfigEntity entity = new IngestionConfigEntity();
        entity.setCron(request.getCron());
        entity.setZoneId(request.getZone());
        entity.setIsEnabled(request.getEnabled());
        entity.setPublishStatus(request.getPublishStatus());
        entity.setRequestTimeoutMs(request.getRequestTimeoutMs());
        entity.setRequestIntervalMs(request.getRequestIntervalMs());
        entity.setEarthEnabled(request.getEarth().getEnabled());
        entity.setEarthMaxPages(request.getEarth().getMaxPages());
        entity.setEarthMaxArticles(request.getEarth().getMaxArticles());
        entity.setEcoepnEnabled(request.getEcoepn().getEnabled());
        entity.setEcoepnMaxPages(request.getEcoepn().getMaxPages());
        entity.setEcoepnMaxArticles(request.getEcoepn().getMaxArticles());
        return entity;
    }
}
