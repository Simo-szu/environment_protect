package com.youthloop.game.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.common.api.contract.ApiSpecResponse;
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
 * Handles authenticated but unauthorized requests and returns a unified 403 response.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(
        HttpServletRequest request,
        HttpServletResponse response,
        AccessDeniedException accessDeniedException
    ) throws IOException, ServletException {
        log.warn("Forbidden access: uri={}, message={}", request.getRequestURI(), accessDeniedException.getMessage());

        String traceId = TraceIdUtil.getTraceId();
        ApiSpecResponse<Void> apiResponse = ApiSpecResponse.<Void>fail("Forbidden").withTraceId(traceId);

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("X-Trace-Id", traceId);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
