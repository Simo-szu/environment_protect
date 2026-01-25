package com.youthloop.points.application.service;

import com.youthloop.common.util.SecurityUtil;
import com.youthloop.points.api.dto.SigninRecordDTO;
import com.youthloop.points.api.dto.SigninRequest;
import com.youthloop.points.api.dto.SigninResponse;
import com.youthloop.points.persistence.entity.SigninRecordEntity;
import com.youthloop.points.persistence.mapper.SigninRecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

/**
 * 签到服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SigninService {
    
    private static final ZoneId ASIA_SHANGHAI = ZoneId.of("Asia/Shanghai");
    private static final int SIGNIN_POINTS = 5; // 签到基础积分
    private static final int MAKEUP_COST = 10; // 补签消耗积分
    
    private final SigninRecordMapper signinRecordMapper;
    private final PointsService pointsService;
    
    /**
     * 签到
     */
    @Transactional
    public SigninResponse signin(SigninRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now(ASIA_SHANGHAI);
        LocalDate signinDate = request.getSigninDate() != null ? request.getSigninDate() : today;
        Boolean isMakeup = request.getIsMakeup() != null ? request.getIsMakeup() : false;
        
        // 检查是否已签到
        SigninRecordEntity existing = signinRecordMapper.selectByUserIdAndDate(userId, signinDate);
        if (existing != null && existing.getIsSigned()) {
            log.info("用户已签到: userId={}, date={}", userId, signinDate);
            throw new IllegalStateException("今日已签到");
        }
        
        // 补签逻辑
        if (isMakeup) {
            if (signinDate.equals(today) || signinDate.isAfter(today)) {
                throw new IllegalArgumentException("不能补签今天或未来日期");
            }
            // 扣除补签积分
            pointsService.deductPoints(userId, MAKEUP_COST, 1, null, null, "补签消耗");
        }
        
        // 计算连续签到天数
        int streakCount = calculateStreakCount(userId, signinDate);
        
        // 创建签到记录
        SigninRecordEntity record = new SigninRecordEntity();
        record.setUserId(userId);
        record.setSigninDate(signinDate);
        record.setIsSigned(true);
        record.setSignedAt(LocalDateTime.now());
        record.setIsMakeup(isMakeup);
        record.setStreakCount(streakCount);
        record.setCreatedAt(LocalDateTime.now());
        
        signinRecordMapper.insert(record);
        
        // 发放签到积分
        int pointsEarned = SIGNIN_POINTS;
        pointsService.addPoints(userId, pointsEarned, 1, null, null, "签到奖励");
        
        // 获取当前总积分
        Long totalBalance = pointsService.getBalance(userId);
        
        log.info("签到成功: userId={}, date={}, streak={}, points={}", 
            userId, signinDate, streakCount, pointsEarned);
        
        return SigninResponse.builder()
            .pointsEarned(pointsEarned)
            .streakCount(streakCount)
            .totalBalance(totalBalance)
            .userId(userId)
            .signinDate(signinDate)
            .build();
    }
    
    /**
     * 计算连续签到天数
     */
    private int calculateStreakCount(UUID userId, LocalDate signinDate) {
        SigninRecordEntity latest = signinRecordMapper.selectLatestByUserId(userId);
        
        if (latest == null) {
            return 1; // 首次签到
        }
        
        LocalDate latestDate = latest.getSigninDate();
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(latestDate, signinDate);
        
        if (daysBetween == 1) {
            // 连续签到
            return latest.getStreakCount() + 1;
        } else {
            // 中断了,重新开始
            return 1;
        }
    }
    /**
     * 获取今日签到状态
     */
    public SigninRecordDTO getTodaySignin() {
        UUID userId = SecurityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now(ASIA_SHANGHAI);
        
        SigninRecordEntity entity = signinRecordMapper.selectByUserIdAndDate(userId, today);
        if (entity == null || !entity.getIsSigned()) {
            return null;
        }
        
        // 这里的 points 只是示意，实际上数据库没存单次积分，暂用常量或者设为0
        // 如果 Entity 有 points 字段更好，但看之前代码没 setPoints
        // 假设 SigninRecordEntity 没有 points 字段，我们返回默认值或0
        
        return SigninRecordDTO.builder()
            .userId(userId)
            .signinDate(entity.getSigninDate())
            .consecutiveDays(entity.getStreakCount())
            .isMakeup(entity.getIsMakeup())
            .points(SIGNIN_POINTS) // 假设今日签到也是标准分
            .build();
    }
}
