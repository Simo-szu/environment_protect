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
    public HomeDTO getHomeData(String locale) {
        return homeQueryService.getHomeData(locale);
    }
    
    @Override
    public PageResponse<ContentListItemDTO> getContentList(Integer type, Integer status, String locale, Integer page, Integer size) {
        return contentQueryService.getContentList(type, status, locale, page, size);
    }
    
    @Override
    public ContentDetailDTO getContentDetail(UUID contentId, String locale) {
        return contentQueryService.getContentDetail(contentId, locale);
    }
    
    @Override
    public CommentTreeDTO getCommentTree(Integer targetType, UUID targetId, String sort, Integer page, Integer size) {
        return commentQueryService.getCommentTree(targetType, targetId, sort, page, size);
    }
    
    @Override
    public PageResponse<ActivityListItemDTO> getActivityList(Integer category, Integer status, String locale, String sort, Integer page, Integer size) {
        return activityQueryService.getActivityList(category, status, locale, sort, page, size);
    }
    
    @Override
    public ActivityDetailDTO getActivityDetail(UUID activityId, String locale) {
        return activityQueryService.getActivityDetail(activityId, locale);
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
}
