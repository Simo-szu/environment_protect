package com.youthloop.social.api.web.controller.points;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.points.api.dto.ExchangeRequestDTO;
import com.youthloop.points.api.dto.GoodDTO;
import com.youthloop.points.api.dto.PointsAccountDTO;
import com.youthloop.points.api.dto.PointsLedgerDTO;
import com.youthloop.points.api.dto.QuizDTO;
import com.youthloop.points.api.dto.QuizSubmitRequest;
import com.youthloop.points.api.dto.QuizSubmitResponse;
import com.youthloop.points.api.dto.SigninRecordDTO;
import com.youthloop.points.api.dto.SigninRequest;
import com.youthloop.points.api.dto.SigninResponse;
import com.youthloop.points.api.dto.TaskDTO;
import com.youthloop.points.api.facade.PointsFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "积分系统", description = "签到、任务、问答、积分账户")
@RestController
@RequestMapping("/api/v1/points")
@RequiredArgsConstructor
public class PointsController {

    private final PointsFacade pointsFacade;

    @Operation(summary = "签到", description = "用户每日签到或补签")
    @PostMapping("/signins")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<SigninResponse> signin(@Valid @RequestBody UnifiedRequest<SigninRequest> request) {
        SigninResponse response = pointsFacade.signin(request.getData());
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "获取今日签到状态", description = "检查今日是否已签到")
    @GetMapping("/signins/today")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<SigninRecordDTO> getTodaySignin() {
        SigninRecordDTO response = pointsFacade.getTodaySignin();
        if (response == null) {
            response = SigninRecordDTO.builder().isSigned(false).build();
        }
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "获取今日任务列表", description = "获取所有启用每日任务及用户进度")
    @GetMapping("/tasks")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<TaskDTO>> getTodayTasks() {
        List<TaskDTO> tasks = pointsFacade.getTodayTasks();
        ApiPageData<TaskDTO> pageData = new ApiPageData<>(
            1,
            tasks.size(),
            (long) tasks.size(),
            tasks
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "领取任务奖励", description = "任务完成后领取积分奖励")
    @PostMapping("/tasks/{taskId}/claim")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> claimTaskReward(
        @Parameter(description = "任务 ID") @PathVariable UUID taskId
    ) {
        pointsFacade.claimTaskReward(taskId);
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "获取今日问答", description = "获取今日问答题目")
    @GetMapping("/quiz/today")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<QuizDTO> getTodayQuiz() {
        QuizDTO quiz = pointsFacade.getTodayQuiz();
        return ApiSpecResponse.ok(quiz);
    }

    @Operation(summary = "提交问答答案", description = "提交答案并获得积分")
    @PostMapping("/quiz/submissions")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<QuizSubmitResponse> submitQuiz(@Valid @RequestBody UnifiedRequest<QuizSubmitRequest> request) {
        QuizSubmitResponse response = pointsFacade.submitQuiz(request.getData());
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "获取积分账户", description = "获取当前用户积分余额")
    @GetMapping("/account")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<PointsAccountDTO> getAccount() {
        PointsAccountDTO account = pointsFacade.getAccount();
        return ApiSpecResponse.ok(account);
    }

    @Operation(summary = "获取积分明细", description = "分页获取积分变动记录")
    @GetMapping("/ledger")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<PointsLedgerDTO>> getLedger(
        @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
        @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<PointsLedgerDTO> response = pointsFacade.getLedger(page, size);
        ApiPageData<PointsLedgerDTO> pageData = new ApiPageData<>(
            response.getPage(),
            response.getSize(),
            response.getTotal(),
            response.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "获取可兑换商品列表", description = "获取所有上架积分商品")
    @GetMapping("/exchange/goods")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<GoodDTO>> getExchangeGoods() {
        List<GoodDTO> goods = pointsFacade.getExchangeGoods();
        ApiPageData<GoodDTO> pageData = new ApiPageData<>(
            1,
            goods.size(),
            (long) goods.size(),
            goods
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "兑换商品", description = "使用积分兑换商品")
    @PostMapping("/exchange/orders")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<Map<String, Object>> exchange(@Valid @RequestBody UnifiedRequest<ExchangeRequestDTO> request) {
        pointsFacade.exchange(request.getData());
        return ApiSpecResponse.ok(Map.of());
    }
}
