package com.youthloop.social.api.web.controller.points;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.points.api.dto.*;
import com.youthloop.points.api.facade.PointsFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

/**
 * 积分系统 Controller
 */
@Tag(name = "积分系统", description = "签到、任务、问答、积分账户")
@RestController
@RequestMapping("/api/v1/points")
@RequiredArgsConstructor
public class PointsController {
    
    private final PointsFacade pointsFacade;
    
    @Operation(summary = "签到", description = "用户每日签到或补签")
    @PostMapping("/signins")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<SigninResponse> signin(@Valid @RequestBody UnifiedRequest<SigninRequest> request) {
        SigninResponse response = pointsFacade.signin(request.getData());
        return BaseResponse.success(response);
    }
    
    @Operation(summary = "获取今日任务列表", description = "获取所有启用的每日任务及用户进度")
    @GetMapping("/tasks")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<List<TaskDTO>> getTodayTasks() {
        List<TaskDTO> tasks = pointsFacade.getTodayTasks();
        return BaseResponse.success(tasks);
    }
    
    @Operation(summary = "领取任务奖励", description = "任务完成后领取积分奖励")
    @PostMapping("/tasks/{taskId}/claim")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> claimTaskReward(
        @Parameter(description = "任务 ID") @PathVariable UUID taskId
    ) {
        pointsFacade.claimTaskReward(taskId);
        return BaseResponse.success(null);
    }
    
    @Operation(summary = "获取今日问答", description = "获取今日问答题目")
    @GetMapping("/quiz/today")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<QuizDTO> getTodayQuiz() {
        QuizDTO quiz = pointsFacade.getTodayQuiz();
        return BaseResponse.success(quiz);
    }
    
    @Operation(summary = "提交问答答案", description = "提交答案并获得积分（答对才有）")
    @PostMapping("/quiz/submissions")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<QuizSubmitResponse> submitQuiz(@Valid @RequestBody UnifiedRequest<QuizSubmitRequest> request) {
        QuizSubmitResponse response = pointsFacade.submitQuiz(request.getData());
        return BaseResponse.success(response);
    }
    
    @Operation(summary = "获取积分账户", description = "获取当前用户的积分余额")
    @GetMapping("/account")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<PointsAccountDTO> getAccount() {
        PointsAccountDTO account = pointsFacade.getAccount();
        return BaseResponse.success(account);
    }
}
