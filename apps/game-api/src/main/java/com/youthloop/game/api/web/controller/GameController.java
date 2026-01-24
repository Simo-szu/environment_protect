package com.youthloop.game.api.web.controller;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.api.facade.GameFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * 游戏 Controller
 * 4个核心端点
 */
@Tag(name = "游戏", description = "虚拟池塘游戏")
@RestController
@RequestMapping("/api/v1/game")
@RequiredArgsConstructor
public class GameController {
    
    private final GameFacade gameFacade;
    
    @Operation(summary = "开始游戏会话", description = "创建新的游戏会话或返回现有活跃会话")
    @PostMapping("/sessions/start")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<GameSessionDTO> startSession() {
        GameSessionDTO session = gameFacade.startSession();
        return BaseResponse.success(session);
    }
    
    @Operation(summary = "获取当前会话", description = "获取用户当前的活跃游戏会话")
    @GetMapping("/sessions/current")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<GameSessionDTO> getCurrentSession() {
        GameSessionDTO session = gameFacade.getCurrentSession();
        return BaseResponse.success(session);
    }
    
    @Operation(summary = "执行游戏操作", description = "执行游戏操作(喂食/清洁/添加植物/添加鱼/调整参数)")
    @PostMapping("/actions")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<GameActionResponse> performAction(@Valid @RequestBody GameActionRequest request) {
        GameActionResponse response = gameFacade.performAction(request);
        return BaseResponse.success(response);
    }
    
    @Operation(summary = "结束游戏会话", description = "结束当前的游戏会话")
    @PostMapping("/sessions/end")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> endSession() {
        gameFacade.endSession();
        return BaseResponse.success(null);
    }
}
