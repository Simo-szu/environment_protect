package com.youthloop.auth.application.service;

import com.youthloop.auth.application.dto.AuthResponse;
import com.youthloop.auth.application.dto.LoginRequest;
import com.youthloop.auth.application.dto.RegisterRequest;
import com.youthloop.auth.infrastructure.security.JwtTokenProvider;
import com.youthloop.auth.infrastructure.security.PasswordEncoder;
import com.youthloop.auth.persistence.entity.RefreshTokenEntity;
import com.youthloop.auth.persistence.entity.UserIdentityEntity;
import com.youthloop.auth.persistence.entity.UserPasswordEntity;
import com.youthloop.auth.persistence.mapper.RefreshTokenMapper;
import com.youthloop.auth.persistence.mapper.UserIdentityMapper;
import com.youthloop.auth.persistence.mapper.UserPasswordMapper;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.user.persistence.entity.UserEntity;
import com.youthloop.user.persistence.entity.UserProfileEntity;
import com.youthloop.user.persistence.mapper.UserMapper;
import com.youthloop.user.persistence.mapper.UserProfileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * 认证服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserMapper userMapper;
    private final UserProfileMapper userProfileMapper;
    private final UserIdentityMapper userIdentityMapper;
    private final UserPasswordMapper userPasswordMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Value("${jwt.access-token-validity:3600}")
    private Long accessTokenValidity;
    
    @Value("${jwt.max-refresh-tokens-per-user:5}")
    private Integer maxRefreshTokensPerUser;
    
    /**
     * 用户注册
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        
        // 检查邮箱是否已存在
        UserIdentityEntity existingIdentity = userIdentityMapper.selectByTypeAndIdentifier(1, email);
        if (existingIdentity != null) {
            throw new BizException(ErrorCode.USER_ALREADY_EXISTS, "该邮箱已被注册");
        }
        
        // 创建用户
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setRole(1); // 普通用户
        user.setStatus(1); // 正常状态
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);
        
        // 创建用户档案
        UserProfileEntity profile = new UserProfileEntity();
        profile.setUserId(user.getId());
        profile.setNickname(request.getNickname());
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        userProfileMapper.insert(profile);
        
        // 创建邮箱身份
        UserIdentityEntity identity = new UserIdentityEntity();
        identity.setId(UUID.randomUUID());
        identity.setUserId(user.getId());
        identity.setIdentityType(1); // EMAIL
        identity.setIdentityIdentifier(email);
        identity.setVerifiedAt(LocalDateTime.now()); // 注册时自动验证
        identity.setIsPrimary(true);
        identity.setCreatedAt(LocalDateTime.now());
        identity.setUpdatedAt(LocalDateTime.now());
        userIdentityMapper.insert(identity);
        
        // 创建密码
        UserPasswordEntity password = new UserPasswordEntity();
        password.setUserId(user.getId());
        password.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        password.setSetAt(LocalDateTime.now());
        password.setUpdatedAt(LocalDateTime.now());
        userPasswordMapper.insert(password);
        
        log.info("用户注册成功: userId={}, email={}", user.getId(), email);
        
        // 生成令牌
        return generateAuthResponse(user.getId(), null);
    }
    
    /**
     * 用户登录
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        
        // 查找用户身份
        UserIdentityEntity identity = userIdentityMapper.selectByTypeAndIdentifier(1, email);
        if (identity == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND, "用户不存在");
        }
        
        // 查询用户
        UserEntity user = userMapper.selectById(identity.getUserId());
        if (user == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND, "用户不存在");
        }
        
        // 检查用户状态
        if (user.getStatus() != 1) {
            throw new BizException(ErrorCode.FORBIDDEN, "账号已被封禁");
        }
        
        // 验证密码
        UserPasswordEntity password = userPasswordMapper.selectByUserId(user.getId());
        if (password == null || !passwordEncoder.matches(request.getPassword(), password.getPasswordHash())) {
            throw new BizException(ErrorCode.PASSWORD_INCORRECT, "密码错误");
        }
        
        // 更新最后登录时间
        userMapper.updateLastLoginAt(user.getId());
        
        log.info("用户登录成功: userId={}, email={}", user.getId(), email);
        
        // 生成令牌
        return generateAuthResponse(user.getId(), request.getDeviceId());
    }
    
    /**
     * 刷新令牌
     */
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        // 验证刷新令牌（必须是 refresh 类型）
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new BizException(ErrorCode.TOKEN_INVALID, "刷新令牌无效或类型错误");
        }
        
        // 获取用户 ID
        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        
        // 验证刷新令牌是否在数据库中
        String tokenHash = hashToken(refreshToken);
        RefreshTokenEntity tokenEntity = refreshTokenMapper.selectByTokenHash(tokenHash);
        if (tokenEntity == null) {
            throw new BizException(ErrorCode.TOKEN_INVALID, "刷新令牌不存在或已过期");
        }
        
        // 撤销旧的刷新令牌（token 旋转）
        refreshTokenMapper.revokeByTokenHash(tokenHash);
        
        log.info("刷新令牌成功: userId={}", userId);
        
        // 生成新的令牌
        return generateAuthResponse(userId, tokenEntity.getDeviceId());
    }
    
    /**
     * 登出
     */
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return;
        }
        
        // 撤销刷新令牌
        String tokenHash = hashToken(refreshToken);
        int revoked = refreshTokenMapper.revokeByTokenHash(tokenHash);
        
        if (revoked > 0) {
            log.info("用户登出成功");
        }
    }
    
    /**
     * 登出所有设备（撤销用户的所有 refresh token）
     */
    @Transactional
    public void logoutAll(UUID userId) {
        int revoked = refreshTokenMapper.revokeAllByUserId(userId);
        log.info("用户登出所有设备: userId={}, revokedCount={}", userId, revoked);
    }
    
    /**
     * 生成认证响应
     */
    private AuthResponse generateAuthResponse(UUID userId, String deviceId) {
        // 检查用户的有效 token 数量
        int activeTokenCount = refreshTokenMapper.countActiveByUserId(userId);
        
        // 如果超过上限，撤销最旧的 token
        if (activeTokenCount >= maxRefreshTokensPerUser) {
            RefreshTokenEntity oldestToken = refreshTokenMapper.selectOldestByUserId(userId);
            if (oldestToken != null) {
                refreshTokenMapper.revokeById(oldestToken.getId());
                log.info("撤销最旧的 refresh token: userId={}, tokenId={}", userId, oldestToken.getId());
            }
        }
        
        // 生成访问令牌
        String accessToken = jwtTokenProvider.generateAccessToken(userId);
        
        // 生成刷新令牌
        String refreshToken = jwtTokenProvider.generateRefreshToken(userId);
        
        // 保存刷新令牌到数据库
        RefreshTokenEntity tokenEntity = new RefreshTokenEntity();
        tokenEntity.setId(UUID.randomUUID());
        tokenEntity.setUserId(userId);
        tokenEntity.setTokenHash(hashToken(refreshToken));
        tokenEntity.setDeviceId(deviceId);
        tokenEntity.setExpiresAt(jwtTokenProvider.getExpirationFromToken(refreshToken));
        tokenEntity.setCreatedAt(LocalDateTime.now());
        refreshTokenMapper.insert(tokenEntity);
        
        return new AuthResponse(userId, accessToken, refreshToken, accessTokenValidity);
    }
    
    /**
     * 对 token 进行哈希（用于存储）
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Token 哈希失败", e);
        }
    }
}
