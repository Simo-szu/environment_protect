package com.youthloop.ingestion.api.facade;

import com.youthloop.ingestion.api.dto.IngestionSettingsDTO;
import com.youthloop.ingestion.api.dto.UpdateIngestionSettingsRequest;
import com.youthloop.ingestion.application.service.IngestionSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Facade for ingestion settings.
 */
@Component
@RequiredArgsConstructor
public class IngestionSettingsFacade {

    private final IngestionSettingsService ingestionSettingsService;

    public IngestionSettingsDTO getSettings() {
        return ingestionSettingsService.getSettings();
    }

    public IngestionSettingsDTO updateSettings(UpdateIngestionSettingsRequest request) {
        return ingestionSettingsService.updateSettings(request);
    }
}
