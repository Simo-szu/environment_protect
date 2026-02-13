package com.youthloop.content.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * Update content request.
 */
@Data
@Schema(description = "Update content request")
public class UpdateContentRequest {

    @Schema(description = "Content type: 1=news 2=feed 3=policy 4=wiki")
    private Integer type;

    @Schema(description = "Title")
    private String title;

    @Schema(description = "Summary")
    private String summary;

    @Schema(description = "Cover image URL")
    private String coverUrl;

    @Schema(description = "Body in markdown/html")
    private String body;

    @Schema(description = "Status: 1=published 2=draft 3=hidden")
    private Integer status;
}

