package com.youthloop.recommendation.application.facade;

import com.youthloop.recommendation.api.dto.RecommendationDTO;
import com.youthloop.recommendation.api.facade.RecommendationFacade;
import com.youthloop.recommendation.application.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 推荐门面实现
 */
@Service
@RequiredArgsConstructor
public class RecommendationFacadeImpl implements RecommendationFacade {
    
    private final RecommendationService recommendationService;
    
    @Override
    public RecommendationDTO getWeeklyRecommendation() {
        return recommendationService.getWeeklyRecommendation();
    }
    
    @Override
    public RecommendationDTO getLatestRecommendation() {
        return recommendationService.getLatestRecommendation();
    }
}
