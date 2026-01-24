package com.youthloop.points.persistence.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 每日任务进度实体
 */
@Data
public class DailyTaskProgressEntity {
    private UUID userId;
    private LocalDate taskDate;
    private UUID taskId;
    private Integer progress;
    private Integer target;
    private Integer status; // 1=doing 2=claimable 3=done
    private LocalDateTime updatedAt;
}
