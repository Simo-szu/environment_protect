package com.youthloop.user.domain.model;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户档案领域模型
 */
@Data
public class UserProfile {

    private UUID userId;
    private String nickname;
    private String avatarUrl;
    private Integer role; // 1=USER 2=HOST 3=ADMIN
    private Integer gender;
    private LocalDate birthday;
    private String hometown;
    private String bio;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * 获取性别显示文本
     */
    public String getGenderDisplay() {
        if (gender == null || gender == 0) {
            return "未知";
        }
        return gender == 1 ? "男" : "女";
    }
    
    /**
     * 是否完善了基本信息
     */
    public boolean isProfileComplete() {
        return nickname != null && !nickname.isEmpty()
            && avatarUrl != null && !avatarUrl.isEmpty();
    }
}
