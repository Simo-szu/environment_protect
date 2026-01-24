package com.youthloop.recommendation.api.facade;

import com.youthloop.recommendation.api.dto.RecommendationDTO;

/**
 * 推荐门面接口
 */
public interface RecommendationFacade {
    
    /**
     * 获取用户的每周个性推荐
     */
    RecommendationDTO getWeeklyRecommendation();
    
    /**
     * 获取最新推荐(实时)
     */
    RecommendationDTO getLatestRecommendation();
}
