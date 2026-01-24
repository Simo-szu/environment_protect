package com.youthloop.points.application.facade;

import com.youthloop.common.util.SecurityUtil;
import com.youthloop.points.api.dto.*;
import com.youthloop.points.api.facade.PointsFacade;
import com.youthloop.points.application.service.PointsService;
import com.youthloop.points.application.service.QuizService;
import com.youthloop.points.application.service.SigninService;
import com.youthloop.points.application.service.TaskService;
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
    
    @Override
    public SigninResponse signin(SigninRequest request) {
        return signinService.signin(request);
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
        
        return PointsAccountDTO.builder()
            .userId(userId)
            .balance(balance)
            .build();
    }
}
