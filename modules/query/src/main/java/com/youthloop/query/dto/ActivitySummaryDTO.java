package com.youthloop.query.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Activity Summary for a specific month")
public class ActivitySummaryDTO {
    
    @Schema(description = "Month (YYYY-MM)")
    private String month;
    
    @Schema(description = "Total number of activities in the month")
    private Integer monthlyActivityCount;
    
    @Schema(description = "Total number of participants (approved signups) in the month")
    private Integer monthlyParticipantCount;
    
    @Schema(description = "Number of registrations by the current user (approved/pending/rejected), null if not logged in")
    private Integer myRegistrationCount;
}
