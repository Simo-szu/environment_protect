package com.youthloop.social.api.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security 配置
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // 启用方法级安全
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF（使用 JWT 不需要）
            .csrf(AbstractHttpConfigurer::disable)
            
            // 无状态会话（JWT 不需要 session）
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 配置异常处理
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)  // 401 未认证
                .accessDeniedHandler(jwtAccessDeniedHandler)            // 403 无权限
            )
            
            // 配置授权规则
            .authorizeHttpRequests(auth -> auth
                // 放行：健康检查
                .requestMatchers("/health").permitAll()
                
                // 放行：认证接口（所有 auth 端点都允许匿名访问，除了 logout 需要登录）
                .requestMatchers("/api/v1/auth/otp/**").permitAll()
                .requestMatchers("/api/v1/auth/register/**").permitAll()
                .requestMatchers("/api/v1/auth/login/**").permitAll()
                .requestMatchers("/api/v1/auth/password/**").permitAll()
                .requestMatchers("/api/v1/auth/token/refresh").permitAll()
                
                // 放行：用户档案查询（公开接口）
                .requestMatchers("/api/v1/users/*/profile").permitAll()
                
                // 放行：所有 GET 读接口（Optional 场景）
                .requestMatchers("GET", "/api/v1/home/**").permitAll()
                .requestMatchers("GET", "/api/v1/contents/**").permitAll()
                .requestMatchers("GET", "/api/v1/activities/**").permitAll()
                .requestMatchers("GET", "/api/v1/search/**").permitAll()
                
                // 放行：Swagger UI
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/api-docs/**", "/v3/api-docs/**").permitAll()
                
                // 放行：Actuator 健康检查
                .requestMatchers("/actuator/health").permitAll()
                
                // 其他所有请求需要认证
                .anyRequest().authenticated()
            )
            
            // 添加 JWT 过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
