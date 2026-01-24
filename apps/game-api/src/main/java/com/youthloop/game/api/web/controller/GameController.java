package com.youthloop.game.api.web.controller;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.api.facade.GameFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

/**
 * 游戏 Controller
 * 符合 Project-Structure v0.4 规范
 */
@Tag(name = "游戏", description = "虚拟池塘游戏")
@RestController
@RequestMapping("/api/v1/game")
@RequiredArgsConstructor
public class GameController {
    
    private final GameFacade gameFacade;
    
    @Operation(summary = "获取玩家游戏资料", description = "获取玩家游戏侧资料/进度")
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<GameSessionDTO> getProfile() {
        // 复用 getCurrentSession 逻辑，返回当前会话作为玩家资料
        GameSessionDTO session = gameFacade.getCurrentSession();
        return BaseResponse.success(session);
    }
    
    @Operation(summary = "开始游戏会话", description = "开始一局游戏（返回 sessionId）")
    @PostMapping("/sessions")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<GameSessionDTO> startSession() {
        GameSessionDTO session = gameFacade.startSession();
        return BaseResponse.success(session);
    }
    
    @Operation(summary = "上报游戏事件", description = "上报关键事件（用于成就/积分/回放，v0.1 可简化）")
    @PostMapping("/sessions/{id}/events")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<GameActionResponse> reportEvent(
        @Parameter(description = "会话 ID") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<GameActionRequest> request
    ) {
        GameActionRequest data = request.getData();
        // 设置 sessionId 从路径参数
        data.setSessionId(id);
        GameActionResponse response = gameFacade.performAction(data);
        return BaseResponse.success(response);
    }
    
    @Operation(summary = "结束游戏会话", description = "结束一局游戏（返回结算结果）")
    @PostMapping("/sessions/{id}/finish")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<GameActionResponse> finishSession(
        @Parameter(description = "会话 ID") @PathVariable UUID id
    ) {
        GameActionResponse response = gameFacade.endSession(id);
        return BaseResponse.success(response);
    }
}
