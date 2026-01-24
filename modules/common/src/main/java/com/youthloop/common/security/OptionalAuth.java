package com.youthloop.common.security;

import java.lang.annotation.*;

/**
 * 可选登录注解（对应文档中的 Optional）
 * 标注在 Controller 方法上，表示该接口可以不登录访问
 * 如果登录则返回 userState/个性化字段，未登录则不返回这些字段
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OptionalAuth {
    /**
     * 描述信息（可选）
     */
    String value() default "";
}
