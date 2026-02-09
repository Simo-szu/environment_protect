package com.youthloop.social.api.web.controller.files;

import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.storage.StorageService;
import com.youthloop.social.api.web.dto.PresignRequest;
import com.youthloop.social.api.web.dto.PresignResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "文件上传", description = "获取对象存储预签名 URL")
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FilesController {

    private final StorageService storageService;

    @Operation(summary = "获取上传预签名 URL", description = "获取对象存储预签名 URL")
    @PostMapping("/presign")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<PresignResponse> getPresignUrl(
        @Valid @RequestBody UnifiedRequest<PresignRequest> request
    ) {
        PresignRequest data = request.getData();

        StorageService.PresignResult result = storageService.generateUploadPresignUrl(
            data.getFileType(),
            data.getFileName(),
            data.getContentType()
        );

        PresignResponse response = new PresignResponse();
        response.setUploadUrl(result.uploadUrl());
        response.setFileUrl(result.fileUrl());
        response.setExpiresIn(result.expiresIn());

        return ApiSpecResponse.ok(response);
    }
}
