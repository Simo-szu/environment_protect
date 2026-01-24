package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户状态 DTO
 * 用于返回当前用户对某个资源的互动状态（点赞/收藏/踩）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "用户状态")
public class UserState {
    
    @Schema(description = "是否已点赞")
    private Boolean liked;
    
    @Schema(description = "是否已收藏")
    private Boolean favorited;
    
    @Schema(description = "是否已踩")
    private Boolean downvoted;
    
    /**
     * 创建空状态（未登录时使用）
     */
    public static UserState empty() {
        return new UserState(false, false, false);
    }
}
