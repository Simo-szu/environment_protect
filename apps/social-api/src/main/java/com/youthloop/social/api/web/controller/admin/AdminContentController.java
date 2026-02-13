package com.youthloop.social.api.web.controller.admin;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.RequireAdmin;
import com.youthloop.content.api.dto.ContentDTO;
import com.youthloop.content.api.dto.ContentListDTO;
import com.youthloop.content.api.dto.ContentQueryRequest;
import com.youthloop.content.api.dto.CreateContentRequest;
import com.youthloop.content.api.dto.UpdateContentRequest;
import com.youthloop.content.api.facade.ContentCommandFacade;
import com.youthloop.content.api.facade.ContentQueryFacade;
import com.youthloop.ingestion.api.dto.DailyIngestionSummary;
import com.youthloop.ingestion.api.facade.ContentIngestionFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Admin Content", description = "Content management and ingestion trigger")
@RestController
@RequestMapping("/api/v1/admin/contents")
@RequiredArgsConstructor
@RequireAdmin
public class AdminContentController {

    private final ContentQueryFacade contentQueryFacade;
    private final ContentCommandFacade contentCommandFacade;
    private final ContentIngestionFacade contentIngestionFacade;

    @Operation(summary = "Get content list", description = "Admin query content list with optional all-status and keyword search")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<ContentListDTO>> getContents(
        @Parameter(description = "Content type") @RequestParam(value = "type", required = false) Integer type,
        @Parameter(description = "Content status") @RequestParam(value = "status", required = false) Integer status,
        @Parameter(description = "Keyword") @RequestParam(value = "keyword", required = false) String keyword,
        @Parameter(description = "Page number") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") Integer size
    ) {
        ContentQueryRequest query = new ContentQueryRequest();
        query.setType(type);
        query.setStatus(status);
        query.setKeyword(keyword);
        query.setPage(page);
        query.setSize(size);
        query.setIncludeAllStatus(status == null);

        PageResponse<ContentListDTO> result = contentQueryFacade.getContentList(query);
        ApiPageData<ContentListDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "Get content detail", description = "Admin query content detail")
    @GetMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<ContentDTO> getContentById(
        @Parameter(description = "Content ID") @PathVariable("id") UUID id
    ) {
        return ApiSpecResponse.ok(contentQueryFacade.getContentById(id));
    }

    @Operation(summary = "Create content", description = "Admin create content")
    @PostMapping
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<UUID> createContent(
        @Valid @RequestBody UnifiedRequest<CreateContentRequest> request
    ) {
        UUID contentId = contentCommandFacade.createContent(request.getData());
        return ApiSpecResponse.ok(contentId);
    }

    @Operation(summary = "Update content", description = "Admin update content")
    @PatchMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> updateContent(
        @Parameter(description = "Content ID") @PathVariable("id") UUID id,
        @Valid @RequestBody UnifiedRequest<UpdateContentRequest> request
    ) {
        contentCommandFacade.updateContent(id, request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "Publish content", description = "Admin publish content")
    @PostMapping("/{id}/publish")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> publishContent(
        @Parameter(description = "Content ID") @PathVariable("id") UUID id
    ) {
        contentCommandFacade.publishContent(id);
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "Delete content", description = "Admin delete content")
    @DeleteMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> deleteContent(
        @Parameter(description = "Content ID") @PathVariable("id") UUID id
    ) {
        contentCommandFacade.deleteContent(id);
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "Trigger ingestion", description = "Admin trigger one ingestion run immediately")
    @PostMapping("/ingestion/trigger")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<DailyIngestionSummary> triggerIngestion() {
        DailyIngestionSummary summary = contentIngestionFacade.ingestDaily();
        return ApiSpecResponse.ok(summary);
    }
}
