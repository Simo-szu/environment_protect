package com.youthloop.social.api.web.controller.recommendation;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.recommendation.api.dto.RecommendationDTO;
import com.youthloop.recommendation.api.facade.RecommendationFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "推荐", description = "个性推荐和最新推荐")
@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationFacade recommendationFacade;

    @Operation(summary = "获取每周个性推荐", description = "获取用户每周个性推荐内容")
    @GetMapping("/weekly")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<RecommendationDTO> getWeeklyRecommendation() {
        RecommendationDTO recommendation = recommendationFacade.getWeeklyRecommendation();
        return ApiSpecResponse.ok(recommendation);
    }

    @Operation(summary = "获取最新推荐", description = "获取最新内容和活动推荐")
    @GetMapping("/latest")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<RecommendationDTO> getLatestRecommendation() {
        RecommendationDTO recommendation = recommendationFacade.getLatestRecommendation();
        return ApiSpecResponse.ok(recommendation);
    }
}
