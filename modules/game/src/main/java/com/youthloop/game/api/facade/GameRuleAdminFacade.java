package com.youthloop.game.api.facade;

import com.youthloop.game.api.dto.AdminGameRulesConfigDTO;
import com.youthloop.game.api.dto.AdminUpdateGameRulesRequest;

/**
 * Admin facade for game rules management.
 */
public interface GameRuleAdminFacade {

    AdminGameRulesConfigDTO getRules();

    void updateRules(AdminUpdateGameRulesRequest request);
}

