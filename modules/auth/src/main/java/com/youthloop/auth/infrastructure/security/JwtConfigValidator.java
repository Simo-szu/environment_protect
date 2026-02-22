package com.youthloop.auth.infrastructure.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.core.env.Environment;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * JWT 配置校验器
 * 在应用启动时校验 JWT secret 的安全性
 */
@Slf4j
@Component
public class JwtConfigValidator {
    
    @Value("${jwt.secret}")
    private String jwtSecret;

    private final Environment environment;
    
    private static final int MIN_SECRET_LENGTH = 32; // 256 bits
    private static final String DEFAULT_SECRET = "youthloop-secret-key-change-in-production-min-256-bits";

    public JwtConfigValidator(Environment environment) {
        this.environment = environment;
    }
    
    /**
     * 应用启动后校验 JWT 配置
     */
    @EventListener(ApplicationReadyEvent.class)
    public void validateJwtConfig() {
        log.info("开始校验 JWT 配置...");
        
        // 校验 secret 长度
        if (jwtSecret == null || jwtSecret.length() < MIN_SECRET_LENGTH) {
            String errorMsg = String.format(
                "JWT secret 长度不足！当前长度: %d，最小要求: %d 字符（256 bits）",
                jwtSecret != null ? jwtSecret.length() : 0,
                MIN_SECRET_LENGTH
            );
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
        
        // 生产环境必须使用自定义 secret
        if (isProductionProfile() && DEFAULT_SECRET.equals(jwtSecret)) {
            String errorMsg = "生产环境禁止使用默认 JWT secret！请通过环境变量 JWT_SECRET 设置自定义密钥";
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
        
        // 警告：开发环境使用默认 secret
        if (!isProductionProfile() && DEFAULT_SECRET.equals(jwtSecret)) {
            log.warn("⚠️  当前使用默认 JWT secret，仅适用于开发环境！生产环境必须设置环境变量 JWT_SECRET");
        }
        
        log.info("✓ JWT 配置校验通过 (secret 长度: {} 字符)", jwtSecret.length());
    }
    
    /**
     * 判断是否为生产环境
     */
    private boolean isProductionProfile() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }
}
