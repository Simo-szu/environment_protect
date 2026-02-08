package com.youthloop.social.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * OpenAPI 全局配置
 * 统一补齐业务响应示例与错误响应示例。
 */
@Configuration
public class GlobalOpenApiConfig {

    @Bean
    public OpenApiCustomizer unifiedResponseCustomizer() {
        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }

            openApi.getPaths().forEach((path, pathItem) -> {
                if ("/api-docs".equals(path)) {
                    return;
                }
                customizePathItem(pathItem);
            });
        };
    }

    private void customizePathItem(PathItem pathItem) {
        if (pathItem.readOperations() == null) {
            return;
        }
        for (Operation operation : pathItem.readOperations()) {
            ApiResponses responses = operation.getResponses();
            if (responses == null) {
                responses = new ApiResponses();
                operation.setResponses(responses);
            }

            ensureSuccessExample(responses);
            addResponseIfAbsent(responses, "400", buildResponse(
                "请求参数错误",
                errorExample(1001, "参数校验失败", 400, "validation_error")
            ));
            addResponseIfAbsent(responses, "401", buildResponse(
                "未认证",
                errorExample(2000, "未登录或登录已过期", 401, "unauthorized")
            ));
            addResponseIfAbsent(responses, "403", buildResponse(
                "无权限访问",
                errorExample(2003, "无权限访问", 403, "forbidden")
            ));
            addResponseIfAbsent(responses, "500", buildResponse(
                "服务器内部错误",
                errorExample(500, "系统错误", 500, "system_error")
            ));
        }
    }

    private void addResponseIfAbsent(ApiResponses responses, String status, ApiResponse apiResponse) {
        if (responses.get(status) == null) {
            responses.addApiResponse(status, apiResponse);
        }
    }

    private void ensureSuccessExample(ApiResponses responses) {
        ApiResponse success = firstSuccessResponse(responses);
        if (success == null) {
            success = new ApiResponse().description("请求成功");
            responses.addApiResponse("200", success);
        }

        if (success.getContent() == null) {
            success.setContent(new Content());
        }

        MediaType appJson = success.getContent().get("application/json");
        if (appJson == null) {
            appJson = new MediaType();
            success.getContent().addMediaType("application/json", appJson);
        }

        if (appJson.getExample() == null) {
            appJson.setExample(successExample());
        }
    }

    private ApiResponse firstSuccessResponse(ApiResponses responses) {
        if (responses.get("200") != null) return responses.get("200");
        if (responses.get("201") != null) return responses.get("201");
        if (responses.get("202") != null) return responses.get("202");
        if (responses.get("204") != null) return responses.get("204");
        return null;
    }

    private ApiResponse buildResponse(String description, Map<String, Object> example) {
        MediaType mediaType = new MediaType();
        mediaType.setExample(example);
        Content content = new Content();
        content.addMediaType("application/json", mediaType);
        return new ApiResponse().description(description).content(content);
    }

    private Map<String, Object> successExample() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", "123e4567-e89b-12d3-a456-426614174000");
        data.put("name", "示例数据");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("code", 0);
        result.put("message", "操作成功");
        result.put("data", data);
        result.put("traceId", "a1b2c3d4e5f6g7h8");
        return result;
    }

    private Map<String, Object> errorExample(int code, String message, int httpStatus, String type) {
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("field", "data.exampleField");
        detail.put("reason", "示例错误原因");

        Map<String, Object> error = new LinkedHashMap<>();
        error.put("type", "https://api.youthloop.com/errors/" + type);
        error.put("httpStatus", httpStatus);
        error.put("details", Collections.singletonList(detail));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("code", code);
        result.put("message", message);
        result.put("data", null);
        result.put("traceId", "a1b2c3d4e5f6g7h8");
        result.put("error", error);
        return result;
    }
}
