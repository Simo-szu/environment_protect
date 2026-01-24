package com.youthloop.host.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.host.api.dto.HostVerificationRequest;
import com.youthloop.host.api.dto.HostVerificationResponse;
import com.youthloop.host.persistence.entity.HostVerificationEntity;
import com.youthloop.host.persistence.mapper.HostVerificationMapper;
import com.youthloop.user.persistence.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 主办方认证服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HostVerificationService {
    
    private final HostVerificationMapper hostVerificationMapper;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;
    
    /**
     * 提交主办方认证申请
     */
    @Transactional
    public void submitVerification(HostVerificationRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        // 检查是否已有认证记录
        HostVerificationEntity existing = hostVerificationMapper.selectByUserId(currentUserId);
        
        // 如果已通过认证，不允许重新提交
        if (existing != null && existing.getStatus() == 2) {
            throw new BizException(40051, "您已通过主办方认证，无需重复提交");
        }
        
        // 序列化文件 URL 列表
        String docUrlsJson = null;
        if (request.getDocUrls() != null && !request.getDocUrls().isEmpty()) {
            try {
                docUrlsJson = objectMapper.writeValueAsString(request.getDocUrls());
            } catch (JsonProcessingException e) {
                log.error("序列化文件 URL 失败", e);
                throw new BizException(ErrorCode.SYSTEM_ERROR, "序列化文件 URL 失败");
            }
        }
        
        // 创建或更新认证记录
        HostVerificationEntity entity = new HostVerificationEntity();
        entity.setUserId(currentUserId);
        entity.setOrgName(request.getOrgName());
        entity.setContactName(request.getContactName());
        entity.setContactPhone(request.getContactPhone());
        entity.setDocUrls(docUrlsJson);
        entity.setStatus(1); // 待审核
        entity.setSubmittedAt(LocalDateTime.now());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        int rows = hostVerificationMapper.insert(entity);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "提交认证申请失败");
        }
        
        log.info("主办方认证申请已提交: userId={}", currentUserId);
    }
    
    /**
     * 查询当前用户的认证状态
     */
    @Transactional(readOnly = true)
    public HostVerificationResponse getMyVerification() {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        HostVerificationEntity entity = hostVerificationMapper.selectByUserId(currentUserId);
        if (entity == null) {
            return null;
        }
        
        return mapToResponse(entity);
    }
    
    /**
     * 查询所有认证申请（管理端）
     */
    @Transactional(readOnly = true)
    public List<HostVerificationResponse> getAllVerifications(Integer status) {
        List<HostVerificationEntity> entities = hostVerificationMapper.selectAll(status);
        return entities.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * 审核主办方认证（管理员）
     */
    @Transactional
    public void reviewVerification(UUID userId, Integer status, String reviewNote) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        // 权限检查：只有管理员可以审核
        if (!SecurityUtil.isAdmin()) {
            throw new BizException(ErrorCode.FORBIDDEN, "无权审核主办方认证");
        }
        
        // 查询认证记录
        HostVerificationEntity entity = hostVerificationMapper.selectByUserId(userId);
        if (entity == null) {
            throw new BizException(40041, "认证记录不存在");
        }
        
        // 状态检查：只能审核待审核的申请
        if (entity.getStatus() != 1) {
            throw new BizException(40051, "当前状态不允许审核");
        }
        
        // 状态值检查：只能审核为通过或拒绝
        if (status != 2 && status != 3) {
            throw new BizException(40011, "审核状态只能是通过(2)或拒绝(3)");
        }
        
        // 更新审核状态
        int rows = hostVerificationMapper.updateReviewStatus(userId, status, currentUserId, reviewNote);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "审核失败");
        }
        
        // 如果审核通过，更新用户角色为主办方
        if (status == 2) {
            userMapper.updateRole(userId, 2); // 2=host
            log.info("用户角色已更新为主办方: userId={}", userId);
        }
        
        log.info("主办方认证审核完成: userId={}, status={}, reviewedBy={}", 
            userId, status, currentUserId);
    }
    
    /**
     * 映射到响应 DTO
     */
    private HostVerificationResponse mapToResponse(HostVerificationEntity entity) {
        HostVerificationResponse response = new HostVerificationResponse();
        response.setUserId(entity.getUserId());
        response.setOrgName(entity.getOrgName());
        response.setContactName(entity.getContactName());
        response.setContactPhone(entity.getContactPhone());
        
        // 反序列化文件 URL 列表
        if (entity.getDocUrls() != null) {
            try {
                List<String> docUrls = objectMapper.readValue(
                    entity.getDocUrls(), 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
                response.setDocUrls(docUrls);
            } catch (JsonProcessingException e) {
                log.error("反序列化文件 URL 失败", e);
            }
        }
        
        response.setStatus(entity.getStatus());
        response.setSubmittedAt(entity.getSubmittedAt());
        response.setReviewedBy(entity.getReviewedBy());
        response.setReviewedAt(entity.getReviewedAt());
        response.setReviewNote(entity.getReviewNote());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        
        return response;
    }
}
