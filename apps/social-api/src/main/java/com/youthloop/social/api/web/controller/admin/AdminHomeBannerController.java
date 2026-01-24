package com.youthloop.social.api.web.controller.admin;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 管理端 - 首页轮播 Controller
 * 需要管理员权限
 */
@Tag(name = "管理端 - 首页轮播", description = "首页轮播/运营位管理")
@RestController
@RequestMapping("/api/v1/admin/home/banners")
@RequiredArgsConstructor
@RequireAdmin
public class AdminHomeBannerController {
    
    private final HomeBannerFacade homeBannerFacade;
    
    @Operation(summary = "获取所有轮播", description = "查询所有轮播配置（包括未启用的）")
    @GetMapping
    public BaseResponse<List<HomeBannerDTO>> getAllBanners() {
        List<HomeBannerDTO> banners = homeBannerFacade.getAllBanners();
        return BaseResponse.success(banners);
    }
    
    @Operation(summary = "获取轮播详情", description = "根据 ID 查询轮播详情")
    @GetMapping("/{id}")
    public BaseResponse<HomeBannerDTO> getBannerById(
        @Parameter(description = "轮播 ID") @PathVariable UUID id
    ) {
        HomeBannerDTO banner = homeBannerFacade.getBannerById(id);
        return BaseResponse.success(banner);
    }
    
    @Operation(summary = "创建轮播", description = "创建新的轮播配置")
    @PostMapping
    public BaseResponse<UUID> createBanner(
        @Valid @RequestBody UnifiedRequest<CreateHomeBannerRequest> request
    ) {
        UUID id = homeBannerFacade.createBanner(request.getData());
        return BaseResponse.success("创建成功", id);
    }
    
    @Operation(summary = "更新轮播", description = "更新轮播配置")
    @PatchMapping("/{id}")
    public BaseResponse<Void> updateBanner(
        @Parameter(description = "轮播 ID") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<UpdateHomeBannerRequest> request
    ) {
        homeBannerFacade.updateBanner(id, request.getData());
        return BaseResponse.success("更新成功", null);
    }
    
    @Operation(summary = "删除轮播", description = "删除轮播配置")
    @DeleteMapping("/{id}")
    public BaseResponse<Void> deleteBanner(
        @Parameter(description = "轮播 ID") @PathVariable UUID id
    ) {
        homeBannerFacade.deleteBanner(id);
        return BaseResponse.success("删除成功", null);
    }
}
