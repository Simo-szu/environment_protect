package com.youthloop.social.api.web.controller.query;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.security.OptionalAuth;
import com.youthloop.ops.api.dto.HomeBannerDTO;
import com.youthloop.ops.api.facade.HomeBannerFacade;
import com.youthloop.query.dto.HomeDTO;
import com.youthloop.query.facade.QueryFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 首页查询 Controller
 * 聚合查询：轮播 + 最新内容 + 最新活动
 */
@Tag(name = "首页", description = "首页聚合查询")
@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
@OptionalAuth
public class HomeQueryController {
    
    private final QueryFacade queryFacade;
    private final HomeBannerFacade homeBannerFacade;
    
    @Operation(summary = "获取首页数据", description = "聚合查询：轮播配置 + 最新内容 + 最新活动")
    @GetMapping
    public BaseResponse<HomeDTO> getHomeData() {
        HomeDTO data = queryFacade.getHomeData();
        return BaseResponse.success(data);
    }
    
    @Operation(summary = "获取轮播列表", description = "查询启用且有效期内的轮播配置")
    @GetMapping("/banners")
    public BaseResponse<List<HomeBannerDTO>> getActiveBanners() {
        List<HomeBannerDTO> banners = homeBannerFacade.getActiveBanners();
        return BaseResponse.success(banners);
    }
}
