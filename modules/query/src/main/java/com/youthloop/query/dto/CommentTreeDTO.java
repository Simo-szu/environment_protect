package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.youthloop.common.api.PageResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 评论树 DTO
 * 包含：根评论分页列表 + 每个根评论的回复
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "评论树")
public class CommentTreeDTO {
    
    @Schema(description = "根评论分页列表")
    private PageResponse<CommentDTO> rootComments;
    
    @Schema(description = "排序方式：latest=最新 hot=热门")
    private String sort;
}
