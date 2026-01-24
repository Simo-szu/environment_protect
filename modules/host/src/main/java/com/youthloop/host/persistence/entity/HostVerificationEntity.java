package com.youthloop.host.persistence.entity;

import com.youthloop.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 主办方认证实体（对应 social.host_verification 表）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class HostVerificationEntity extends BaseEntity {
    
    /**
     * 用户 ID（主键）
     */
    private UUID userId;
    
    /**
     * 组织名称
     */
    private String orgName;
    
    /**
     * 联系人姓名
     */
    private String contactName;
    
    /**
     * 联系人电话
     */
    private String contactPhone;
    
    /**
     * 证明文件 URL 列表（JSON）
     */
    private String docUrls;
    
    /**
     * 状态：1=待审核 2=已通过 3=已拒绝 4=已撤销
     */
    private Integer status;
    
    /**
     * 提交时间
     */
    private LocalDateTime submittedAt;
    
    /**
     * 审核人 ID
     */
    private UUID reviewedBy;
    
    /**
     * 审核时间
     */
    private LocalDateTime reviewedAt;
    
    /**
     * 审核备注
     */
    private String reviewNote;
}
