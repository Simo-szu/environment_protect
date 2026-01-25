package com.youthloop.user.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

/**
 * 用户档案 DTO
 */
@Data
@Schema(description = "用户档案")
public class UserProfileDTO {
    
    @Schema(description = "用户 ID")
    private UUID userId;
    
    @Schema(description = "昵称")
    @Size(min = 1, max = 50, message = "昵称长度必须在 1-50 之间")
    private String nickname;
    
    @Schema(description = "头像 URL")
    private String avatarUrl;
    
    @Schema(description = "性别：0=未知 1=男 2=女")
    @Min(value = 0, message = "性别值无效")
    @Max(value = 2, message = "性别值无效")
    private Integer gender;
    
    @Schema(description = "生日")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthday;
    
    @Schema(description = "家乡")
    @Size(max = 100, message = "家乡长度不能超过 100")
    private String hometown;
    
    @Schema(description = "个人简介")
    @Size(max = 500, message = "个人简介长度不能超过 500")
    private String bio;
    
    @Schema(description = "所在地")
    @Size(max = 100, message = "所在地长度不能超过 100")
    private String location;
}
