package com.youthloop.query.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.query.dto.*;

import java.util.List;
import java.util.UUID;

/**
 * Query 层对外 Facade
 * 供 Controller 调用
 */
public interface QueryFacade {
    
    /**
     * 查询首页聚合数据
     */
    HomeDTO getHomeData();
    
    /**
     * 查询内容列表（含统计和用户状态）
     */
    PageResponse<ContentListItemDTO> getContentList(Integer type, Integer status, String sort, Integer page, Integer size);
    
    /**
     * 查询内容详情（含统计和用户状态）
     */
    ContentDetailDTO getContentDetail(UUID contentId);
    
    /**
     * 查询评论树
     */
    CommentTreeDTO getCommentTree(Integer targetType, UUID targetId, String sort, Integer page, Integer size);
    
    /**
     * 查询活动列表（含统计和用户状态）
     */
    PageResponse<ActivityListItemDTO> getActivityList(Integer category, Integer status, String sort, Integer page, Integer size);
    
    /**
     * 查询活动详情（含统计和用户状态）
     */
    ActivityDetailDTO getActivityDetail(UUID activityId);
    
    /**
     * 查询活动场次列表
     */
    List<ActivitySessionDTO> getActivitySessions(UUID activityId);
    
    /**
     * 查询我的收藏/点赞列表
     */
    PageResponse<ReactionItemDTO> getMyReactions(Integer reactionType, Integer targetType, Integer page, Integer size);
    
    /**
     * 查询我的通知列表
     */
    PageResponse<NotificationItemDTO> getMyNotifications(Integer page, Integer size);
    
    /**
     * 查询我报名的活动列表
     */
    PageResponse<MyActivityItemDTO> getMyActivities(Integer status, Integer page, Integer size);

    /**
     * Get activity summary stats
     */
    ActivitySummaryDTO getActivitySummary(String month, UUID currentUserIdOrNull);

    /**
     * Get popular categories
     */
    List<ActivityCategoryCountDTO> getPopularActivityCategories(String month, int limit);
}
