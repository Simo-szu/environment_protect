package com.youthloop.query.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.query.dto.*;
import com.youthloop.query.service.ActivityQueryService;
import com.youthloop.query.service.CommentQueryService;
import com.youthloop.query.service.ContentQueryService;
import com.youthloop.query.service.HomeQueryService;
import com.youthloop.query.service.MeQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Query Facade 实现
 */
@Service
@RequiredArgsConstructor
public class QueryFacadeImpl implements QueryFacade {
    
    private final HomeQueryService homeQueryService;
    
    @Qualifier("contentAggregateQueryService")
    private final ContentQueryService contentQueryService;
    
    private final CommentQueryService commentQueryService;
    
    @Qualifier("activityAggregateQueryService")
    private final ActivityQueryService activityQueryService;
    
    private final MeQueryService meQueryService;
    
    @Override
    public HomeDTO getHomeData() {
        return homeQueryService.getHomeData();
    }
    
    @Override
    public PageResponse<ContentListItemDTO> getContentList(Integer type, Integer status, String sort, Integer page, Integer size) {
        return contentQueryService.getContentList(type, status, sort, page, size);
    }
    
    @Override
    public ContentDetailDTO getContentDetail(UUID contentId) {
        return contentQueryService.getContentDetail(contentId);
    }
    
    @Override
    public CommentTreeDTO getCommentTree(Integer targetType, UUID targetId, String sort, Integer page, Integer size) {
        return commentQueryService.getCommentTree(targetType, targetId, sort, page, size);
    }
    
    @Override
    public PageResponse<ActivityListItemDTO> getActivityList(Integer category, Integer status, String sort, Integer page, Integer size) {
        return activityQueryService.getActivityList(category, status, sort, page, size);
    }
    
    @Override
    public ActivityDetailDTO getActivityDetail(UUID activityId) {
        return activityQueryService.getActivityDetail(activityId);
    }
    
    @Override
    public List<ActivitySessionDTO> getActivitySessions(UUID activityId) {
        return activityQueryService.getActivitySessions(activityId);
    }
    
    @Override
    public PageResponse<ReactionItemDTO> getMyReactions(Integer reactionType, Integer targetType, Integer page, Integer size) {
        return meQueryService.getMyReactions(reactionType, targetType, page, size);
    }
    
    @Override
    public PageResponse<NotificationItemDTO> getMyNotifications(Integer page, Integer size) {
        return meQueryService.getMyNotifications(page, size);
    }
    
    @Override
    public PageResponse<MyActivityItemDTO> getMyActivities(Integer status, Integer page, Integer size) {
        return meQueryService.getMyActivities(status, page, size);
    }

    @Override
    public ActivitySummaryDTO getActivitySummary(String month, UUID currentUserIdOrNull) {
        return activityQueryService.getActivitySummary(month, currentUserIdOrNull);
    }

    @Override
    public List<ActivityCategoryCountDTO> getPopularActivityCategories(String month, int limit) {
        return activityQueryService.getPopularActivityCategories(month, limit);
    }
}
