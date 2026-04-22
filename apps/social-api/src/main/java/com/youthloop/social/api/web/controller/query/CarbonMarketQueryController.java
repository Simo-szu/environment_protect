package com.youthloop.social.api.web.controller.query;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.OptionalAuth;
import com.youthloop.query.dto.CarbonMarketSnapshotDTO;
import com.youthloop.query.facade.QueryFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Carbon market query controller for homepage polling.
 */
@Tag(name = "Carbon Market", description = "Carbon market query endpoints")
@RestController
@RequestMapping("/api/v1/market/carbon")
@RequiredArgsConstructor
@OptionalAuth
public class CarbonMarketQueryController {

    private final QueryFacade queryFacade;

    @Operation(summary = "Get latest carbon market snapshot", description = "Returns the latest realtime snapshot and daily trend")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<CarbonMarketSnapshotDTO> getLatestSnapshot() {
        return ApiSpecResponse.ok(queryFacade.getCarbonMarketSnapshot());
    }
}
