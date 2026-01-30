package com.youthloop.points.application.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.points.api.dto.*;
import com.youthloop.points.api.facade.PointsFacade;
import com.youthloop.points.application.service.PointsService;
import com.youthloop.points.application.service.QuizService;
import com.youthloop.points.application.service.SigninService;
import com.youthloop.points.application.service.TaskService;
import com.youthloop.points.application.service.ExchangeService;
import com.youthloop.points.application.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * 积分系统门面实现
 */
@Service
@RequiredArgsConstructor
public class PointsFacadeImpl implements PointsFacade {
    
    private final SigninService signinService;
    private final TaskService taskService;
    private final QuizService quizService;
    private final PointsService pointsService;
    private final ExchangeService exchangeService;
    private final LevelService levelService;
    

    public SigninResponse signin(SigninRequest request) {
        return signinService.signin(request);
    }
    
    @Override
    public SigninRecordDTO getTodaySignin() {
        return signinService.getTodaySignin();
    }
    
    @Override
    public List<TaskDTO> getTodayTasks() {
        return taskService.getTodayTasks();
    }
    
    @Override
    public void claimTaskReward(UUID taskId) {
        taskService.claimTaskReward(taskId);
    }
    
    @Override
    public QuizDTO getTodayQuiz() {
        return quizService.getTodayQuiz();
    }
    
    @Override
    public QuizSubmitResponse submitQuiz(QuizSubmitRequest request) {
        return quizService.submitQuiz(request);
    }
    
    @Override
    public PointsAccountDTO getAccount() {
        UUID userId = SecurityUtil.getCurrentUserId();
        Long balance = pointsService.getBalance(userId);
        
        // 使用LevelService根据badge表动态计算等级
        int level = levelService.calculateLevel(balance);
        long pointsToNext = levelService.calculatePointsToNextLevel(balance);
        long nextLevelMin = levelService.getLevelMinPoints(level + 1);
        
        return PointsAccountDTO.builder()
            .userId(userId)
            .balance(balance)
            .totalPoints(balance)
            .availablePoints(balance)
            .level(level)
            .pointsToNextLevel(pointsToNext)
            .nextLevelMinPoints(nextLevelMin)
            .build();
    }
    
    @Override
    public PageResponse<PointsLedgerDTO> getLedger(int page, int size) {
        UUID userId = SecurityUtil.getCurrentUserId();
        return pointsService.getLedger(userId, page, size);
    }

    @Override
    public List<GoodDTO> getExchangeGoods() {
        return exchangeService.getActiveGoods();
    }

    @Override
    public void exchange(ExchangeRequestDTO request) {
        exchangeService.exchange(request);
    }
}
