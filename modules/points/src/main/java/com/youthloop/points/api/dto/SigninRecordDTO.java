package com.youthloop.points.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * 签到记录 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SigninRecordDTO {
    private UUID userId;
    private LocalDate signinDate;
    private Integer points;
    private Integer consecutiveDays;
    private Boolean isMakeup;
    /** Whether the user has signed in today. False means not yet signed in. */
    private Boolean isSigned;
}
