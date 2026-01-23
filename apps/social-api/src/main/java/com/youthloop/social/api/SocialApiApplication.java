package com.youthloop.social.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Social Service - API 进程
 * 
 * 职责：
 * - 对外提供 HTTP API
 * - 参数校验与鉴权
 * - DTO 转换
 * - 调用业务模块 (modules/*)
 */
@SpringBootApplication(scanBasePackages = {
    "com.youthloop.social.api",
    "com.youthloop.social.*"
})
public class SocialApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocialApiApplication.class, args);
    }
}
