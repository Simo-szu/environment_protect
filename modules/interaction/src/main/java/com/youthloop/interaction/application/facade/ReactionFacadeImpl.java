package com.youthloop.interaction.application.facade;

import com.youthloop.interaction.api.dto.ToggleReactionRequest;
import com.youthloop.interaction.api.facade.ReactionFacade;
import com.youthloop.interaction.application.service.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 反应门面实现
 */
@Service
@RequiredArgsConstructor
public class ReactionFacadeImpl implements ReactionFacade {
    
    private final ReactionService reactionService;
    
    @Override
    public void createReaction(ToggleReactionRequest request) {
        reactionService.createReaction(request);
    }
    
    @Override
    public void deleteReaction(ToggleReactionRequest request) {
        reactionService.deleteReaction(request);
    }
}
