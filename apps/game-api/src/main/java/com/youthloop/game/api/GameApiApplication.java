package com.youthloop.game.api;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Game Service API process.
 */
@SpringBootApplication(scanBasePackages = "com.youthloop")
@MapperScan(basePackages = {
    "com.youthloop.common.persistence.mapper",
    "com.youthloop.game.persistence.mapper"
})
public class GameApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(GameApiApplication.class, args);
    }
}
