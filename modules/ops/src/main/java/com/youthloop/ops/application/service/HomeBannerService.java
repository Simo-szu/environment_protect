package com.youthloop.ops.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.ops.api.dto.CreateHomeBannerRequest;
import com.youthloop.ops.api.dto.HomeBannerDTO;
import com.youthloop.ops.api.dto.UpdateHomeBannerRequest;
import com.youthloop.ops.persistence.entity.HomeBannerEntity;
import com.youthloop.ops.persistence.mapper.HomeBannerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 首页轮播服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HomeBannerService {
    
    private final HomeBannerMapper homeBannerMapper;
    
    /**
     * 查询所有轮播（管理端）
     */
    @Transactional(readOnly = true)
    public List<HomeBannerDTO> getAllBanners() {
        List<HomeBannerEntity> entities = homeBannerMapper.selectAll();
        return entities.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 查询启用的轮播（用户端）
     */
    @Transactional(readOnly = true)
    public List<HomeBannerDTO> getActiveBanners() {
        List<HomeBannerEntity> entities = homeBannerMapper.selectActive();
        return entities.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 根据 ID 查询
     */
    @Transactional(readOnly = true)
    public HomeBannerDTO getBannerById(UUID id) {
        HomeBannerEntity entity = homeBannerMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "轮播不存在");
        }
        return toDTO(entity);
    }
    
    /**
     * 创建轮播
     */
    @Transactional
    public UUID createBanner(CreateHomeBannerRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        HomeBannerEntity entity = new HomeBannerEntity();
        entity.setId(UUID.randomUUID());
        entity.setTitle(request.getTitle());
        entity.setImageUrl(request.getImageUrl());
        entity.setLinkType(request.getLinkType());
        entity.setLinkTarget(request.getLinkTarget());
        entity.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        entity.setIsEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : true);
        entity.setStartAt(request.getStartAt());
        entity.setEndAt(request.getEndAt());
        entity.setCreatedBy(currentUserId);
        entity.setUpdatedBy(currentUserId);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        homeBannerMapper.insert(entity);
        
        log.info("创建轮播成功: id={}, title={}, createdBy={}", entity.getId(), entity.getTitle(), currentUserId);
        return entity.getId();
    }
    
    /**
     * 更新轮播
     */
    @Transactional
    public void updateBanner(UUID id, UpdateHomeBannerRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        HomeBannerEntity entity = homeBannerMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "轮播不存在");
        }
        
        // 更新字段（只更新非 null 的字段）
        if (request.getTitle() != null) {
            entity.setTitle(request.getTitle());
        }
        if (request.getImageUrl() != null) {
            entity.setImageUrl(request.getImageUrl());
        }
        if (request.getLinkType() != null) {
            entity.setLinkType(request.getLinkType());
        }
        if (request.getLinkTarget() != null) {
            entity.setLinkTarget(request.getLinkTarget());
        }
        if (request.getSortOrder() != null) {
            entity.setSortOrder(request.getSortOrder());
        }
        if (request.getIsEnabled() != null) {
            entity.setIsEnabled(request.getIsEnabled());
        }
        if (request.getStartAt() != null) {
            entity.setStartAt(request.getStartAt());
        }
        if (request.getEndAt() != null) {
            entity.setEndAt(request.getEndAt());
        }
        
        entity.setUpdatedBy(currentUserId);
        entity.setUpdatedAt(LocalDateTime.now());
        
        homeBannerMapper.update(entity);
        
        log.info("更新轮播成功: id={}, updatedBy={}", id, currentUserId);
    }
    
    /**
     * 删除轮播
     */
    @Transactional
    public void deleteBanner(UUID id) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        HomeBannerEntity entity = homeBannerMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "轮播不存在");
        }
        
        homeBannerMapper.deleteById(id);
        
        log.info("删除轮播成功: id={}, deletedBy={}", id, currentUserId);
    }
    
    // === 私有方法 ===
    
    private HomeBannerDTO toDTO(HomeBannerEntity entity) {
        HomeBannerDTO dto = new HomeBannerDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setImageUrl(entity.getImageUrl());
        dto.setLinkType(entity.getLinkType());
        dto.setLinkTarget(entity.getLinkTarget());
        dto.setSortOrder(entity.getSortOrder());
        dto.setIsEnabled(entity.getIsEnabled());
        dto.setStartAt(entity.getStartAt());
        dto.setEndAt(entity.getEndAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
