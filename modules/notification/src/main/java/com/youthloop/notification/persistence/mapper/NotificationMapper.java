package com.youthloop.notification.persistence.mapper;

import com.youthloop.notification.persistence.entity.NotificationEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 通知 Mapper
 */
@Mapper
public interface NotificationMapper {
    
    /**
     * 插入通知
     */
    int insert(NotificationEntity notification);
    
    /**
     * 查询用户的通知列表
     */
    List<NotificationEntity> selectByUser(
        @Param("userId") UUID userId,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计用户未读通知数
     */
    Long countUnreadByUser(@Param("userId") UUID userId);
    
    /**
     * 标记通知为已读
     */
    int markAsRead(@Param("id") UUID id);
    
    /**
     * 批量标记为已读
     */
    int markAllAsRead(@Param("userId") UUID userId);
}
