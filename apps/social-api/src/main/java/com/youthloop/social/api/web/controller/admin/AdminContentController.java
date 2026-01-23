package com.youthloop.social.api.web.controller.admin;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.content.application.dto.CreateContentRequest;
import com.youthloop.content.application.dto.PublishContentRequest;
import com.youthloop.content.application.dto.UpdateContentRequest;
import com.youthloop.content.application.service.ContentCommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 管理端 - 内容管理 Controller
 */
@Tag(name = "管理端 - 内容管理", description = "内容的创建、更新、发布、删除")
@RestController
@RequestMapping("/api/v1/admin/contents")
@RequiredArgsConstructor
public class AdminContentController {
    
    private final ContentCommandService contentCommandService;
    
    @Operation(summary = "创建内容", description = "创建新的内容（默认为草稿状态）")
    @PostMapping
    public BaseResponse<UUID> createContent(@Valid @RequestBody CreateContentRequest request) {
        UUID contentId = contentCommandService.createContent(request);
        return BaseResponse.success(contentId);
    }
    
    @Operation(summary = "更新内容", description = "更新指定内容的信息")
    @PutMapping("/{id}")
    public BaseResponse<Void> updateContent(
            @PathVariable UUID id,
            @RequestBody UpdateContentRequest request) {
        contentCommandService.updateContent(id, request);
        return BaseResponse.success();
    }
    
    @Operation(summary = "发布内容", description = "将草稿状态的内容发布")
    @PostMapping("/{id}/publish")
    public BaseResponse<Void> publishContent(
            @PathVariable UUID id,
            @RequestBody(required = false) PublishContentRequest request) {
        contentCommandService.publishContent(id);
        return BaseResponse.success();
    }
    
    @Operation(summary = "删除内容", description = "删除指定内容（物理删除）")
    @DeleteMapping("/{id}")
    public BaseResponse<Void> deleteContent(@PathVariable UUID id) {
        contentCommandService.deleteContent(id);
        return BaseResponse.success();
    }
}
