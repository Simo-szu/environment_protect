package com.youthloop.activity.api.facade;

import com.youthloop.activity.api.dto.ActivitySignupListItemDTO;
import com.youthloop.activity.api.dto.CreateActivitySessionRequest;
import com.youthloop.activity.api.dto.CreateHostActivityRequest;
import com.youthloop.activity.api.dto.SignupRequest;
import com.youthloop.activity.api.dto.SignupResponse;
import com.youthloop.activity.api.dto.UpdateHostActivityRequest;
import com.youthloop.activity.application.service.ActivityCommandService;
import com.youthloop.activity.application.service.ActivityQueryService;
import com.youthloop.activity.application.service.ActivitySignupService;
import com.youthloop.common.api.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 活动 Facade（对外统一接口）
 */
@Component
@RequiredArgsConstructor
public class ActivityFacade {
    
    private final ActivitySignupService activitySignupService;
    private final ActivityCommandService activityCommandService;
    private final ActivityQueryService activityQueryService;
    
    /**
     * 报名活动
     */
    public SignupResponse signup(SignupRequest request) {
        return activitySignupService.signup(request);
    }
    
    /**
     * 取消报名（支持游客）
     */
    public void cancelSignup(UUID signupId, String cancelNote, String guestEmail) {
        activitySignupService.cancelSignup(signupId, cancelNote, guestEmail);
    }
    
    /**
     * 改场次（支持游客）
     */
    public void changeSession(UUID signupId, UUID newSessionId, String guestEmail) {
        activitySignupService.changeSession(signupId, newSessionId, guestEmail);
    }
    
    /**
     * 审核报名
     */
    public void auditSignup(UUID signupId, Integer status, String auditNote) {
        activitySignupService.auditSignup(signupId, status, auditNote);
    }
    
    /**
     * 主办方创建活动
     */
    public UUID createHostActivity(CreateHostActivityRequest request) {
        return activityCommandService.createHostActivity(request);
    }
    
    /**
     * 主办方更新活动
     */
    public void updateHostActivity(UUID activityId, UpdateHostActivityRequest request) {
        activityCommandService.updateHostActivity(activityId, request);
    }
    
    /**
     * 批量创建/更新场次
     */
    public void createOrUpdateSessions(UUID activityId, List<CreateActivitySessionRequest> sessions) {
        activityCommandService.createOrUpdateSessions(activityId, sessions);
    }
    
    /**
     * 查询我发布的活动列表
     */
    public PageResponse<Map<String, Object>> getMyHostActivities(Integer page, Integer size) {
        return activityQueryService.getMyHostActivities(page, size);
    }
    
    /**
     * 查询活动的报名列表（主办方查看）
     */
    public PageResponse<ActivitySignupListItemDTO> getActivitySignupList(
        UUID activityId, Integer status, Integer page, Integer size
    ) {
        return activityQueryService.getActivitySignupList(activityId, status, page, size);
    }
}
