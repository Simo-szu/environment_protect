package com.youthloop.user.persistence.entity;

import com.youthloop.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.UUID;

/**
 * 用户档案实体（对应 shared.user_profile 表）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class UserProfileEntity extends BaseEntity {
    
    /**
     * 用户 ID（主键，外键关联 user.id）
     */
    private UUID userId;
    
    /**
     * 昵称
     */
    private String nickname;
    
    /**
     * 头像 URL
     */
    private String avatarUrl;
    
    /**
     * 性别：0/null=未知 1=男 2=女
     */
    private Integer gender;
    
    /**
     * 生日
     */
    private LocalDate birthday;
    
    /**
     * 家乡
     */
    private String hometown;
    
    /**
     * 个人简介
     */
    private String bio;
    
    /**
     * 所在地
     */
    private String location;
}
