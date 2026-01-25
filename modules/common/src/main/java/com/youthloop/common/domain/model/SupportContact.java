package com.youthloop.common.domain.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 联系我们领域模型
 */
@Data
public class SupportContact {
    
    private UUID id;
    private UUID userId; // NULL 表示游客
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private Integer status; // 1=待处理 2=处理中 3=已完成 4=已关闭
    private LocalDateTime createdAt;
    private UUID handledBy;
    private LocalDateTime handledAt;
    private String meta; // JSON
}
