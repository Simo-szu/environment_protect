package com.youthloop.common.persistence.repository.impl;

import com.youthloop.common.domain.model.UserFeedback;
import com.youthloop.common.persistence.mapper.UserFeedbackMapper;
import com.youthloop.common.persistence.repository.UserFeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.UUID;

/**
 * 用户反馈 Repository 实现
 */
@Repository
@RequiredArgsConstructor
public class UserFeedbackRepositoryImpl implements UserFeedbackRepository {
    
    private final UserFeedbackMapper mapper;
    
    @Override
    public void save(UserFeedback feedback) {
        mapper.insert(feedback);
    }
    
    @Override
    public UserFeedback findById(UUID id) {
        return mapper.selectById(id);
    }
}
