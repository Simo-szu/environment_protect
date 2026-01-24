package com.youthloop.social.worker.jobs;

import com.youthloop.search.application.service.SearchIndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 搜索索引更新任务
 * 定期更新全文搜索索引
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SearchIndexUpdateJob {
    
    private final SearchIndexService searchIndexService;
    
    /**
     * 每小时更新一次搜索索引
     */
    @Scheduled(cron = "0 0 * * * ?", zone = "Asia/Shanghai")
    public void updateSearchIndex() {
        log.info("开始更新搜索索引...");
        
        try {
            // 更新内容的全文搜索索引
            searchIndexService.updateContentIndex();
            
            // 更新活动的全文搜索索引
            searchIndexService.updateActivityIndex();
            
            log.info("搜索索引更新完成");
        } catch (Exception e) {
            log.error("搜索索引更新失败", e);
        }
    }
}
