package com.youthloop.social.api.web.controller.query;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.OptionalAuth;
import com.youthloop.ops.api.dto.HomeBannerDTO;
import com.youthloop.ops.api.facade.HomeBannerFacade;
import com.youthloop.query.dto.HomeDTO;
import com.youthloop.query.facade.QueryFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "首页", description = "首页聚合查询")
@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
@OptionalAuth
public class HomeQueryController {

    private final QueryFacade queryFacade;
    private final HomeBannerFacade homeBannerFacade;

    @Operation(summary = "获取首页数据", description = "聚合查询首页数据")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<HomeDTO> getHomeData() {
        HomeDTO data = queryFacade.getHomeData();
        return ApiSpecResponse.ok(data);
    }

    @Operation(summary = "获取轮播列表", description = "查询启用且有效期内轮播配置")
    @GetMapping("/banners")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<List<HomeBannerDTO>> getActiveBanners() {
        List<HomeBannerDTO> banners = homeBannerFacade.getActiveBanners();
        return ApiSpecResponse.ok(banners);
    }
}
