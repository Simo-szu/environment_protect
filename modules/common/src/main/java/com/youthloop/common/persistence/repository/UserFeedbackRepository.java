package com.youthloop.common.persistence.repository;

import com.youthloop.common.domain.model.UserFeedback;
import java.util.UUID;

/**
 * 用户反馈 Repository
 */
public interface UserFeedbackRepository {
    
    /**
     * 保存反馈记录
     */
    void save(UserFeedback feedback);
    
    /**
     * 根据 ID 查询
     */
    UserFeedback findById(UUID id);
}
