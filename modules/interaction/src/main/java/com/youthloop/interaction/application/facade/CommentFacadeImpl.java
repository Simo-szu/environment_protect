package com.youthloop.interaction.application.facade;

import com.youthloop.interaction.api.dto.CreateCommentRequest;
import com.youthloop.interaction.api.facade.CommentFacade;
import com.youthloop.interaction.application.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * 评论门面实现
 */
@Service
@RequiredArgsConstructor
public class CommentFacadeImpl implements CommentFacade {
    
    private final CommentService commentService;
    
    @Override
    public UUID createComment(CreateCommentRequest request) {
        return commentService.createComment(request);
    }
}
