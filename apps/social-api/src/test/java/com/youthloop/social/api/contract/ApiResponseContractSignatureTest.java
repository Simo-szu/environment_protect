package com.youthloop.social.api.contract;

import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.RegexPatternTypeFilter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ClassUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiResponseContractSignatureTest {

    private static final Set<String> CREATE_POST_METHODS = Set.of(
        "ActivitySignupController#signup",
        "AdminHomeBannerController#createBanner",
        "AuthController#registerByEmail",
        "HostController#createActivity",
        "HostController#submitVerification",
        "InteractionController#addReaction",
        "InteractionController#createComment",
        "PointsController#exchange",
        "PointsController#signin",
        "PointsController#submitQuiz",
        "SupportController#submitContact",
        "SupportController#submitFeedback"
    );

    @Test
    void requestMappingMethodsShouldMatchContractSignature() throws Exception {
        Set<Class<?>> controllers = scanControllerClasses("com.youthloop.social.api.web.controller");

        for (Class<?> controllerClass : controllers) {
            for (Method method : controllerClass.getDeclaredMethods()) {
                if (!isRequestHandlerMethod(method) || shouldSkipContractCheck(controllerClass, method)) {
                    continue;
                }

                ApiResponseContract contract = method.getAnnotation(ApiResponseContract.class);
                assertNotNull(contract, () -> method + " must declare @ApiResponseContract");

                assertEquals(ApiSpecResponse.class, method.getReturnType(),
                    () -> method + " must return ApiSpecResponse");

                Type generic = method.getGenericReturnType();
                assertTrue(generic instanceof ParameterizedType,
                    () -> method + " must declare ApiSpecResponse<T>");

                Type dataType = ((ParameterizedType) generic).getActualTypeArguments()[0];
                validateByKind(method, contract.value(), dataType);
                assertFalse(isListType(dataType),
                    () -> method + " must not return raw List data; list endpoints must use ApiPageData");
            }
        }
    }

    @Test
    void createPostEndpointsShouldReturnHttp201() throws Exception {
        Set<Class<?>> controllers = scanControllerClasses("com.youthloop.social.api.web.controller");

        for (Class<?> controllerClass : controllers) {
            for (Method method : controllerClass.getDeclaredMethods()) {
                if (!method.isAnnotationPresent(PostMapping.class)) {
                    continue;
                }

                String key = endpointKey(controllerClass, method);
                if (!CREATE_POST_METHODS.contains(key)) {
                    continue;
                }

                ResponseStatus responseStatus = method.getAnnotation(ResponseStatus.class);
                assertNotNull(responseStatus, () -> method + " should declare @ResponseStatus(HttpStatus.CREATED)");
                assertEquals(HttpStatus.CREATED, responseStatus.value(),
                    () -> method + " should return HTTP 201 for create semantics");
            }
        }
    }

    @Test
    void requestBodyParametersShouldUseUnifiedRequest() throws Exception {
        Set<Class<?>> controllers = scanControllerClasses("com.youthloop.social.api.web.controller");

        for (Class<?> controllerClass : controllers) {
            for (Method method : controllerClass.getDeclaredMethods()) {
                if (!isRequestHandlerMethod(method)) {
                    continue;
                }

                for (Parameter parameter : method.getParameters()) {
                    if (!parameter.isAnnotationPresent(RequestBody.class)) {
                        continue;
                    }

                    assertEquals(UnifiedRequest.class, parameter.getType(),
                        () -> method + " @RequestBody parameter must use UnifiedRequest<T>");
                }
            }
        }
    }

    private boolean isRequestHandlerMethod(Method method) {
        return method.isAnnotationPresent(GetMapping.class)
            || method.isAnnotationPresent(PostMapping.class)
            || method.isAnnotationPresent(PutMapping.class)
            || method.isAnnotationPresent(PatchMapping.class)
            || method.isAnnotationPresent(DeleteMapping.class)
            || method.isAnnotationPresent(RequestMapping.class);
    }

    private boolean shouldSkipContractCheck(Class<?> controllerClass, Method method) {
        if ("ApiDocsController".equals(controllerClass.getSimpleName())) {
            return true;
        }
        return ResponseEntity.class.isAssignableFrom(method.getReturnType());
    }

    private void validateByKind(Method method, ApiEndpointKind kind, Type dataType) {
        switch (kind) {
            case PAGE_LIST -> {
                assertTrue(dataType instanceof ParameterizedType,
                    () -> method + " PAGE_LIST must return ApiSpecResponse<ApiPageData<T>>");
                ParameterizedType pageType = (ParameterizedType) dataType;
                assertEquals(ApiPageData.class, pageType.getRawType(),
                    () -> method + " PAGE_LIST data must be ApiPageData");
            }
            case DETAIL, COMMAND -> assertFalse(isVoidLike(dataType),
                () -> method + " " + kind + " data type must not be void/Void");
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

    private boolean isListType(Type type) {
        if (type instanceof ParameterizedType parameterizedType) {
            Type rawType = parameterizedType.getRawType();
            if (rawType instanceof Class<?> rawClass) {
                return List.class.isAssignableFrom(rawClass);
            }
            return false;
        }
        if (type instanceof Class<?> typeClass) {
            return List.class.isAssignableFrom(typeClass);
        }
        return false;
    }

    private String endpointKey(Class<?> controllerClass, Method method) {
        return controllerClass.getSimpleName() + "#" + method.getName();
    }

    private Set<Class<?>> scanControllerClasses(String basePackage) throws Exception {
        ClassPathScanningCandidateComponentProvider scanner =
            new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new RegexPatternTypeFilter(Pattern.compile(".*Controller")));

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
