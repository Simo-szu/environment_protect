package com.youthloop.points.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * 任务DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private UUID id;
    private String code;
    private String name;
    private Integer points;
    private Integer progress; // 当前进度
    private Integer target; // 目标值
    private Integer status; // 1=doing 2=claimable 3=done
}
