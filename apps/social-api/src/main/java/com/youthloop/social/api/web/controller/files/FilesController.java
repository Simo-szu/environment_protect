package com.youthloop.social.api.web.controller.files;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.storage.StorageService;
import com.youthloop.social.api.web.dto.PresignRequest;
import com.youthloop.social.api.web.dto.PresignResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 文件上传 Controller
 */
@Tag(name = "文件上传", description = "获取对象存储预签名 URL")
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FilesController {
    
    private final StorageService storageService;
    
    @Operation(summary = "获取上传预签名 URL", description = "获取对象存储的预签名 URL，用于头像、活动海报等文件上传")
    @PostMapping("/presign")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<PresignResponse> getPresignUrl(
        @Valid @RequestBody UnifiedRequest<PresignRequest> request
    ) {
        PresignRequest data = request.getData();
        
        // 生成预签名 URL
        StorageService.PresignResult result = storageService.generateUploadPresignUrl(
            data.getFileType(),
            data.getFileName(),
            data.getContentType()
        );
        
        PresignResponse response = new PresignResponse();
        response.setUploadUrl(result.uploadUrl());
        response.setFileUrl(result.fileUrl());
        response.setExpiresIn(result.expiresIn());
        
        return BaseResponse.success(response);
    }
}
