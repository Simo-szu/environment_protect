package com.youthloop.activity.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动报名名单项 DTO（主办方查看）
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "活动报名名单项")
public class ActivitySignupListItemDTO {
    
    @Schema(description = "报名 ID")
    private UUID id;
    
    @Schema(description = "场次 ID")
    private UUID sessionId;
    
    @Schema(description = "场次标题")
    private String sessionTitle;
    
    @Schema(description = "用户 ID")
    private UUID userId;
    
    @Schema(description = "邮箱")
    private String email;
    
    @Schema(description = "昵称")
    private String nickname;
    
    @Schema(description = "真实姓名")
    private String realName;
    
    @Schema(description = "手机号")
    private String phone;
    
    @Schema(description = "参加时间")
    private LocalDateTime joinTime;
    
    @Schema(description = "状态：1=待审核 2=已通过 3=已拒绝 4=已取消")
    private Integer status;
    
    @Schema(description = "审核人 ID")
    private UUID auditedBy;
    
    @Schema(description = "审核时间")
    private LocalDateTime auditedAt;
    
    @Schema(description = "审核备注")
    private String auditNote;
    
    @Schema(description = "取消时间")
    private LocalDateTime canceledAt;
    
    @Schema(description = "取消原因")
    private String cancelNote;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
