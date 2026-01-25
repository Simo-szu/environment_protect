package com.youthloop.common.persistence.mapper;

import com.youthloop.common.domain.model.UserFeedback;
import org.apache.ibatis.annotations.Mapper;
import java.util.UUID;

/**
 * 用户反馈 Mapper
 */
@Mapper
public interface UserFeedbackMapper {
    
    void insert(UserFeedback feedback);
    
    UserFeedback selectById(UUID id);
}
