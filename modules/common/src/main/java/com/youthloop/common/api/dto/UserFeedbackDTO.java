package com.youthloop.common.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 用户反馈 DTO
 */
@Data
@Schema(description = "用户反馈请求")
public class UserFeedbackDTO {
    
    @Schema(description = "反馈类型：1=建议 2=Bug 3=表扬 4=其他")
    @NotNull(message = "反馈类型不能为空")
    @Min(value = 1, message = "反馈类型无效")
    @Max(value = 4, message = "反馈类型无效")
    private Integer type;
    
    @Schema(description = "评分：1-5 星")
    @Min(value = 1, message = "评分必须在 1-5 之间")
    @Max(value = 5, message = "评分必须在 1-5 之间")
    private Integer rating;
    
    @Schema(description = "标题")
    @NotBlank(message = "标题不能为空")
    @Size(max = 100, message = "标题长度不能超过 100")
    private String title;
    
    @Schema(description = "内容")
    @NotBlank(message = "内容不能为空")
    @Size(max = 2000, message = "内容长度不能超过 2000")
    private String content;
    
    @Schema(description = "联系方式")
    @Size(max = 100, message = "联系方式长度不能超过 100")
    private String contact;
    
    @Schema(description = "是否匿名")
    private Boolean anonymous;
}
