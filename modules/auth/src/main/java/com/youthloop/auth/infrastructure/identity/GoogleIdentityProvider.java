package com.youthloop.auth.infrastructure.identity;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Slf4j
@Component
public class GoogleIdentityProvider {

    private final GoogleIdTokenVerifier verifier;

    public GoogleIdentityProvider(@Value("${google.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory()
        )
        .setAudience(Collections.singletonList(clientId))
        .build();
        
        log.info("Google Identity Provider initialized with client ID: {}", clientId);
    }

    /**
     * 验证 Google ID Token
     */
    public GoogleUser verifyIdToken(String idToken) {
        try {
            GoogleIdToken googleIdToken = verifier.verify(idToken);
            
            if (googleIdToken == null) {
                log.warn("Google ID Token verification failed: token is invalid");
                throw new BizException(ErrorCode.TOKEN_INVALID, "无效的 Google ID Token");
            }
            
            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            Boolean emailVerified = payload.getEmailVerified();
            
            log.info("Google ID Token verified successfully: googleId={}, email={}, emailVerified={}", 
                    googleId, email, emailVerified);
            
            return new GoogleUser(googleId, email, emailVerified != null && emailVerified);
            
        } catch (Exception e) {
            log.error("Failed to verify Google ID Token", e);
            throw new BizException(ErrorCode.TOKEN_INVALID, "Google Token 验证失败: " + e.getMessage());
        }
    }

    public record GoogleUser(String googleId, String email, boolean emailVerified) {}
}
