package com.youthloop.auth.infrastructure.identity;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GoogleIdentityProvider {

    /**
     * 验证 Google ID Token
     * 注意：实际生产环境需引入 Google API Client 库调用 verify()
     */
    public GoogleUser verifyIdToken(String idToken) {
        // 模拟验证逻辑
        if (idToken == null || !idToken.startsWith("ey")) {
             throw new BizException(ErrorCode.TOKEN_INVALID, "无效的 Google ID Token");
        }
        
        // 模拟解析出用户信息
        // 在实际实现中，这里应该调用 GoogleVerifier.verify(idToken)
        log.info("Mock verifying Google ID Token");
        
        return new GoogleUser("google_123456789", "mock_user@gmail.com", true);
    }

    public record GoogleUser(String googleId, String email, boolean emailVerified) {}
}
