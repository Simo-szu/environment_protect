package com.youthloop.ingestion.api.facade;

import com.youthloop.ingestion.api.dto.DailyIngestionSummary;
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

    public DailyIngestionSummary ingestDaily() {
        return contentIngestionService.ingestDaily();
    }
}

