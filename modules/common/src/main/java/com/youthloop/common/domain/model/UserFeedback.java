package com.youthloop.common.domain.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户反馈领域模型
 */
@Data
public class UserFeedback {
    
    private UUID id;
    private UUID userId; // NULL 表示游客
    private Integer type; // 1=建议 2=Bug 3=表扬 4=其他
    private Integer rating; // 1-5 星
    private String title;
    private String content;
    private String contact;
    private Boolean anonymous;
    private Integer status; // 1=待处理 2=处理中 3=已完成 4=已关闭
    private LocalDateTime createdAt;
    private String meta; // JSON
}
