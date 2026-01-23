package com.youthloop.common.config;

import org.apache.ibatis.session.Configuration;
import org.mybatis.spring.boot.autoconfigure.ConfigurationCustomizer;
import org.springframework.context.annotation.Bean;

/**
 * MyBatis 配置
 */
@org.springframework.context.annotation.Configuration
public class MyBatisConfig {
    
    /**
     * MyBatis 配置定制
     */
    @Bean
    public ConfigurationCustomizer mybatisConfigurationCustomizer() {
        return (Configuration configuration) -> {
            // 开启驼峰命名转换
            configuration.setMapUnderscoreToCamelCase(true);
            
            // 开启二级缓存（可选，根据需要启用）
            configuration.setCacheEnabled(false);
            
            // 延迟加载配置
            configuration.setLazyLoadingEnabled(false);
            configuration.setAggressiveLazyLoading(false);
            
            // 日志实现
            configuration.setLogImpl(org.apache.ibatis.logging.slf4j.Slf4jImpl.class);
        };
    }
}
