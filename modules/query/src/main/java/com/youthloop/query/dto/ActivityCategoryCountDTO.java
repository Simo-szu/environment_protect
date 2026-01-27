package com.youthloop.query.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Activity count by category")
public class ActivityCategoryCountDTO {
    
    @Schema(description = "Category ID/Code")
    private Integer category;
    
    @Schema(description = "Number of activities in this category")
    private Integer activityCount;
}
