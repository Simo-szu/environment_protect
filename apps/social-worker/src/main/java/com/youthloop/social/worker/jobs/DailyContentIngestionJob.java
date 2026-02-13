package com.youthloop.social.worker.jobs;

import com.youthloop.ingestion.api.dto.DailyIngestionSummary;
import com.youthloop.ingestion.api.facade.ContentIngestionFacade;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Daily content ingestion job.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DailyContentIngestionJob {

    private final ContentIngestionFacade contentIngestionFacade;

    /**
     * Run once every day at 03:30.
     */
    @Scheduled(cron = "${ingestion.content.cron:0 30 3 * * ?}", zone = "${ingestion.content.zone:Asia/Shanghai}")
    public void ingestDailyContent() {
        log.info("Start daily content ingestion job...");
        try {
            DailyIngestionSummary summary = contentIngestionFacade.ingestDaily();
            log.info("Daily content ingestion finished. startedAt={}, finishedAt={}, reports={}",
                summary.getStartedAt(), summary.getFinishedAt(), summary.getReports());
        } catch (Exception e) {
            log.error("Daily content ingestion failed", e);
        }
    }
}

