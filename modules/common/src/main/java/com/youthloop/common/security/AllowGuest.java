package com.youthloop.common.security;

import java.lang.annotation.*;

/**
 * 允许游客注解（对应文档中的 G）
 * 标注在 Controller 方法上，表示该接口允许游客（不登录）访问
 * 通常用于活动报名等场景，通过 email 等完成去重/联系
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AllowGuest {
    /**
     * 描述信息（可选）
     */
    String value() default "";
}
