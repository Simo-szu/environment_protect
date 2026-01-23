package com.youthloop.common.util;

import org.slf4j.MDC;

import java.util.UUID;

/**
 * TraceId 工具类
 */
public class TraceIdUtil {
    
    private static final String TRACE_ID_KEY = "traceId";
    
    /**
     * 生成新的 traceId
     */
    public static String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * 设置 traceId 到 MDC
     */
    public static void setTraceId(String traceId) {
        MDC.put(TRACE_ID_KEY, traceId);
    }
    
    /**
     * 获取当前 traceId
     */
    public static String getTraceId() {
        String traceId = MDC.get(TRACE_ID_KEY);
        if (traceId == null) {
            traceId = generateTraceId();
            setTraceId(traceId);
        }
        return traceId;
    }
    
    /**
     * 清除 traceId
     */
    public static void clearTraceId() {
        MDC.remove(TRACE_ID_KEY);
    }
}
