package com.youthloop.ingestion.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.ingestion.api.dto.IngestionSettingsDTO;
import com.youthloop.ingestion.api.dto.UpdateIngestionSettingsRequest;
import com.youthloop.ingestion.persistence.entity.IngestionConfigEntity;
import com.youthloop.ingestion.persistence.entity.IngestionSourceConfigEntity;
import com.youthloop.ingestion.persistence.mapper.IngestionConfigMapper;
import com.youthloop.ingestion.persistence.mapper.IngestionSourceConfigMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
    private final IngestionSourceConfigMapper ingestionSourceConfigMapper;

    @Transactional(readOnly = true)
    public IngestionSettingsDTO getSettings() {
        IngestionConfigEntity entity = ingestionConfigMapper.selectCurrent();
        if (entity == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "Ingestion settings not found");
        }
        List<IngestionSourceConfigEntity> sourceEntities = ingestionSourceConfigMapper.selectAll();
        return toDto(entity, sourceEntities);
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
        upsertSourceConfigs(request, now);

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

        if (request.getSources() == null) {
            return;
        }
        for (Map.Entry<String, UpdateIngestionSettingsRequest.SourceSettingsRequest> entry : request.getSources().entrySet()) {
            String sourceKey = entry.getKey();
            UpdateIngestionSettingsRequest.SourceSettingsRequest source = entry.getValue();
            if (sourceKey == null || sourceKey.isBlank()) {
                throw new BizException(ErrorCode.INVALID_PARAMETER, "Source key must not be blank");
            }
            if (source == null) {
                throw new BizException(ErrorCode.INVALID_PARAMETER, "Source settings must not be null: " + sourceKey);
            }
        }
    }

    private IngestionSettingsDTO toDto(IngestionConfigEntity entity, List<IngestionSourceConfigEntity> sourceEntities) {
        IngestionSettingsDTO dto = new IngestionSettingsDTO();
        dto.setCron(entity.getCron());
        dto.setZone(entity.getZoneId());
        dto.setEnabled(Boolean.TRUE.equals(entity.getIsEnabled()));
        dto.setPublishStatus(entity.getPublishStatus());
        dto.setRequestTimeoutMs(entity.getRequestTimeoutMs());
        dto.setRequestIntervalMs(entity.getRequestIntervalMs());

        Map<String, IngestionSettingsDTO.SourceSettings> sources = new LinkedHashMap<>();
        for (IngestionSourceConfigEntity sourceEntity : sourceEntities) {
            sources.put(sourceEntity.getSourceKey(), mapSourceToDto(sourceEntity));
        }
        ensureLegacySources(entity, sources);
        dto.setSources(sources);
        dto.setEarth(sources.get("earth"));
        dto.setEcoepn(sources.get("ecoepn"));

        return dto;
    }

    private void ensureLegacySources(
        IngestionConfigEntity entity,
        Map<String, IngestionSettingsDTO.SourceSettings> sources
    ) {
        if (!sources.containsKey("earth")) {
            IngestionSettingsDTO.SourceSettings earth = new IngestionSettingsDTO.SourceSettings();
            earth.setEnabled(Boolean.TRUE.equals(entity.getEarthEnabled()));
            earth.setMaxPages(entity.getEarthMaxPages());
            earth.setMaxArticles(entity.getEarthMaxArticles());
            sources.put("earth", earth);
        }
        if (!sources.containsKey("ecoepn")) {
            IngestionSettingsDTO.SourceSettings ecoepn = new IngestionSettingsDTO.SourceSettings();
            ecoepn.setEnabled(Boolean.TRUE.equals(entity.getEcoepnEnabled()));
            ecoepn.setMaxPages(entity.getEcoepnMaxPages());
            ecoepn.setMaxArticles(entity.getEcoepnMaxArticles());
            sources.put("ecoepn", ecoepn);
        }
    }

    private IngestionSettingsDTO.SourceSettings mapSourceToDto(IngestionSourceConfigEntity entity) {
        IngestionSettingsDTO.SourceSettings source = new IngestionSettingsDTO.SourceSettings();
        source.setEnabled(Boolean.TRUE.equals(entity.getIsEnabled()));
        source.setMaxPages(entity.getMaxPages());
        source.setMaxArticles(entity.getMaxArticles());
        source.setRequestIntervalMs(entity.getRequestIntervalMs());
        source.setContentType(entity.getContentType());
        source.setPlacement(entity.getPlacement());
        return source;
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

    private void upsertSourceConfigs(UpdateIngestionSettingsRequest request, OffsetDateTime now) {
        Map<String, UpdateIngestionSettingsRequest.SourceSettingsRequest> merged = new LinkedHashMap<>();
        merged.put("earth", request.getEarth());
        merged.put("ecoepn", request.getEcoepn());
        if (request.getSources() != null) {
            request.getSources().forEach((key, value) -> {
                if (key != null && !key.isBlank() && value != null) {
                    merged.put(key, value);
                }
            });
        }

        for (Map.Entry<String, UpdateIngestionSettingsRequest.SourceSettingsRequest> entry : merged.entrySet()) {
            IngestionSourceConfigEntity sourceEntity = new IngestionSourceConfigEntity();
            sourceEntity.setSourceKey(entry.getKey().trim());
            sourceEntity.setIsEnabled(entry.getValue().getEnabled());
            sourceEntity.setMaxPages(entry.getValue().getMaxPages());
            sourceEntity.setMaxArticles(entry.getValue().getMaxArticles());
            sourceEntity.setRequestIntervalMs(entry.getValue().getRequestIntervalMs());
            sourceEntity.setContentType(entry.getValue().getContentType());
            sourceEntity.setPlacement(entry.getValue().getPlacement());
            sourceEntity.setUpdatedAt(now);
            ingestionSourceConfigMapper.upsert(sourceEntity);
        }
    }
}
