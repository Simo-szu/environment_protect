package com.youthloop.search.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 搜索结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {
    private UUID id;
    private Integer resultType; // 1=content 2=activity
    private String title;
    private String summary;
    private String coverUrl;
    private LocalDateTime publishedAt;
    private Float relevanceScore; // 相关度评分
}
