package com.youthloop.auth.application.service;

import com.youthloop.auth.persistence.entity.VerificationCodeEntity;
import com.youthloop.auth.persistence.mapper.VerificationCodeMapper;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * OTP 验证码服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {
    
    private final VerificationCodeMapper verificationCodeMapper;
    
    private static final int CODE_LENGTH = 6;
    private static final int CODE_VALIDITY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 3;
    private static final SecureRandom RANDOM = new SecureRandom();
    
    /**
     * 生成并存储验证码
     * 
     * @param account 账号(邮箱或手机号)
     * @param channel 渠道:1=email 2=sms
     * @param purpose 用途:1=register 2=login 3=reset_pwd
     * @return 明文验证码(用于发送)
     */
    @Transactional
    public String generateAndStore(String account, Integer channel, Integer purpose) {
        account = account.toLowerCase().trim();
        
        // 检查发送频率限制(60秒内不能重复发送)
        VerificationCodeEntity recentCode = verificationCodeMapper.selectLatestValid(
            account, 
            purpose, 
            LocalDateTime.now()
        );
        
        if (recentCode != null) {
            LocalDateTime canResendAt = recentCode.getCreatedAt().plusSeconds(60);
            if (LocalDateTime.now().isBefore(canResendAt)) {
                long secondsLeft = java.time.Duration.between(LocalDateTime.now(), canResendAt).getSeconds();
                log.warn("验证码发送过于频繁: account={}, purpose={}, 请{}秒后重试", 
                    account, purpose, secondsLeft);
                throw new BizException(ErrorCode.OPERATION_TOO_FREQUENT, 
                    "验证码发送过于频繁,请" + secondsLeft + "秒后重试");
            }
        }
        
        // 生成 6 位随机数字验证码
        String code = generateCode();
        
        // 哈希存储
        String codeHash = hashCode(code);
        
        // 创建验证码记录
        VerificationCodeEntity entity = new VerificationCodeEntity();
        entity.setId(UUID.randomUUID());
        entity.setAccount(account);
        entity.setChannel(channel);
        entity.setPurpose(purpose);
        entity.setCodeHash(codeHash);
        entity.setExpiresAt(LocalDateTime.now().plusMinutes(CODE_VALIDITY_MINUTES));
        entity.setAttempts(0);
        entity.setCreatedAt(LocalDateTime.now());
        
        verificationCodeMapper.insert(entity);
        
        log.info("验证码已生成: account={}, channel={}, purpose={}, expiresAt={}", 
            account, channel, purpose, entity.getExpiresAt());
        
        return code;
    }
    
    /**
     * 验证并消费验证码（一次性）
     * 
     * @param account 账号
     * @param code 验证码明文
     * @param purpose 用途
     * @return 验证是否成功
     */
    @Transactional
    public boolean verifyAndConsume(String account, String code, Integer purpose) {
        account = account.toLowerCase().trim();
        
        // 查询最新的有效验证码
        VerificationCodeEntity entity = verificationCodeMapper.selectLatestValid(
            account, 
            purpose, 
            LocalDateTime.now()
        );
        
        if (entity == null) {
            log.warn("验证码不存在或已过期: account={}, purpose={}", account, purpose);
            throw new BizException(ErrorCode.VERIFICATION_CODE_INVALID, "验证码不存在或已过期");
        }
        
        // 检查尝试次数
        if (entity.getAttempts() >= MAX_ATTEMPTS) {
            log.warn("验证码尝试次数超限: account={}, attempts={}", account, entity.getAttempts());
            throw new BizException(ErrorCode.VERIFICATION_CODE_INVALID, "验证码尝试次数过多，请重新获取");
        }
        
        // 验证码哈希比对
        String inputHash = hashCode(code);
        boolean valid = inputHash.equals(entity.getCodeHash());
        
        if (!valid) {
            // 增加尝试次数
            verificationCodeMapper.incrementAttempts(entity.getId());
            log.warn("验证码错误: account={}, attempts={}", account, entity.getAttempts() + 1);
            throw new BizException(ErrorCode.VERIFICATION_CODE_INVALID, "验证码错误");
        }
        
        // 验证成功，删除验证码（一次性消费）
        verificationCodeMapper.deleteById(entity.getId());
        
        log.info("验证码验证成功: account={}, purpose={}", account, purpose);
        return true;
    }
    
    /**
     * 生成随机验证码
     */
    private String generateCode() {
        int code = RANDOM.nextInt(1000000);
        return String.format("%06d", code);
    }
    
    /**
     * 对验证码进行哈希
     */
    private String hashCode(String code) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(code.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("验证码哈希失败", e);
        }
    }
}
