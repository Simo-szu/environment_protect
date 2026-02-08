package com.youthloop.social.api.contract;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.RegexPatternTypeFilter;
import org.springframework.util.ClassUtils;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Set;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 响应契约签名检查：
 * - 仅检查标注了 @ApiResponseContract 的方法
 * - 防止接口声明与约定类型不一致
 */
class ApiResponseContractSignatureTest {

    @Test
    void annotatedMethodsShouldMatchContractSignature() throws Exception {
        Set<Class<?>> controllers = scanControllerClasses("com.youthloop.social.api.web.controller");
        controllers.addAll(scanControllerClasses("com.youthloop.social.api.web.advice"));

        for (Class<?> controllerClass : controllers) {
            for (Method method : controllerClass.getDeclaredMethods()) {
                ApiResponseContract contract = method.getAnnotation(ApiResponseContract.class);
                if (contract == null) {
                    continue;
                }

                assertEquals(ApiSpecResponse.class, method.getReturnType(),
                    () -> method + " 必须返回 ApiSpecResponse");

                Type generic = method.getGenericReturnType();
                assertTrue(generic instanceof ParameterizedType,
                    () -> method + " 必须声明泛型返回类型 ApiSpecResponse<T>");

                Type dataType = ((ParameterizedType) generic).getActualTypeArguments()[0];
                validateByKind(method, contract.value(), dataType);
            }
        }
    }

    private void validateByKind(Method method, ApiEndpointKind kind, Type dataType) {
        switch (kind) {
            case PAGE_LIST -> {
                assertTrue(dataType instanceof ParameterizedType,
                    () -> method + " PAGE_LIST 必须返回 ApiSpecResponse<ApiPageData<T>>");
                ParameterizedType pageType = (ParameterizedType) dataType;
                assertEquals(ApiPageData.class, pageType.getRawType(),
                    () -> method + " PAGE_LIST 的 data 必须是 ApiPageData");
            }
            case DETAIL, COMMAND -> {
                assertFalse(isVoidLike(dataType),
                    () -> method + " " + kind + " 的 data 不能是 void/Void");
            }
            default -> {
            }
        }
    }

    private boolean isVoidLike(Type type) {
        if (type == Void.TYPE || type == Void.class) {
            return true;
        }
        if (type instanceof Class<?>) {
            return ((Class<?>) type).equals(Void.class);
        }
        return false;
    }

    private Set<Class<?>> scanControllerClasses(String basePackage) throws Exception {
        ClassPathScanningCandidateComponentProvider scanner =
            new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new RegexPatternTypeFilter(Pattern.compile(".*Controller|.*Advice")));

        Set<org.springframework.beans.factory.config.BeanDefinition> candidates = scanner.findCandidateComponents(basePackage);
        java.util.Set<Class<?>> classes = new java.util.HashSet<>();
        for (org.springframework.beans.factory.config.BeanDefinition candidate : candidates) {
            String className = candidate.getBeanClassName();
            assertNotNull(className);
            classes.add(ClassUtils.forName(className, getClass().getClassLoader()));
        }
        return classes;
    }
}
