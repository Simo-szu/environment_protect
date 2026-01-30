package com.youthloop.points.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 兑换请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "兑换请求")
public class ExchangeRequestDTO {
    
    @NotNull(message = "商品 ID 不能为空")
    @Schema(description = "商品 ID", required = true)
    private UUID goodId;
    
    @NotBlank(message = "收货人姓名不能为空")
    @Schema(description = "收货人姓名", required = true, example = "张三")
    private String recipientName;
    
    @NotBlank(message = "收货人电话不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    @Schema(description = "收货人电话", required = true, example = "13800138000")
    private String recipientPhone;
    
    @NotBlank(message = "收货地址不能为空")
    @Schema(description = "收货地址", required = true, example = "北京市朝阳区xxx街道xxx号")
    private String shippingAddress;
    
    @Schema(description = "备注信息", example = "请在工作日送货")
    private String shippingNote;
}
