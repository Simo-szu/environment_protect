package com.youthloop.social.api.web.controller.recommendation;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.recommendation.api.dto.RecommendationDTO;
import com.youthloop.recommendation.api.facade.RecommendationFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 推荐 Controller
 */
@Tag(name = "推荐", description = "个性推荐和最新推荐")
@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    
    private final RecommendationFacade recommendationFacade;
    
    @Operation(summary = "获取每周个性推荐", description = "获取用户的每周个性推荐内容")
    @GetMapping("/weekly")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<RecommendationDTO> getWeeklyRecommendation() {
        RecommendationDTO recommendation = recommendationFacade.getWeeklyRecommendation();
        return BaseResponse.success(recommendation);
    }
    
    @Operation(summary = "获取最新推荐", description = "获取最新的内容和活动推荐")
    @GetMapping("/latest")
    public BaseResponse<RecommendationDTO> getLatestRecommendation() {
        RecommendationDTO recommendation = recommendationFacade.getLatestRecommendation();
        return BaseResponse.success(recommendation);
    }
}
