package com.youthloop.ingestion.api.facade;

import com.youthloop.ingestion.api.dto.CarbonMarketManualSyncResultDTO;
import com.youthloop.ingestion.application.service.CarbonMarketSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Facade for carbon market sync actions.
 */
@Component
@RequiredArgsConstructor
public class CarbonMarketSyncFacade {

    private final CarbonMarketSyncService carbonMarketSyncService;

    public CarbonMarketManualSyncResultDTO triggerManualSync() {
        return carbonMarketSyncService.triggerManualSync();
    }
}
