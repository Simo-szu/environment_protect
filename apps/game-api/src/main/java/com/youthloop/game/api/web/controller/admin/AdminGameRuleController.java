package com.youthloop.game.api.web.controller.admin;

import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.RequireAdmin;
import com.youthloop.game.api.dto.AdminGameRulesConfigDTO;
import com.youthloop.game.api.dto.AdminUpdateGameRulesRequest;
import com.youthloop.game.api.facade.GameRuleAdminFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Admin controller for game rules configuration.
 */
@Tag(name = "Admin-Game-Rule", description = "Admin APIs for game rule configuration")
@RestController
@RequestMapping("/api/v1/admin/game/rules")
@RequiredArgsConstructor
@RequireAdmin
public class AdminGameRuleController {

    private final GameRuleAdminFacade gameRuleAdminFacade;

    @Operation(summary = "Get editable game rule configuration")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<AdminGameRulesConfigDTO> getRules() {
        return ApiSpecResponse.ok(gameRuleAdminFacade.getRules());
    }

    @Operation(summary = "Update game rule configuration")
    @PatchMapping
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> updateRules(
        @Valid @RequestBody UnifiedRequest<AdminUpdateGameRulesRequest> request
    ) {
        gameRuleAdminFacade.updateRules(request.getData());
        return ApiSpecResponse.ok(Map.of());
    }
}

