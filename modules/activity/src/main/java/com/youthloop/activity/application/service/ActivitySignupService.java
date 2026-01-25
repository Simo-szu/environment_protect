package com.youthloop.activity.application.service;

import com.youthloop.activity.api.dto.SignupRequest;
import com.youthloop.activity.api.dto.SignupResponse;
import com.youthloop.activity.persistence.entity.ActivityEntity;
import com.youthloop.activity.persistence.entity.ActivitySignupEntity;
import com.youthloop.activity.persistence.mapper.ActivityMapper;
import com.youthloop.activity.persistence.mapper.ActivitySignupMapper;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.event.application.service.OutboxEventService;
import com.youthloop.event.domain.payload.SignupEventPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动报名服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivitySignupService {
    
    private final ActivitySignupMapper activitySignupMapper;
    private final ActivityMapper activityMapper;
    private final OutboxEventService outboxEventService;
    
    /**
     * 报名活动（支持登录用户和游客）
     * 幂等：同一活动只能报名一次（通过 dedup_key 保证）
     */
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        
        // 生成去重键
        String dedupKey;
        if (currentUserId != null) {
            // 登录用户：U:{userId}
            dedupKey = "U:" + currentUserId;
        } else {
            // 游客：E:{email}
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                throw new BizException(40021, "游客报名必须提供邮箱");
            }
            dedupKey = "E:" + request.getEmail().toLowerCase().trim();
        }
        
        // 幂等检查：是否已报名
        ActivitySignupEntity existing = activitySignupMapper.selectByActivityAndDedupKey(
            request.getActivityId(), 
            dedupKey
        );
        
        if (existing != null) {
            // 如果已取消，可以重新报名
            if (existing.getStatus() == 4) {
                log.info("用户已取消报名，允许重新报名: activityId={}, dedupKey={}", 
                    request.getActivityId(), dedupKey);
            } else {
                // 已报名（待审核/已通过/已拒绝），返回现有记录（幂等）
                log.info("用户已报名该活动（幂等返回）: activityId={}, dedupKey={}, status={}", 
                    request.getActivityId(), dedupKey, existing.getStatus());
                return mapToResponse(existing);
            }
        }
        
        // 查询活动信息（获取报名策略和主办方 ID）
        ActivityEntity activity = activityMapper.selectById(request.getActivityId());
        if (activity == null) {
            throw new BizException(40041, "活动不存在");
        }
        
        // 根据报名策略决定初始状态
        // 1=auto_approve 自动通过，2=manual_review 需要审核
        Integer initialStatus = (activity.getSignupPolicy() == 1) ? 2 : 1;
        
        // 创建报名记录
        ActivitySignupEntity entity = new ActivitySignupEntity();
        entity.setId(UUID.randomUUID());
        entity.setActivityId(request.getActivityId());
        entity.setSessionId(request.getSessionId());
        entity.setUserId(currentUserId);
        entity.setEmail(request.getEmail() != null ? request.getEmail().toLowerCase().trim() : null);
        entity.setNickname(request.getNickname());
        entity.setRealName(request.getRealName());
        entity.setPhone(request.getPhone());
        entity.setJoinTime(null); // 可以后续根据场次时间填充
        entity.setStatus(initialStatus);
        entity.setDedupKey(dedupKey);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        // 如果是自动通过，设置审核信息
        if (initialStatus == 2) {
            entity.setAuditedBy(null); // 系统自动审核
            entity.setAuditedAt(LocalDateTime.now());
            entity.setAuditNote("自动通过");
        }
        
        // 插入数据库
        int rows = activitySignupMapper.insert(entity);
        if (rows == 0) {
            throw new BizException(40022, "报名失败，请稍后重试");
        }
        
        log.info("活动报名成功: signupId={}, activityId={}, dedupKey={}, status={}", 
            entity.getId(), request.getActivityId(), dedupKey, initialStatus);
        
        // 发送 Outbox 事件（用于更新统计和发送通知）
        SignupEventPayload payload = new SignupEventPayload(
            entity.getId(),
            entity.getActivityId(),
            entity.getSessionId(),
            entity.getUserId(),
            entity.getStatus(),
            initialStatus == 2 ? "APPROVED" : "CREATED",
            activity.getHostUserId()  // 携带主办方 ID
        );
        outboxEventService.publishEvent("SIGNUP_CREATED", payload);
        
        return mapToResponse(entity);
    }
    
    /**
     * 取消报名（支持登录用户和游客）
     */
    @Transactional
    public void cancelSignup(UUID signupId, String cancelNote, String guestEmail) {
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        
        // 查询报名记录
        ActivitySignupEntity signup = activitySignupMapper.selectById(signupId);
        if (signup == null) {
            throw new BizException(40041, "报名记录不存在");
        }
        
        // 查询活动信息（获取主办方 ID）
        ActivityEntity activity = activityMapper.selectById(signup.getActivityId());
        if (activity == null) {
            throw new BizException(40041, "活动不存在");
        }
        
        // 权限检查
        if (currentUserId != null) {
            // 登录用户：只能取消自己的报名
            if (signup.getUserId() != null && !signup.getUserId().equals(currentUserId)) {
                throw new BizException(40032, "无权取消他人的报名");
            }
        } else {
            // 游客：通过 email + dedup_key 验证
            if (guestEmail == null || guestEmail.trim().isEmpty()) {
                throw new BizException(40021, "游客取消报名必须提供邮箱");
            }
            String expectedDedupKey = "E:" + guestEmail.toLowerCase().trim();
            if (!expectedDedupKey.equals(signup.getDedupKey())) {
                throw new BizException(40032, "邮箱与报名记录不匹配");
            }
        }
        
        // 状态检查：只能取消待审核或已通过的报名
        if (signup.getStatus() != 1 && signup.getStatus() != 2) {
            throw new BizException(40051, "当前状态不允许取消");
        }
        
        // 取消报名
        int rows = activitySignupMapper.cancel(signupId, cancelNote);
        if (rows == 0) {
            throw new BizException(40022, "取消报名失败");
        }
        
        log.info("取消报名成功: signupId={}, userId={}, guestEmail={}", 
            signupId, currentUserId, guestEmail);
        
        // 发送 Outbox 事件（用于更新统计）
        SignupEventPayload payload = new SignupEventPayload(
            signupId,
            signup.getActivityId(),
            signup.getSessionId(),
            signup.getUserId(),
            4, // canceled
            "CANCELED",
            activity.getHostUserId()  // 携带主办方 ID
        );
        outboxEventService.publishEvent("SIGNUP_CANCELED", payload);
    }
    
    /**
     * 改场次（支持登录用户和游客）
     */
    @Transactional
    public void changeSession(UUID signupId, UUID newSessionId, String guestEmail) {
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        
        // 查询报名记录
        ActivitySignupEntity signup = activitySignupMapper.selectById(signupId);
        if (signup == null) {
            throw new BizException(40041, "报名记录不存在");
        }
        
        // 权限检查
        if (currentUserId != null) {
            // 登录用户：只能修改自己的报名
            if (signup.getUserId() != null && !signup.getUserId().equals(currentUserId)) {
                throw new BizException(40032, "无权修改他人的报名");
            }
        } else {
            // 游客：通过 email + dedup_key 验证
            if (guestEmail == null || guestEmail.trim().isEmpty()) {
                throw new BizException(40021, "游客改场次必须提供邮箱");
            }
            String expectedDedupKey = "E:" + guestEmail.toLowerCase().trim();
            if (!expectedDedupKey.equals(signup.getDedupKey())) {
                throw new BizException(40032, "邮箱与报名记录不匹配");
            }
        }
        
        // 状态检查
        if (signup.getStatus() != 1 && signup.getStatus() != 2) {
            throw new BizException(40051, "当前状态不允许改场次");
        }
        
        // 更新场次
        int rows = activitySignupMapper.updateSession(signupId, newSessionId);
        if (rows == 0) {
            throw new BizException(40022, "改场次失败");
        }
        
        log.info("改场次成功: signupId={}, newSessionId={}, userId={}, guestEmail={}", 
            signupId, newSessionId, currentUserId, guestEmail);
    }
    
    /**
     * 更新报名信息（支持登录用户和游客）
     */
    @Transactional
    public void updateSignupInfo(UUID signupId, String nickname, String realName, String phone, String guestEmail) {
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        
        // 查询报名记录
        ActivitySignupEntity signup = activitySignupMapper.selectById(signupId);
        if (signup == null) {
            throw new BizException(40041, "报名记录不存在");
        }
        
        // 权限检查
        if (currentUserId != null) {
            // 登录用户：只能修改自己的报名
            if (signup.getUserId() != null && !signup.getUserId().equals(currentUserId)) {
                throw new BizException(40032, "无权修改他人的报名");
            }
        } else {
            // 游客：通过 email + dedup_key 验证
            if (guestEmail == null || guestEmail.trim().isEmpty()) {
                throw new BizException(40021, "游客修改报名信息必须提供邮箱");
            }
            String expectedDedupKey = "E:" + guestEmail.toLowerCase().trim();
            if (!expectedDedupKey.equals(signup.getDedupKey())) {
                throw new BizException(40032, "邮箱与报名记录不匹配");
            }
        }
        
        // 状态检查
        if (signup.getStatus() != 1 && signup.getStatus() != 2) {
            throw new BizException(40051, "当前状态不允许修改报名信息");
        }
        
        // 更新报名信息
        int rows = activitySignupMapper.updateInfo(signupId, nickname, realName, phone);
        if (rows == 0) {
            throw new BizException(40022, "更新报名信息失败");
        }
        
        log.info("更新报名信息成功: signupId={}, userId={}, guestEmail={}", 
            signupId, currentUserId, guestEmail);
    }
    
    /**
     * 审核报名（主办方/管理员）
     */
    @Transactional
    public void auditSignup(UUID signupId, Integer status, String auditNote) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        // 查询报名记录
        ActivitySignupEntity signup = activitySignupMapper.selectById(signupId);
        if (signup == null) {
            throw new BizException(40041, "报名记录不存在");
        }
        
        // 查询活动信息
        ActivityEntity activity = activityMapper.selectById(signup.getActivityId());
        if (activity == null) {
            throw new BizException(40041, "活动不存在");
        }
        
        // 权限检查：需要是管理员或主办方本人
        boolean isHost = activity.getHostUserId() != null && activity.getHostUserId().equals(currentUserId);
        if (!SecurityUtil.isAdmin() && !isHost) {
            throw new BizException(40032, "无权审核报名");
        }
        
        // 状态检查：只能审核待审核的报名
        if (signup.getStatus() != 1) {
            throw new BizException(40051, "当前状态不允许审核");
        }
        
        // 状态值检查：只能审核为通过或拒绝
        if (status != 2 && status != 3) {
            throw new BizException(40011, "审核状态只能是通过(2)或拒绝(3)");
        }
        
        // 更新状态
        int rows = activitySignupMapper.updateStatus(signupId, status, currentUserId, auditNote);
        if (rows == 0) {
            throw new BizException(40022, "审核失败");
        }
        
        log.info("审核报名成功: signupId={}, status={}, auditedBy={}", 
            signupId, status, currentUserId);
        
        // 发送 Outbox 事件（用于发送通知和更新统计）
        SignupEventPayload payload = new SignupEventPayload(
            signupId,
            signup.getActivityId(),
            signup.getSessionId(),
            signup.getUserId(),
            status,
            status == 2 ? "APPROVED" : "REJECTED",
            activity.getHostUserId()  // 携带主办方 ID
        );
        outboxEventService.publishEvent("SIGNUP_AUDITED", payload);
    }
    
    /**
     * 映射到响应 DTO
     */
    private SignupResponse mapToResponse(ActivitySignupEntity entity) {
        SignupResponse response = new SignupResponse();
        response.setId(entity.getId());
        response.setActivityId(entity.getActivityId());
        response.setSessionId(entity.getSessionId());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
