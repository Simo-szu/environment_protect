package com.youthloop.social.api.web.controller;

import com.youthloop.common.api.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查 Controller
 */
@Tag(name = "健康检查", description = "系统健康检查接口")
@RestController
@RequestMapping("/api/v1")
public class HealthController {
    
    @Operation(summary = "健康检查", description = "检查服务是否正常运行")
    @GetMapping("/health")
    public BaseResponse<Map<String, Object>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("service", "social-api");
        data.put("timestamp", LocalDateTime.now());
        return BaseResponse.success(data);
    }
}
