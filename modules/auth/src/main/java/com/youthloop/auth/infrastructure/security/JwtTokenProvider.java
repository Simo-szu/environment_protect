package com.youthloop.auth.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

/**
 * JWT Token 提供者
 */
@Slf4j
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.access-token-validity}") // 默认 1 小时
    private Long accessTokenValidity;
    
    @Value("${jwt.refresh-token-validity}") // 默认 30 天
    private Long refreshTokenValidity;
    
    private static final String TOKEN_TYPE_CLAIM = "typ";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";
    private static final String ROLE_CLAIM = "role";
    
    /**
     * 生成访问令牌
     */
    public String generateAccessToken(UUID userId) {
        return generateAccessToken(userId, "USER");
    }
    
    /**
     * 生成访问令牌（带角色）
     */
    public String generateAccessToken(UUID userId, String role) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusSeconds(accessTokenValidity);
        
        return Jwts.builder()
            .subject(userId.toString())
            .claim(TOKEN_TYPE_CLAIM, TOKEN_TYPE_ACCESS)
            .claim(ROLE_CLAIM, role != null ? role : "USER")
            .issuedAt(toDate(now))
            .expiration(toDate(expiry))
            .signWith(getSigningKey())
            .compact();
    }
    
    /**
     * 生成刷新令牌
     */
    public String generateRefreshToken(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusSeconds(refreshTokenValidity);
        
        return Jwts.builder()
            .subject(userId.toString())
            .claim(TOKEN_TYPE_CLAIM, TOKEN_TYPE_REFRESH)
            .issuedAt(toDate(now))
            .expiration(toDate(expiry))
            .signWith(getSigningKey())
            .compact();
    }
    
    /**
     * 从 token 中获取用户 ID
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return UUID.fromString(claims.getSubject());
    }
    
    /**
     * 从 token 中获取用户角色
     */
    public String getRoleFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get(ROLE_CLAIM, String.class);
    }
    
    /**
     * 验证 token 是否有效
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            log.warn("Token 验证失败: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 验证 access token
     */
    public boolean validateAccessToken(String token) {
        try {
            Claims claims = parseToken(token);
            String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
            return TOKEN_TYPE_ACCESS.equals(tokenType);
        } catch (Exception e) {
            log.warn("Access token 验证失败: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 验证 refresh token
     */
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = parseToken(token);
            String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
            return TOKEN_TYPE_REFRESH.equals(tokenType);
        } catch (Exception e) {
            log.warn("Refresh token 验证失败: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 获取 token 过期时间
     */
    public LocalDateTime getExpirationFromToken(String token) {
        Claims claims = parseToken(token);
        return toLocalDateTime(claims.getExpiration());
    }
    
    /**
     * 解析 token
     */
    private Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
    
    /**
     * 获取签名密钥
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * LocalDateTime 转 Date
     */
    private Date toDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
    
    /**
     * Date 转 LocalDateTime
     */
    private LocalDateTime toLocalDateTime(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }
}
