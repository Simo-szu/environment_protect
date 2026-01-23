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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * JWT 访问拒绝处理器
 * 处理已认证但无权限的请求，返回统一的 403 响应
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    
    private final ObjectMapper objectMapper;
    
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                      AccessDeniedException accessDeniedException) throws IOException, ServletException {
        
        log.warn("无权限访问: uri={}, message={}", request.getRequestURI(), accessDeniedException.getMessage());
        
        // 获取当前 traceId
        String traceId = TraceIdUtil.getTraceId();
        
        // 构建统一响应
        BaseResponse<Void> baseResponse = BaseResponse.<Void>error(
            ErrorCode.FORBIDDEN,
            "无权限访问"
        ).withTraceId(traceId);
        
        // 设置响应
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("X-Trace-Id", traceId);
        
        // 写入响应体
        response.getWriter().write(objectMapper.writeValueAsString(baseResponse));
    }
}
