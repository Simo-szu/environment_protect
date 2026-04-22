package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * Homepage aggregate DTO.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Homepage aggregate data")
public class HomeDTO {

    @Schema(description = "Homepage banners")
    private List<HomeBannerDTO> banners;

    @Schema(description = "Latest content list")
    private List<ContentListItemDTO> latestContents;

    @Schema(description = "Latest activity list")
    private List<ActivityListItemDTO> latestActivities;

    @Schema(description = "Official national carbon market snapshot")
    private CarbonMarketSnapshotDTO marketSnapshot;
}
