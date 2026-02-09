package com.youthloop.common.api.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Field-level error detail.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Field-level error detail")
public class ApiFieldError {

    @Schema(description = "Field name", example = "email")
    private String field;

    @Schema(description = "Error message", example = "Invalid email format")
    private String message;
}
