package com.youthloop.common.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 联系我们 DTO
 */
@Data
@Schema(description = "联系我们请求")
public class SupportContactDTO {
    
    @Schema(description = "姓名")
    @NotBlank(message = "姓名不能为空")
    @Size(max = 50, message = "姓名长度不能超过 50")
    private String name;
    
    @Schema(description = "邮箱")
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Schema(description = "电话")
    @Size(max = 20, message = "电话长度不能超过 20")
    private String phone;
    
    @Schema(description = "主题")
    @NotBlank(message = "主题不能为空")
    @Size(max = 100, message = "主题长度不能超过 100")
    private String subject;
    
    @Schema(description = "消息内容")
    @NotBlank(message = "消息内容不能为空")
    @Size(max = 2000, message = "消息内容长度不能超过 2000")
    private String message;
}
