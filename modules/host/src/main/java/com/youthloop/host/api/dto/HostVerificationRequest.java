package com.youthloop.host.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/**
 * 主办方认证申请请求
 */
@Data
@Schema(description = "主办方认证申请")
public class HostVerificationRequest {
    
    @Schema(description = "组织名称", required = true)
    @NotBlank(message = "组织名称不能为空")
    private String orgName;
    
    @Schema(description = "联系人姓名", required = true)
    @NotBlank(message = "联系人姓名不能为空")
    private String contactName;
    
    @Schema(description = "联系人电话", required = true)
    @NotBlank(message = "联系人电话不能为空")
    private String contactPhone;
    
    @Schema(description = "证明文件 URL 列表")
    private List<String> docUrls;
}
