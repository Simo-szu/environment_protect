package com.youthloop.points.api.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * 签到请求
 */
@Data
public class SigninRequest {
    private LocalDate signinDate; // 可选,用于补签
    private Boolean isMakeup = false; // 是否补签
}
