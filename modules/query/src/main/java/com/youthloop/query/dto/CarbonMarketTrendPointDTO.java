package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One trend point for homepage carbon market chart.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Homepage carbon market trend point")
public class CarbonMarketTrendPointDTO {

    @Schema(description = "Trade date")
    private LocalDate tradeDate;

    @Schema(description = "Previous close price in CNY per ton")
    private BigDecimal previousClosePrice;

    @Schema(description = "Closing price in CNY per ton")
    private BigDecimal closingPrice;

    @Schema(description = "Low price in CNY per ton")
    private BigDecimal lowPrice;

    @Schema(description = "High price in CNY per ton")
    private BigDecimal highPrice;

    @Schema(description = "Volume in tons")
    private Long volume;
}
