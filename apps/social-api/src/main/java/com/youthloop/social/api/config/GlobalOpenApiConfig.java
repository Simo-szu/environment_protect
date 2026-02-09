package com.youthloop.social.api.config;

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
 * OpenAPI global response examples aligned with API_REQUEST_RESPONSE_SPEC.md.
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
            addResponseIfAbsent(responses, "400", buildResponse("Bad request", errorExample("Validation failed")));
            addResponseIfAbsent(responses, "401", buildResponse("Unauthorized", errorExample("Unauthorized")));
            addResponseIfAbsent(responses, "403", buildResponse("Forbidden", errorExample("Forbidden")));
            addResponseIfAbsent(responses, "500", buildResponse("Internal server error", errorExample("Internal server error")));
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
            success = new ApiResponse().description("Success");
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
        data.put("name", "example");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("data", data);
        result.put("traceId", "a1b2c3d4e5f6g7h8");
        return result;
    }

    private Map<String, Object> errorExample(String message) {
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("field", "data.exampleField");
        detail.put("message", "example error detail");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", false);
        result.put("message", message);
        result.put("errors", Collections.singletonList(detail));
        result.put("traceId", "a1b2c3d4e5f6g7h8");
        return result;
    }
}
