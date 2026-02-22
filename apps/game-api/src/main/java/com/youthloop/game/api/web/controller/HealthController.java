package com.youthloop.game.api.web.controller;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.AllowGuest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Health", description = "Service health endpoints")
@RestController
@AllowGuest
public class HealthController {

    @Operation(summary = "Health check", description = "Check whether game-api is running")
    @GetMapping("/health")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<Map<String, Object>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("service", "game-api");
        data.put("timestamp", LocalDateTime.now());
        return ApiSpecResponse.ok(data);
    }
}
