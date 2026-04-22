package com.youthloop.social.api.web.controller.admin;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.RequireAdmin;
import com.youthloop.ingestion.api.dto.CarbonMarketManualSyncResultDTO;
import com.youthloop.ingestion.api.facade.CarbonMarketSyncFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Carbon Market", description = "Carbon market manual sync operations")
@RestController
@RequestMapping("/api/v1/admin/market/carbon")
@RequiredArgsConstructor
@RequireAdmin
public class AdminCarbonMarketController {

    private final CarbonMarketSyncFacade carbonMarketSyncFacade;

    @Operation(summary = "Trigger carbon market sync", description = "Admin manually triggers one carbon market sync run immediately")
    @PostMapping("/sync")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<CarbonMarketManualSyncResultDTO> triggerCarbonMarketSync() {
        return ApiSpecResponse.ok(carbonMarketSyncFacade.triggerManualSync());
    }
}
