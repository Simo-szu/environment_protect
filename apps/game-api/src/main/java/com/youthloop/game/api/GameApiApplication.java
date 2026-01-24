package com.youthloop.game.api;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Game Service - API 进程
 * 
 * 职责：
 * - 游戏会话管理
 * - 游戏事件上报
 * - 游戏结算
 */
@SpringBootApplication(scanBasePackages = "com.youthloop")
@MapperScan(basePackages = {
    "com.youthloop.game.persistence.mapper",
    "com.youthloop.auth.persistence.mapper"
})
public class GameApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(GameApiApplication.class, args);
    }
}
