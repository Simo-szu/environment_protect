package com.youthloop.points.persistence.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 签到记录实体
 */
@Data
public class SigninRecordEntity {
    private UUID userId;
    private LocalDate signinDate;
    private Boolean isSigned;
    private LocalDateTime signedAt;
    private Boolean isMakeup;
    private Integer streakCount;
    private LocalDateTime createdAt;
}
