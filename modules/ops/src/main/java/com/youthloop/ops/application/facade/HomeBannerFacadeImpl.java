package com.youthloop.ops.application.facade;

import com.youthloop.ops.api.dto.CreateHomeBannerRequest;
import com.youthloop.ops.api.dto.HomeBannerDTO;
import com.youthloop.ops.api.dto.UpdateHomeBannerRequest;
import com.youthloop.ops.api.facade.HomeBannerFacade;
import com.youthloop.ops.application.service.HomeBannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * 首页轮播 Facade 实现
 */
@Service
@RequiredArgsConstructor
public class HomeBannerFacadeImpl implements HomeBannerFacade {
    
    private final HomeBannerService homeBannerService;
    
    @Override
    public List<HomeBannerDTO> getAllBanners() {
        return homeBannerService.getAllBanners();
    }
    
    @Override
    public List<HomeBannerDTO> getActiveBanners() {
        return homeBannerService.getActiveBanners();
    }
    
    @Override
    public HomeBannerDTO getBannerById(UUID id) {
        return homeBannerService.getBannerById(id);
    }
    
    @Override
    public UUID createBanner(CreateHomeBannerRequest request) {
        return homeBannerService.createBanner(request);
    }
    
    @Override
    public void updateBanner(UUID id, UpdateHomeBannerRequest request) {
        homeBannerService.updateBanner(id, request);
    }
    
    @Override
    public void deleteBanner(UUID id) {
        homeBannerService.deleteBanner(id);
    }
}
