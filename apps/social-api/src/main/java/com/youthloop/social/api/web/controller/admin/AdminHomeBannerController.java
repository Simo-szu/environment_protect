package com.youthloop.social.api.web.controller.admin;

import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.RequireAdmin;
import com.youthloop.ops.api.dto.CreateHomeBannerRequest;
import com.youthloop.ops.api.dto.HomeBannerDTO;
import com.youthloop.ops.api.dto.UpdateHomeBannerRequest;
import com.youthloop.ops.api.facade.HomeBannerFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "管理端-首页轮播", description = "首页轮播/运营位管理")
@RestController
@RequestMapping("/api/v1/admin/home/banners")
@RequiredArgsConstructor
@RequireAdmin
public class AdminHomeBannerController {

    private final HomeBannerFacade homeBannerFacade;

    @Operation(summary = "获取所有轮播", description = "查询所有轮播配置")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<HomeBannerDTO>> getAllBanners() {
        List<HomeBannerDTO> banners = homeBannerFacade.getAllBanners();
        ApiPageData<HomeBannerDTO> pageData = new ApiPageData<>(
            1,
            banners.size(),
            (long) banners.size(),
            banners
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "获取轮播详情", description = "根据 ID 查询轮播详情")
    @GetMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<HomeBannerDTO> getBannerById(
        @Parameter(description = "轮播 ID") @PathVariable UUID id
    ) {
        HomeBannerDTO banner = homeBannerFacade.getBannerById(id);
        return ApiSpecResponse.ok(banner);
    }

    @Operation(summary = "创建轮播", description = "创建新的轮播配置")
    @PostMapping
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<UUID> createBanner(
        @Valid @RequestBody UnifiedRequest<CreateHomeBannerRequest> request
    ) {
        UUID id = homeBannerFacade.createBanner(request.getData());
        return ApiSpecResponse.ok(id);
    }

    @Operation(summary = "更新轮播", description = "更新轮播配置")
    @PatchMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> updateBanner(
        @Parameter(description = "轮播 ID") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<UpdateHomeBannerRequest> request
    ) {
        homeBannerFacade.updateBanner(id, request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "删除轮播", description = "删除轮播配置")
    @DeleteMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> deleteBanner(
        @Parameter(description = "轮播 ID") @PathVariable UUID id
    ) {
        homeBannerFacade.deleteBanner(id);
        return ApiSpecResponse.ok(Map.of());
    }
}
