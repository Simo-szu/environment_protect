package com.youthloop.common.security;

import java.lang.annotation.*;

/**
 * 必须登录注解（对应文档中的 Yes）
 * 标注在 Controller 方法上，表示该接口必须登录才能访问
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireAuth {
    /**
     * 描述信息（可选）
     */
    String value() default "";
}
