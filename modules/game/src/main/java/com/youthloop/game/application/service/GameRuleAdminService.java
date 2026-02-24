package com.youthloop.game.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.game.api.dto.AdminGameRulesConfigDTO;
import com.youthloop.game.api.dto.AdminUpdateGameRulesRequest;
import com.youthloop.game.persistence.entity.GameBalanceRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameCardTagMapEntity;
import com.youthloop.game.persistence.entity.GameComboRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameEndingContentConfigEntity;
import com.youthloop.game.persistence.entity.GameEventRuleConfigEntity;
import com.youthloop.game.persistence.entity.GamePolicyUnlockRuleConfigEntity;
import com.youthloop.game.persistence.entity.GameRuntimeParamConfigEntity;
import com.youthloop.game.persistence.mapper.GameRuleConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Admin service for game rule configuration.
 */
@Service
@RequiredArgsConstructor
public class GameRuleAdminService {

    private final GameRuleConfigMapper gameRuleConfigMapper;
    private final GameRuleConfigService gameRuleConfigService;

    @Transactional(readOnly = true)
    public AdminGameRulesConfigDTO getRules() {
        AdminGameRulesConfigDTO dto = new AdminGameRulesConfigDTO();
        dto.setRuntimeParam(gameRuleConfigMapper.selectEnabledRuntimeParamConfig());
        dto.setBalanceRule(gameRuleConfigMapper.selectEnabledBalanceRuleConfig());
        dto.setEventRules(gameRuleConfigMapper.selectEnabledEventRules());
        dto.setComboRules(gameRuleConfigMapper.selectEnabledComboRules());
        dto.setPolicyUnlockRules(gameRuleConfigMapper.selectEnabledPolicyUnlockRules());
        dto.setCardTags(gameRuleConfigMapper.selectEnabledCardTags());
        dto.setEndingContents(gameRuleConfigMapper.selectEnabledEndingContents());
        return dto;
    }

    @Transactional
    public void updateRules(AdminUpdateGameRulesRequest request) {
        if (request == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Update payload is required");
        }

        GameRuntimeParamConfigEntity runtimeParam = request.getRuntimeParam();
        if (runtimeParam != null) {
            if (runtimeParam.getConfigId() == null) {
                runtimeParam.setConfigId(1);
            }
            if (runtimeParam.getFreePlacementEnabled() == null) {
                runtimeParam.setFreePlacementEnabled(true);
            }
            gameRuleConfigMapper.upsertRuntimeParamConfig(runtimeParam);
        }

        GameBalanceRuleConfigEntity balanceRule = request.getBalanceRule();
        if (balanceRule != null) {
            if (balanceRule.getConfigId() == null) {
                balanceRule.setConfigId(1);
            }
            gameRuleConfigMapper.upsertBalanceRuleConfig(balanceRule);
        }

        if (request.getEventRules() != null) {
            replaceEventRules(request.getEventRules());
        }
        if (request.getComboRules() != null) {
            replaceComboRules(request.getComboRules());
        }
        if (request.getPolicyUnlockRules() != null) {
            replacePolicyUnlockRules(request.getPolicyUnlockRules());
        }
        if (request.getCardTags() != null) {
            replaceCardTags(request.getCardTags());
        }
        if (request.getEndingContents() != null) {
            replaceEndingContents(request.getEndingContents());
        }

        gameRuleConfigService.reloadFromDatabase();
    }

    private void replaceEventRules(List<GameEventRuleConfigEntity> rules) {
        gameRuleConfigMapper.disableAllEventRules();
        for (GameEventRuleConfigEntity rule : rules) {
            requireText(rule.getEventType(), "eventType");
            gameRuleConfigMapper.upsertEventRule(rule);
        }
    }

    private void replaceComboRules(List<GameComboRuleConfigEntity> rules) {
        gameRuleConfigMapper.disableAllComboRules();
        for (GameComboRuleConfigEntity rule : rules) {
            requireText(rule.getComboId(), "comboId");
            gameRuleConfigMapper.upsertComboRule(rule);
        }
    }

    private void replacePolicyUnlockRules(List<GamePolicyUnlockRuleConfigEntity> rules) {
        gameRuleConfigMapper.disableAllPolicyUnlockRules();
        for (GamePolicyUnlockRuleConfigEntity rule : rules) {
            requireText(rule.getPolicyId(), "policyId");
            gameRuleConfigMapper.upsertPolicyUnlockRule(rule);
        }
    }

    private void replaceCardTags(List<GameCardTagMapEntity> cardTags) {
        gameRuleConfigMapper.disableAllCardTags();
        for (GameCardTagMapEntity tag : cardTags) {
            requireText(tag.getCardId(), "cardId");
            requireText(tag.getTagCode(), "tagCode");
            gameRuleConfigMapper.upsertCardTag(tag);
        }
    }

    private void replaceEndingContents(List<GameEndingContentConfigEntity> endings) {
        gameRuleConfigMapper.disableAllEndingContents();
        for (GameEndingContentConfigEntity ending : endings) {
            requireText(ending.getEndingId(), "endingId");
            gameRuleConfigMapper.upsertEndingContent(ending);
        }
    }

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Missing required field: " + field);
        }
    }
}
