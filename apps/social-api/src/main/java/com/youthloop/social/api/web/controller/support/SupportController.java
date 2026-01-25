package com.youthloop.social.api.web.controller.support;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.dto.SupportContactDTO;
import com.youthloop.common.api.dto.UserFeedbackDTO;
import com.youthloop.common.application.service.SupportService;
import com.youthloop.common.security.AllowGuest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 支持与帮助 Controller
 */
@Tag(name = "支持与帮助", description = "联系我们、用户反馈")
@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportController {
    
    private final SupportService supportService;
    
    @Operation(summary = "提交联系我们", description = "允许游客提交")
    @PostMapping("/contact")
    @AllowGuest
    public BaseResponse<Void> submitContact(@Valid @RequestBody UnifiedRequest<SupportContactDTO> request) {
        supportService.submitContact(request.getData());
        return BaseResponse.success("提交成功，我们会尽快与您联系", null);
    }
    
    @Operation(summary = "提交用户反馈", description = "允许游客提交")
    @PostMapping("/feedback")
    @AllowGuest
    public BaseResponse<Void> submitFeedback(@Valid @RequestBody UnifiedRequest<UserFeedbackDTO> request) {
        supportService.submitFeedback(request.getData());
        return BaseResponse.success("感谢您的反馈", null);
    }
}
