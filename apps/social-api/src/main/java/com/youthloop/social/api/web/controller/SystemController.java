package com.youthloop.social.api.web.controller;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "系统配置", description = "获取系统公开配置信息")
@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    @Value("${google.client-id:}")
    private String googleClientId;

    @Operation(summary = "获取公开配置", description = "获取前端需要的公开配置")
    @GetMapping("/config")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("googleClientId", googleClientId);
        return ApiSpecResponse.ok(config);
    }
}
