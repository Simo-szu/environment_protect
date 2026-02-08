package com.youthloop.common.api.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 分页数据结构
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "分页数据结构")
public class ApiPageData<T> {

    @Schema(description = "页码（从 1 开始）", example = "1")
    private Integer page;

    @Schema(description = "每页大小", example = "10")
    private Integer size;

    @Schema(description = "总记录数", example = "156")
    private Long total;

    @Schema(description = "数据列表")
    private List<T> items;
}
