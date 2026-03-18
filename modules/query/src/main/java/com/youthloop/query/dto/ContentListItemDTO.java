package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregated content list item DTO.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Aggregated content list item")
public class ContentListItemDTO {

    @Schema(description = "Content ID")
    private UUID id;

    @Schema(description = "Content type: 1=news 2=dynamic 3=policy 4=wiki")
    private Integer type;

    @Schema(description = "Title")
    private String title;

    @Schema(description = "Summary")
    private String summary;

    @Schema(description = "Cover image URL")
    private String coverUrl;

    @Schema(description = "Source URL")
    private String sourceUrl;

    @Schema(description = "Published time")
    private LocalDateTime publishedAt;

    @Schema(description = "Status: 1=published 2=draft 3=hidden")
    private Integer status;

    @Schema(description = "Created time")
    private LocalDateTime createdAt;

    @Schema(description = "Like count")
    private Integer likeCount;

    @Schema(description = "Favorite count")
    private Integer favCount;

    @Schema(description = "Comment count")
    private Integer commentCount;

    @Schema(description = "View count")
    private Long viewCount;

    @Schema(description = "Hot score")
    private Long hotScore;

    @Schema(description = "User state when logged in")
    private UserState userState;
}
