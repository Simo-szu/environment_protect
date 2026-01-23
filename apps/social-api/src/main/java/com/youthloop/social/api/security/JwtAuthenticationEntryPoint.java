package com.youthloop.social.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.util.TraceIdUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * JWT 认证入口点
 * 处理未认证或 token 无效的请求，返回统一的 401 响应
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper;
    
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        log.warn("未认证访问: uri={}, message={}", request.getRequestURI(), authException.getMessage());
        
        // 获取当前 traceId
        String traceId = TraceIdUtil.getTraceId();
        
        // 构建统一响应
        BaseResponse<Void> baseResponse = BaseResponse.<Void>error(
            ErrorCode.UNAUTHORIZED,
            "未登录或 token 无效"
        ).withTraceId(traceId);
        
        // 设置响应
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("X-Trace-Id", traceId);
        
        // 写入响应体
        response.getWriter().write(objectMapper.writeValueAsString(baseResponse));
    }
}
