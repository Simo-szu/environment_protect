package com.youthloop.points.application.service;

import com.youthloop.common.util.SecurityUtil;
import com.youthloop.points.api.dto.TaskDTO;
import com.youthloop.points.persistence.entity.DailyTaskEntity;
import com.youthloop.points.persistence.entity.DailyTaskProgressEntity;
import com.youthloop.points.persistence.mapper.DailyTaskMapper;
import com.youthloop.points.persistence.mapper.DailyTaskProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 任务服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {
    
    private static final ZoneId ASIA_SHANGHAI = ZoneId.of("Asia/Shanghai");
    
    private final DailyTaskMapper dailyTaskMapper;
    private final DailyTaskProgressMapper dailyTaskProgressMapper;
    private final PointsService pointsService;
    
    /**
     * 获取今日任务列表
     */
    public List<TaskDTO> getTodayTasks() {
        UUID userId = SecurityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now(ASIA_SHANGHAI);
        
        // 获取所有启用的任务
        List<DailyTaskEntity> tasks = dailyTaskMapper.selectAllEnabled();
        
        // 获取用户今日进度
        List<DailyTaskProgressEntity> progressList = dailyTaskProgressMapper.selectByUserIdAndDate(userId, today);
        Map<UUID, DailyTaskProgressEntity> progressMap = progressList.stream()
            .collect(Collectors.toMap(DailyTaskProgressEntity::getTaskId, p -> p));
        
        // 组装DTO
        List<TaskDTO> result = new ArrayList<>();
        for (DailyTaskEntity task : tasks) {
            DailyTaskProgressEntity progress = progressMap.get(task.getId());
            
            TaskDTO dto = TaskDTO.builder()
                .id(task.getId())
                .code(task.getCode())
                .name(task.getName())
                .points(task.getPoints())
                .progress(progress != null ? progress.getProgress() : 0)
                .target(progress != null ? progress.getTarget() : 1)
                .status(progress != null ? progress.getStatus() : 1) // 1=doing
                .build();
            
            result.add(dto);
        }
        
        return result;
    }
    
    /**
     * 领取任务奖励
     */
    @Transactional
    public void claimTaskReward(UUID taskId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now(ASIA_SHANGHAI);
        
        // 查询任务
        DailyTaskEntity task = dailyTaskMapper.selectById(taskId);
        if (task == null || !task.getIsEnabled()) {
            throw new IllegalArgumentException("任务不存在或已禁用");
        }
        
        // 查询进度
        DailyTaskProgressEntity progress = dailyTaskProgressMapper.selectByUserIdDateAndTaskId(userId, today, taskId);
        if (progress == null) {
            throw new IllegalStateException("任务进度不存在");
        }
        
        if (progress.getStatus() != 2) { // 2=claimable
            throw new IllegalStateException("任务未完成或已领取");
        }
        
        // 更新状态为已完成
        progress.setStatus(3); // 3=done
        progress.setUpdatedAt(LocalDateTime.now());
        dailyTaskProgressMapper.update(progress);
        
        // 发放积分
        pointsService.addPoints(userId, task.getPoints(), 2, null, taskId, "任务奖励: " + task.getName());
        
        log.info("领取任务奖励: userId={}, taskId={}, points={}", userId, taskId, task.getPoints());
    }
    
    /**
     * 更新任务进度(由其他模块调用)
     */
    @Transactional
    public void updateTaskProgress(UUID userId, String taskCode, int increment) {
        LocalDate today = LocalDate.now(ASIA_SHANGHAI);
        
        // 查询任务
        List<DailyTaskEntity> tasks = dailyTaskMapper.selectAllEnabled();
        DailyTaskEntity task = tasks.stream()
            .filter(t -> t.getCode().equals(taskCode))
            .findFirst()
            .orElse(null);
        
        if (task == null) {
            log.warn("任务不存在: taskCode={}", taskCode);
            return;
        }
        
        // 查询或创建进度
        DailyTaskProgressEntity progress = dailyTaskProgressMapper.selectByUserIdDateAndTaskId(userId, today, task.getId());
        
        if (progress == null) {
            // 创建新进度
            progress = new DailyTaskProgressEntity();
            progress.setUserId(userId);
            progress.setTaskDate(today);
            progress.setTaskId(task.getId());
            progress.setProgress(increment);
            progress.setTarget(1); // 默认目标为1,实际应从rule_json读取
            progress.setStatus(progress.getProgress() >= progress.getTarget() ? 2 : 1);
            progress.setUpdatedAt(LocalDateTime.now());
            dailyTaskProgressMapper.insert(progress);
        } else {
            // 更新进度
            if (progress.getStatus() == 3) {
                // 已完成,不再更新
                return;
            }
            
            progress.setProgress(progress.getProgress() + increment);
            progress.setStatus(progress.getProgress() >= progress.getTarget() ? 2 : 1);
            progress.setUpdatedAt(LocalDateTime.now());
            dailyTaskProgressMapper.update(progress);
        }
        
        log.info("更新任务进度: userId={}, taskCode={}, progress={}/{}", 
            userId, taskCode, progress.getProgress(), progress.getTarget());
    }
}
