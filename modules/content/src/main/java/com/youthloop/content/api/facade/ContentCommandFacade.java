package com.youthloop.content.api.facade;

import com.youthloop.content.api.dto.CreateContentRequest;
import com.youthloop.content.api.dto.UpdateContentRequest;
import com.youthloop.content.application.service.ContentCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Content command facade for cross-module write operations.
 */
@Component
@RequiredArgsConstructor
public class ContentCommandFacade {

    private final ContentCommandService contentCommandService;

    public UUID createContent(CreateContentRequest request) {
        return contentCommandService.createContent(request);
    }

    public void updateContent(UUID contentId, UpdateContentRequest request) {
        com.youthloop.content.application.dto.UpdateContentRequest command =
            new com.youthloop.content.application.dto.UpdateContentRequest();
        command.setType(request.getType());
        command.setTitle(request.getTitle());
        command.setSummary(request.getSummary());
        command.setCoverUrl(request.getCoverUrl());
        command.setBody(request.getBody());
        command.setStatus(request.getStatus());
        contentCommandService.updateContent(contentId, command);
    }

    public void publishContent(UUID contentId) {
        contentCommandService.publishContent(contentId);
    }

    public void deleteContent(UUID contentId) {
        contentCommandService.deleteContent(contentId);
    }
}
