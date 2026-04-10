package com.youthloop.ingestion.api.facade;

import com.youthloop.ingestion.api.dto.BackfillContentRequest;
import com.youthloop.ingestion.api.dto.BackfillContentSummary;
import com.youthloop.ingestion.api.dto.DailyIngestionSummary;
import com.youthloop.ingestion.application.service.ContentBackfillService;
import com.youthloop.ingestion.application.service.ContentIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Facade entry for worker jobs.
 */
@Component
@RequiredArgsConstructor
public class ContentIngestionFacade {

    private final ContentIngestionService contentIngestionService;
    private final ContentBackfillService contentBackfillService;

    public DailyIngestionSummary ingestDaily() {
        return contentIngestionService.ingestDaily();
    }

    public BackfillContentSummary backfillExistingContent(BackfillContentRequest request) {
        return contentBackfillService.backfill(request);
    }
}
