package com.youthloop.social.worker.jobs;

import com.youthloop.ingestion.application.service.CarbonMarketSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Periodically synchronizes official national carbon market data.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CarbonMarketSyncJob {

    private final CarbonMarketSyncService carbonMarketSyncService;

    @Scheduled(cron = "0 * * * * ?", zone = "Asia/Shanghai")
    public void syncCarbonMarket() {
        try {
            carbonMarketSyncService.syncOfficialData();
        } catch (Exception e) {
            log.warn("Carbon market sync job failed", e);
        }
    }
}
