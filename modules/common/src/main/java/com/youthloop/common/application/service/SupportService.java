package com.youthloop.common.application.service;

import com.youthloop.common.api.dto.SupportContactDTO;
import com.youthloop.common.api.dto.UserFeedbackDTO;
import com.youthloop.common.domain.model.SupportContact;
import com.youthloop.common.domain.model.UserFeedback;
import com.youthloop.common.persistence.repository.SupportContactRepository;
import com.youthloop.common.persistence.repository.UserFeedbackRepository;
import com.youthloop.common.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 支持服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SupportService {
    
    private final SupportContactRepository supportContactRepository;
    private final UserFeedbackRepository userFeedbackRepository;
    
    /**
     * 提交联系我们
     */
    @Transactional
    public void submitContact(SupportContactDTO dto) {
        UUID userId = SecurityUtil.getCurrentUserIdOptional();
        
        SupportContact contact = new SupportContact();
        contact.setId(UUID.randomUUID());
        contact.setUserId(userId); // 游客时为 null
        contact.setName(dto.getName());
        contact.setEmail(dto.getEmail());
        contact.setPhone(dto.getPhone());
        contact.setSubject(dto.getSubject());
        contact.setMessage(dto.getMessage());
        contact.setStatus(1); // 待处理
        contact.setCreatedAt(LocalDateTime.now());
        
        supportContactRepository.save(contact);
        
        log.info("联系我们记录已创建: id={}, userId={}, email={}", 
            contact.getId(), userId, dto.getEmail());
    }
    
    /**
     * 提交用户反馈
     */
    @Transactional
    public void submitFeedback(UserFeedbackDTO dto) {
        UUID userId = SecurityUtil.getCurrentUserIdOptional();
        
        UserFeedback feedback = new UserFeedback();
        feedback.setId(UUID.randomUUID());
        feedback.setUserId(userId); // 游客时为 null
        feedback.setType(dto.getType());
        feedback.setRating(dto.getRating());
        feedback.setTitle(dto.getTitle());
        feedback.setContent(dto.getContent());
        feedback.setContact(dto.getContact());
        feedback.setAnonymous(dto.getAnonymous() != null ? dto.getAnonymous() : false);
        feedback.setStatus(1); // 待处理
        feedback.setCreatedAt(LocalDateTime.now());
        
        userFeedbackRepository.save(feedback);
        
        log.info("用户反馈已创建: id={}, userId={}, type={}, anonymous={}", 
            feedback.getId(), userId, dto.getType(), feedback.getAnonymous());
    }
}
