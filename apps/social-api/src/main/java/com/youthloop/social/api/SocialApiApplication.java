package com.youthloop.social.api;

import org.mybatis.spring.annotation.MapperScan;
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
@SpringBootApplication(scanBasePackages = "com.youthloop")
@MapperScan(basePackages = {
    "com.youthloop.common.persistence.mapper",
    "com.youthloop.auth.persistence.mapper",
    "com.youthloop.user.persistence.mapper",
    "com.youthloop.content.persistence.mapper",
    "com.youthloop.activity.persistence.mapper",
    "com.youthloop.interaction.persistence.mapper",
    "com.youthloop.notification.persistence.mapper",
    "com.youthloop.points.persistence.mapper",
    "com.youthloop.search.persistence.mapper",
    "com.youthloop.recommendation.persistence.mapper",
    "com.youthloop.host.persistence.mapper",
    "com.youthloop.ops.persistence.mapper",
    "com.youthloop.ingestion.persistence.mapper",
    "com.youthloop.event.persistence.mapper",
    "com.youthloop.query.mapper"
})
public class SocialApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocialApiApplication.class, args);
    }
}
