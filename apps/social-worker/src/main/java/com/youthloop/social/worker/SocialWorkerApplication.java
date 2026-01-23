package com.youthloop.social.worker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Social Service - Worker 进程
 * 
 * 职责：
 * - 定时任务 (10:00 刷新、热度重算、推荐生成、抓取)
 * - RabbitMQ 消费者 (Outbox、统计更新、邮件任务等)
 * - 异步处理
 */
@SpringBootApplication(scanBasePackages = {
    "com.youthloop.social.worker",
    "com.youthloop.social.*"
})
@EnableScheduling
public class SocialWorkerApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocialWorkerApplication.class, args);
    }
}
