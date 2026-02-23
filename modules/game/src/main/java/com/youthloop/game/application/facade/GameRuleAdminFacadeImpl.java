package com.youthloop.game.application.facade;

import com.youthloop.game.api.dto.AdminGameRulesConfigDTO;
import com.youthloop.game.api.dto.AdminUpdateGameRulesRequest;
import com.youthloop.game.api.facade.GameRuleAdminFacade;
import com.youthloop.game.application.service.GameRuleAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Game rule admin facade implementation.
 */
@Service
@RequiredArgsConstructor
public class GameRuleAdminFacadeImpl implements GameRuleAdminFacade {

    private final GameRuleAdminService gameRuleAdminService;

    @Override
    public AdminGameRulesConfigDTO getRules() {
        return gameRuleAdminService.getRules();
    }

    @Override
    public void updateRules(AdminUpdateGameRulesRequest request) {
        gameRuleAdminService.updateRules(request);
    }
}

