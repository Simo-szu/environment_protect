package com.youthloop.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 事务管理配置
 * 
 * 事务规范：
 * 1. 事务边界在 application 层（Service）
 * 2. 使用 @Transactional 注解
 * 3. 默认传播行为：REQUIRED
 * 4. 只读事务使用 @Transactional(readOnly = true)
 */
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    // Spring Boot 自动配置 DataSourceTransactionManager
    // 无需额外配置
}
