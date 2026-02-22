package com.youthloop.auth.application.service;

import com.youthloop.auth.api.dto.*;
import com.youthloop.auth.infrastructure.notification.OtpNotificationService;
import com.youthloop.auth.infrastructure.identity.GoogleIdentityProvider;
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
import com.youthloop.user.api.dto.CreateUserRequest;
import com.youthloop.user.api.dto.UserBasicInfo;
import com.youthloop.user.api.facade.UserQueryFacade;
import com.youthloop.user.api.facade.UserRegistrationFacade;
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
    
    private final UserRegistrationFacade userRegistrationFacade;
    private final UserQueryFacade userQueryFacade;
    private final UserIdentityMapper userIdentityMapper;
    private final UserPasswordMapper userPasswordMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final OtpService otpService;
    private final OtpNotificationService otpNotificationService;
    private final GoogleIdentityProvider googleIdentityProvider;

    
    @Value("${jwt.access-token-validity}")
    private Long accessTokenValidity;
    
    @Value("${jwt.max-refresh-tokens-per-user}")
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
        
        // 通过 User 模块 Facade 创建用户
        UUID userId = UUID.randomUUID();
        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUserId(userId);
        createUserRequest.setNickname(request.getNickname());
        createUserRequest.setRole(1); // 普通用户
        
        UserBasicInfo userInfo = userRegistrationFacade.createUser(createUserRequest);
        
        // 创建邮箱身份
        UserIdentityEntity identity = new UserIdentityEntity();
        identity.setId(UUID.randomUUID());
        identity.setUserId(userInfo.getUserId());
        identity.setIdentityType(1); // EMAIL
        identity.setIdentityIdentifier(email);
        identity.setVerifiedAt(LocalDateTime.now()); // 注册时自动验证
        identity.setIsPrimary(true);
        identity.setCreatedAt(LocalDateTime.now());
        identity.setUpdatedAt(LocalDateTime.now());
        userIdentityMapper.insert(identity);
        
        // 创建密码
        UserPasswordEntity password = new UserPasswordEntity();
        password.setUserId(userInfo.getUserId());
        password.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        password.setSetAt(LocalDateTime.now());
        password.setUpdatedAt(LocalDateTime.now());
        userPasswordMapper.insert(password);
        
        log.info("用户注册成功: userId={}, email={}", userInfo.getUserId(), email);
        
        // 生成令牌
        return generateAuthResponse(userInfo.getUserId(), null);
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
        
        UUID userId = identity.getUserId();
        
        // 通过 User 模块 Facade 检查用户状态
        if (!userQueryFacade.isUserActive(userId)) {
            throw new BizException(ErrorCode.FORBIDDEN, "账号不存在或已被封禁");
        }
        
        // 验证密码
        UserPasswordEntity password = userPasswordMapper.selectByUserId(userId);
        if (password == null || !passwordEncoder.matches(request.getPassword(), password.getPasswordHash())) {
            throw new BizException(ErrorCode.PASSWORD_INCORRECT, "密码错误");
        }
        
        // 更新最后登录时间
        userRegistrationFacade.updateLastLoginTime(userId);
        
        log.info("用户登录成功: userId={}, email={}", userId, email);
        
        // 生成令牌
        return generateAuthResponse(userId, request.getDeviceId());
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
        
        // 查询用户以获取角色
        UserBasicInfo userInfo = userQueryFacade.getUserBasicInfo(userId);
        if (userInfo == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND, "用户不存在");
        }
        
        // 将数据库 role 转换为字符串
        String roleStr = convertRoleToString(userInfo.getRole());
        
        // 生成访问令牌（带角色）
        String accessToken = jwtTokenProvider.generateAccessToken(userId, roleStr);
        
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
     * 将数据库 role 代码转换为字符串
     */
    private String convertRoleToString(Integer roleCode) {
        if (roleCode == null) {
            return "USER";
        }
        switch (roleCode) {
            case 1: return "USER";
            case 2: return "HOST";
            case 3: return "ADMIN";
            default: return "USER";
        }
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

    // ==================== 新增方法（按文档要求） ====================
    
    /**
     * 发送邮箱验证码
     */
    public void sendEmailOtp(SendOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        
        // 映射 purpose 字符串到数字
        Integer purposeCode = mapPurpose(request.getPurpose());
        
        // 生成并存储验证码
        String code = otpService.generateAndStore(email, 1, purposeCode);
        
        // 发送验证码（开发环境使用日志模拟）
        otpNotificationService.sendEmailOtp(email, code, request.getPurpose());
        
        log.info("邮箱验证码已发送: email={}, purpose={}", email, request.getPurpose());
    }
    

    
    /**
     * 邮箱注册
     */
    @Transactional
    public AuthResponse registerByEmail(EmailRegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        
        // 检查是否同意条款
        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "必须同意服务条款");
        }
        
        // 验证 OTP
        otpService.verifyAndConsume(email, request.getOtp(), 1); // purpose=1 (register)
        
        // 检查邮箱是否已存在
        UserIdentityEntity existingIdentity = userIdentityMapper.selectByTypeAndIdentifier(1, email);
        if (existingIdentity != null) {
            throw new BizException(ErrorCode.USER_ALREADY_EXISTS, "该邮箱已被注册");
        }
        
        // 创建用户
        UUID userId = UUID.randomUUID();
        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUserId(userId);
        createUserRequest.setNickname(email.split("@")[0]); // 默认昵称为邮箱前缀
        createUserRequest.setRole(1);
        
        UserBasicInfo userInfo = userRegistrationFacade.createUser(createUserRequest);
        
        // 创建邮箱身份
        UserIdentityEntity identity = new UserIdentityEntity();
        identity.setId(UUID.randomUUID());
        identity.setUserId(userInfo.getUserId());
        identity.setIdentityType(1); // EMAIL
        identity.setIdentityIdentifier(email);
        identity.setVerifiedAt(LocalDateTime.now());
        identity.setIsPrimary(true);
        identity.setCreatedAt(LocalDateTime.now());
        identity.setUpdatedAt(LocalDateTime.now());
        userIdentityMapper.insert(identity);
        
        // 创建密码
        UserPasswordEntity password = new UserPasswordEntity();
        password.setUserId(userInfo.getUserId());
        password.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        password.setSetAt(LocalDateTime.now());
        password.setUpdatedAt(LocalDateTime.now());
        userPasswordMapper.insert(password);
        
        log.info("邮箱注册成功: userId={}, email={}", userInfo.getUserId(), email);
        
        return generateAuthResponse(userInfo.getUserId(), null);
    }
    

    
    /**
     * 邮箱验证码登录
     */
    @Transactional
    public AuthResponse loginByEmailOtp(OtpLoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        
        // 验证 OTP
        otpService.verifyAndConsume(email, request.getOtp(), 2); // purpose=2 (login)
        
        // 查找用户身份
        UserIdentityEntity identity = userIdentityMapper.selectByTypeAndIdentifier(1, email);
        if (identity == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND, "用户不存在");
        }
        
        UUID userId = identity.getUserId();
        
        // 检查用户状态
        if (!userQueryFacade.isUserActive(userId)) {
            throw new BizException(ErrorCode.FORBIDDEN, "账号不存在或已被封禁");
        }
        
        // 更新最后登录时间
        userRegistrationFacade.updateLastLoginTime(userId);
        
        log.info("邮箱验证码登录成功: userId={}, email={}", userId, email);
        
        return generateAuthResponse(userId, null);
    }
    

    
    /**
     * 账号密码登录
     */
    @Transactional
    public AuthResponse loginByPassword(PasswordLoginRequest request) {
        String account = request.getAccount().toLowerCase().trim();
        
        // 判断是邮箱还是手机号
        // 仅支持邮箱登录
        if (!account.contains("@")) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "仅支持邮箱登录");
        }
        UserIdentityEntity identity = userIdentityMapper.selectByTypeAndIdentifier(1, account);

        
        if (identity == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND, "用户不存在");
        }
        
        UUID userId = identity.getUserId();
        
        // 检查用户状态
        if (!userQueryFacade.isUserActive(userId)) {
            throw new BizException(ErrorCode.FORBIDDEN, "账号不存在或已被封禁");
        }
        
        // 验证密码
        UserPasswordEntity password = userPasswordMapper.selectByUserId(userId);
        if (password == null || !passwordEncoder.matches(request.getPassword(), password.getPasswordHash())) {
            throw new BizException(ErrorCode.PASSWORD_INCORRECT, "密码错误");
        }
        
        // 更新最后登录时间
        userRegistrationFacade.updateLastLoginTime(userId);
        
        log.info("账号密码登录成功: userId={}, account={}", userId, account);
        
        return generateAuthResponse(userId, null);
    }
    
    /**
     * 重置密码
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String account = request.getAccount().toLowerCase().trim();
        
        // 验证 OTP
        otpService.verifyAndConsume(account, request.getOtp(), 3); // purpose=3 (reset_pwd)
        
        // 查找用户身份
        // 仅支持邮箱
        if (!account.contains("@")) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "仅支持邮箱重置密码");
        }
        UserIdentityEntity identity = userIdentityMapper.selectByTypeAndIdentifier(1, account);

        
        if (identity == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND, "用户不存在");
        }
        
        UUID userId = identity.getUserId();
        
        // 更新密码
        UserPasswordEntity password = userPasswordMapper.selectByUserId(userId);
        if (password == null) {
            // 创建新密码记录
            password = new UserPasswordEntity();
            password.setUserId(userId);
            password.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            password.setSetAt(LocalDateTime.now());
            password.setUpdatedAt(LocalDateTime.now());
            userPasswordMapper.insert(password);
        } else {
            // 更新现有密码
            password.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            password.setUpdatedAt(LocalDateTime.now());
            userPasswordMapper.updatePassword(userId, password.getPasswordHash(), LocalDateTime.now());
        }
        
        // 撤销该用户的所有 refresh token（强制重新登录）
        refreshTokenMapper.revokeAllByUserId(userId);
        
        log.info("密码重置成功: userId={}, account={}", userId, account);
    }

    /**
     * Google 登录/注册
     */
    @Transactional
    public AuthResponse loginByGoogle(GoogleLoginRequest request) {
        // 1. 验证 Google Token
        var googleUser = googleIdentityProvider.verifyIdToken(request.getIdToken());
        if (!googleUser.emailVerified()) {
            throw new BizException(ErrorCode.FORBIDDEN, "Google 邮箱未验证，无法登录");
        }
        
        String email = googleUser.email().toLowerCase();
        
        // 2. 查找用户（先按 Google Identity 找，再按 Email 找）
        // 假设 Type 3 = Google
        UserIdentityEntity identity = userIdentityMapper.selectByTypeAndIdentifier(3, googleUser.googleId());
        
        if (identity == null) {
            // 尝试按邮箱查找（自动关联）
            identity = userIdentityMapper.selectByTypeAndIdentifier(1, email);
            
            if (identity == null) {
                // 3.均不存在 -> 自动注册
                log.info("Google 用户不存在，自动注册: email={}", email);
                
                // 创建 User
                UUID userId = UUID.randomUUID();
                CreateUserRequest createUserRequest = new CreateUserRequest();
                createUserRequest.setUserId(userId);
                createUserRequest.setNickname(email.split("@")[0]); 
                createUserRequest.setRole(1);
                UserBasicInfo userInfo = userRegistrationFacade.createUser(createUserRequest);
                
                // 绑定 Google 身份 (Type 3)
                UserIdentityEntity googleIdentity = new UserIdentityEntity();
                googleIdentity.setId(UUID.randomUUID());
                googleIdentity.setUserId(userInfo.getUserId());
                googleIdentity.setIdentityType(3);
                googleIdentity.setIdentityIdentifier(googleUser.googleId());
                googleIdentity.setVerifiedAt(LocalDateTime.now());
                googleIdentity.setIsPrimary(false);
                googleIdentity.setCreatedAt(LocalDateTime.now());
                googleIdentity.setUpdatedAt(LocalDateTime.now());
                userIdentityMapper.insert(googleIdentity);
                
                // 同时绑定 Email 身份 (Type 1) - 方便后续邮箱登录
                UserIdentityEntity emailIdentity = new UserIdentityEntity();
                emailIdentity.setId(UUID.randomUUID());
                emailIdentity.setUserId(userInfo.getUserId());
                emailIdentity.setIdentityType(1);
                emailIdentity.setIdentityIdentifier(email);
                emailIdentity.setVerifiedAt(LocalDateTime.now());
                emailIdentity.setIsPrimary(true);
                emailIdentity.setCreatedAt(LocalDateTime.now());
                emailIdentity.setUpdatedAt(LocalDateTime.now());
                userIdentityMapper.insert(emailIdentity);

                return generateAuthResponse(userId, null);
            } else {
                // 邮箱已存在 -> 绑定 Google 身份
                log.info("关联现有邮箱账号: userId={}, email={}", identity.getUserId(), email);
                
                UserIdentityEntity googleIdentity = new UserIdentityEntity();
                googleIdentity.setId(UUID.randomUUID());
                googleIdentity.setUserId(identity.getUserId());
                googleIdentity.setIdentityType(3);
                googleIdentity.setIdentityIdentifier(googleUser.googleId());
                googleIdentity.setVerifiedAt(LocalDateTime.now());
                googleIdentity.setIsPrimary(false);
                googleIdentity.setCreatedAt(LocalDateTime.now());
                googleIdentity.setUpdatedAt(LocalDateTime.now());
                userIdentityMapper.insert(googleIdentity);
                
                return generateAuthResponse(identity.getUserId(), null);
            }
        }
        
        // 4. 已存在 Google 身份 -> 直接登录
        UUID userId = identity.getUserId();
        if (!userQueryFacade.isUserActive(userId)) {
            throw new BizException(ErrorCode.FORBIDDEN, "账号不存在或已被封禁");
        }
        userRegistrationFacade.updateLastLoginTime(userId);
        
        log.info("Google 登录成功: userId={}", userId);
        return generateAuthResponse(userId, null);
    }

    
    /**
     * 映射 purpose 字符串到数字代码
     */
    private Integer mapPurpose(String purpose) {
        return switch (purpose.toLowerCase()) {
            case "register" -> 1;
            case "login" -> 2;
            case "reset_password" -> 3;
            default -> throw new BizException(ErrorCode.INVALID_PARAMETER, "无效的验证码用途");
        };
    }
}
