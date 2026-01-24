package com.youthloop.host.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 主办方认证响应
 */
@Data
@Schema(description = "主办方认证信息")
public class HostVerificationResponse {
    
    @Schema(description = "用户 ID")
    private UUID userId;
    
    @Schema(description = "组织名称")
    private String orgName;
    
    @Schema(description = "联系人姓名")
    private String contactName;
    
    @Schema(description = "联系人电话")
    private String contactPhone;
    
    @Schema(description = "证明文件 URL 列表")
    private List<String> docUrls;
    
    @Schema(description = "状态：1=待审核 2=已通过 3=已拒绝 4=已撤销")
    private Integer status;
    
    @Schema(description = "提交时间")
    private LocalDateTime submittedAt;
    
    @Schema(description = "审核人 ID")
    private UUID reviewedBy;
    
    @Schema(description = "审核时间")
    private LocalDateTime reviewedAt;
    
    @Schema(description = "审核备注")
    private String reviewNote;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
