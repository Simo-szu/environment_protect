package com.youthloop.common.security;

import java.lang.annotation.*;

/**
 * 管理员权限注解（对应文档中的 Admin）
 * 标注在 Controller 方法上，表示该接口需要管理员权限
 * 用于运营配置/审核等管理功能
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireAdmin {
    /**
     * 描述信息（可选）
     */
    String value() default "";
}
