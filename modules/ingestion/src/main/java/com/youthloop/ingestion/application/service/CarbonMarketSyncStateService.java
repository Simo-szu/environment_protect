package com.youthloop.ingestion.application.service;

import com.youthloop.ingestion.persistence.entity.CarbonMarketSyncStateEntity;
import com.youthloop.ingestion.persistence.mapper.CarbonMarketSyncStateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

/**
 * Persists carbon market sync state updates in an independent transaction.
 */
@Service
@RequiredArgsConstructor
public class CarbonMarketSyncStateService {

    private static final int SYNC_STATE_ID = 1;

    private final CarbonMarketSyncStateMapper syncStateMapper;

    @Transactional(readOnly = true)
    public CarbonMarketSyncStateEntity getState() {
        return syncStateMapper.selectById(SYNC_STATE_ID);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markSuccess(OffsetDateTime syncedAt, LocalDate tradeDate, LocalTime quoteTime) {
        CarbonMarketSyncStateEntity syncState = new CarbonMarketSyncStateEntity();
        syncState.setId(SYNC_STATE_ID);
        syncState.setLastSuccessAt(syncedAt);
        syncState.setLastTradeDate(tradeDate);
        syncState.setLastQuoteTime(quoteTime);
        syncState.setUpdatedAt(syncedAt);
        syncStateMapper.markSuccess(syncState);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailure(String lastError, OffsetDateTime updatedAt) {
        CarbonMarketSyncStateEntity syncState = new CarbonMarketSyncStateEntity();
        syncState.setId(SYNC_STATE_ID);
        syncState.setLastError(lastError);
        syncState.setUpdatedAt(updatedAt);
        syncStateMapper.markFailure(syncState);
    }
}
