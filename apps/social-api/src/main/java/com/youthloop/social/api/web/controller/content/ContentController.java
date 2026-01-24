package com.youthloop.social.api.web.controller.content;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.PageResponse;
import com.youthloop.content.api.dto.ContentDTO;
import com.youthloop.content.api.dto.ContentListDTO;
import com.youthloop.content.api.dto.ContentQueryRequest;
import com.youthloop.content.api.facade.ContentQueryFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 内容 Controller
 */
@Tag(name = "内容", description = "科普内容（新闻/动态/政策/百科）")
@RestController
@RequestMapping("/api/v1/contents")
@RequiredArgsConstructor
public class ContentController {
    
    private final ContentQueryFacade contentQueryFacade;
    
    @Operation(summary = "获取内容列表", description = "分页查询内容列表，支持按类型和状态筛选")
    @GetMapping
    public BaseResponse<PageResponse<ContentListDTO>> getContentList(ContentQueryRequest request) {
        PageResponse<ContentListDTO> response = contentQueryFacade.getContentList(request);
        return BaseResponse.success(response);
    }
    
    @Operation(summary = "获取内容详情", description = "根据 ID 查询内容详情")
    @GetMapping("/{id}")
    public BaseResponse<ContentDTO> getContentById(@PathVariable UUID id) {
        ContentDTO content = contentQueryFacade.getContentById(id);
        return BaseResponse.success(content);
    }
}
