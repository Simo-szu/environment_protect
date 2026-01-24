package com.youthloop.auth.infrastructure.notification;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * OTP 通知服务（邮件/短信发送）
 * 
 * 邮件发送：使用 Resend 服务
 * 短信发送：待对接
 */
@Slf4j
@Service
public class OtpNotificationService {
    
    private final Resend resendClient;
    private final String fromEmail;
    private final boolean emailEnabled;
    
    public OtpNotificationService(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:noreply@youthloop.top}") String fromEmail) {
        this.fromEmail = fromEmail;
        this.emailEnabled = apiKey != null && !apiKey.isBlank();
        
        if (emailEnabled) {
            this.resendClient = new Resend(apiKey);
            log.info("Resend 邮件服务已启用，发件人: {}", fromEmail);
        } else {
            this.resendClient = null;
            log.warn("Resend API Key 未配置，邮件发送将使用日志模拟模式");
        }
    }
    
    /**
     * 发送邮箱验证码
     * 
     * @param email 邮箱地址
     * @param code 验证码
     * @param purpose 用途（register/login/reset_password）
     */
    public void sendEmailOtp(String email, String code, String purpose) {
        if (!emailEnabled || resendClient == null) {
            // 开发模式：日志模拟
            logEmailOtp(email, code, purpose);
            return;
        }
        
        try {
            // 构造邮件内容
            String subject = "YouthLoop 验证码 - " + getPurposeText(purpose);
            String htmlBody = buildEmailHtml(code, purpose);
            
            // 发送邮件
            CreateEmailOptions emailOptions = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(email)
                    .subject(subject)
                    .html(htmlBody)
                    .build();
            
            CreateEmailResponse response = resendClient.emails().send(emailOptions);
            
            log.info("邮件发送成功: email={}, purpose={}, messageId={}", 
                    email, purpose, response.getId());
            
        } catch (ResendException e) {
            log.error("邮件发送失败: email={}, purpose={}, error={}", 
                    email, purpose, e.getMessage(), e);
            
            // 降级：记录日志（生产环境可以考虑重试或告警）
            logEmailOtp(email, code, purpose);
            
            // 不抛出异常，避免影响用户体验（验证码已生成）
        }
    }
    
    /**
     * 构造邮件 HTML 内容
     */
    private String buildEmailHtml(String code, String purpose) {
        String purposeText = getPurposeText(purpose);
        
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .code-box { background: white; border: 2px dashed #667eea; 
                                    padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                        .code { font-size: 32px; font-weight: bold; color: #667eea; 
                                letter-spacing: 8px; font-family: 'Courier New', monospace; }
                        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
                        .warning { color: #e74c3c; font-size: 14px; margin-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>YouthLoop</h1>
                            <p>青年环保行动平台</p>
                        </div>
                        <div class="content">
                            <h2>您的验证码</h2>
                            <p>您正在进行：<strong>%s</strong></p>
                            <div class="code-box">
                                <div class="code">%s</div>
                            </div>
                            <p>验证码有效期为 <strong>5 分钟</strong>，请尽快使用。</p>
                            <p class="warning">⚠️ 如果这不是您本人的操作，请忽略此邮件。</p>
                        </div>
                        <div class="footer">
                            <p>此邮件由系统自动发送，请勿回复</p>
                            <p>&copy; 2025 YouthLoop. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(purposeText, code);
    }
    
    /**
     * 日志模拟邮件发送（开发模式/降级）
     */
    private void logEmailOtp(String email, String code, String purpose) {
        log.info("=".repeat(60));
        log.info("【开发模式】邮箱验证码");
        log.info("收件人: {}", email);
        log.info("用途: {}", getPurposeText(purpose));
        log.info("验证码: {}", code);
        log.info("有效期: 5 分钟");
        log.info("=".repeat(60));
    }
    
    /**
     * 发送短信验证码
     * 
     * @param phone 手机号
     * @param code 验证码
     * @param purpose 用途（register/login/reset_password）
     */
    public void sendPhoneOtp(String phone, String code, String purpose) {
        // TODO: 生产环境需要集成真实的短信服务（如阿里云短信、腾讯云短信等）
        log.info("=".repeat(60));
        log.info("【开发模式】短信验证码");
        log.info("手机号: {}", phone);
        log.info("用途: {}", getPurposeText(purpose));
        log.info("验证码: {}", code);
        log.info("有效期: 5 分钟");
        log.info("=".repeat(60));
    }
    
    /**
     * 获取用途文本
     */
    private String getPurposeText(String purpose) {
        return switch (purpose.toLowerCase()) {
            case "register" -> "注册账号";
            case "login" -> "登录账号";
            case "reset_password" -> "重置密码";
            default -> purpose;
        };
    }
}
