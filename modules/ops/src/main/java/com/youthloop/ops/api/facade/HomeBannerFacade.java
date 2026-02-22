package com.youthloop.ops.api.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.ops.api.dto.CreateHomeBannerRequest;
import com.youthloop.ops.api.dto.HomeBannerDTO;
import com.youthloop.ops.api.dto.UpdateHomeBannerRequest;

import java.util.List;
import java.util.UUID;

/**
 * 首页轮播 Facade（对外契约）
 */
public interface HomeBannerFacade {

    /**
     * 查询所有轮播（管理端，分页）
     */
    PageResponse<HomeBannerDTO> getAllBanners(int page, int size);
    
    /**
     * 查询启用的轮播（用户端）
     */
    List<HomeBannerDTO> getActiveBanners();
    
    /**
     * 根据 ID 查询
     */
    HomeBannerDTO getBannerById(UUID id);
    
    /**
     * 创建轮播
     */
    UUID createBanner(CreateHomeBannerRequest request);
    
    /**
     * 更新轮播
     */
    void updateBanner(UUID id, UpdateHomeBannerRequest request);
    
    /**
     * 删除轮播
     */
    void deleteBanner(UUID id);
}
