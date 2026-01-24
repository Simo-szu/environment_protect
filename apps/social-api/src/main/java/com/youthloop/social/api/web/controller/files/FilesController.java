package com.youthloop.social.api.web.controller.files;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
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
    
    // TODO: 实现文件服务 Facade
    // private final FilesFacade filesFacade;
    
    @Operation(summary = "获取上传预签名 URL", description = "获取对象存储的预签名 URL，用于头像、活动海报等文件上传")
    @PostMapping("/presign")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<PresignResponse> getPresignUrl(
        @Valid @RequestBody UnifiedRequest<PresignRequest> request
    ) {
        // TODO: 实现预签名逻辑
        // PresignResponse response = filesFacade.generatePresignUrl(request.getData());
        
        // 临时返回模拟数据
        PresignResponse response = new PresignResponse();
        response.setUploadUrl("https://example.com/upload");
        response.setFileUrl("https://example.com/files/example.jpg");
        response.setExpiresIn(3600);
        
        return BaseResponse.success(response);
    }
}
