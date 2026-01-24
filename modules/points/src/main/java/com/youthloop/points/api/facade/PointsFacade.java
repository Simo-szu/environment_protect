package com.youthloop.points.api.facade;

import com.youthloop.points.api.dto.*;
import java.util.List;
import java.util.UUID;

/**
 * 积分系统门面接口
 */
public interface PointsFacade {
    
    /**
     * 签到
     */
    SigninResponse signin(SigninRequest request);
    
    /**
     * 获取今日任务列表
     */
    List<TaskDTO> getTodayTasks();
    
    /**
     * 领取任务奖励
     */
    void claimTaskReward(UUID taskId);
    
    /**
     * 获取今日问答
     */
    QuizDTO getTodayQuiz();
    
    /**
     * 提交问答答案
     */
    QuizSubmitResponse submitQuiz(QuizSubmitRequest request);
    
    /**
     * 获取用户积分账户
     */
    PointsAccountDTO getAccount();
}
