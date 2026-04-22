package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Official national carbon market snapshot for homepage display.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Official national carbon market snapshot")
public class CarbonMarketSnapshotDTO {

    @Schema(description = "Official source page URL")
    private String sourceUrl;

    @Schema(description = "Official source name")
    private String sourceName;

    @Schema(description = "Trade date")
    private LocalDate tradeDate;

    @Schema(description = "Latest quote time")
    private LocalTime quoteTime;

    @Schema(description = "Market status")
    private String marketStatus;

    @Schema(description = "Closing price in CNY per ton")
    private BigDecimal closingPrice;

    @Schema(description = "Closing price change percent versus previous trading day")
    private BigDecimal closingChangePercent;

    @Schema(description = "Previous close price in CNY per ton")
    private BigDecimal previousClosePrice;

    @Schema(description = "Open price in CNY per ton")
    private BigDecimal openPrice;

    @Schema(description = "High price in CNY per ton")
    private BigDecimal highPrice;

    @Schema(description = "Low price in CNY per ton")
    private BigDecimal lowPrice;

    @Schema(description = "Whether the closing price increased versus previous trading day")
    private Boolean priceUp;

    @Schema(description = "Daily total volume in tons")
    private Long dailyVolume;

    @Schema(description = "Daily total turnover in CNY")
    private BigDecimal dailyTurnover;

    @Schema(description = "Cumulative total volume in tons")
    private Long cumulativeVolume;

    @Schema(description = "Cumulative total turnover in CNY")
    private BigDecimal cumulativeTurnover;

    @Schema(description = "Daily total volume text from source")
    private String dailyVolumeText;

    @Schema(description = "Daily total turnover text from source")
    private String dailyTurnoverText;

    @Schema(description = "Cumulative total volume text from source")
    private String cumulativeVolumeText;

    @Schema(description = "Cumulative total turnover text from source")
    private String cumulativeTurnoverText;

    @Schema(description = "Recent trend points")
    private List<CarbonMarketTrendPointDTO> trendPoints;

    @Schema(description = "System sync time")
    private LocalDateTime syncedAt;
}
