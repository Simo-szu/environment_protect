package com.youthloop.content.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * Content list query request.
 */
@Data
@Schema(description = "Content list query request")
public class ContentQueryRequest {

    @Schema(description = "Content type: 1=news 2=feed 3=policy 4=wiki")
    private Integer type;

    @Schema(description = "Status: 1=published 2=draft 3=hidden")
    private Integer status;

    @Schema(description = "Page number", example = "1")
    private Integer page = 1;

    @Schema(description = "Page size", example = "20")
    private Integer size = 20;

    @Schema(description = "Keyword for fuzzy search in title/summary/body")
    private String keyword;

    @Schema(description = "Whether to ignore default published-only filter")
    private Boolean includeAllStatus = false;
}
