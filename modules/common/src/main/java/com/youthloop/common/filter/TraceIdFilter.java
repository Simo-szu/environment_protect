package com.youthloop.common.filter;

import com.youthloop.common.util.TraceIdUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * TraceId 过滤器
 * 为每个请求生成或传递 traceId
 */
@Component
@Order(1)
public class TraceIdFilter implements Filter {
    
    private static final String TRACE_ID_HEADER = "X-Trace-Id";
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        try {
            // 从请求头获取 traceId，如果没有则生成新的
            String traceId = httpRequest.getHeader(TRACE_ID_HEADER);
            if (traceId == null || traceId.isEmpty()) {
                traceId = TraceIdUtil.generateTraceId();
            }
            
            // 设置到 MDC
            TraceIdUtil.setTraceId(traceId);
            
            // 添加到响应头
            httpResponse.setHeader(TRACE_ID_HEADER, traceId);
            
            chain.doFilter(request, response);
        } finally {
            // 清理 MDC
            TraceIdUtil.clearTraceId();
        }
    }
}
