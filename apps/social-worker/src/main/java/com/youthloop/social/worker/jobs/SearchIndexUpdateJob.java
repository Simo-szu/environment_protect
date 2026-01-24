package com.youthloop.social.worker.jobs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
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
    
    private final JdbcTemplate jdbcTemplate;
    
    /**
     * 每小时更新一次搜索索引
     */
    @Scheduled(cron = "0 0 * * * ?", zone = "Asia/Shanghai")
    public void updateSearchIndex() {
        log.info("开始更新搜索索引...");
        
        try {
            // 更新内容的全文搜索索引
            updateContentIndex();
            
            // 更新活动的全文搜索索引
            updateActivityIndex();
            
            log.info("搜索索引更新完成");
        } catch (Exception e) {
            log.error("搜索索引更新失败", e);
        }
    }
    
    /**
     * 更新内容索引
     */
    private void updateContentIndex() {
        String sql = """
            UPDATE social.content
            SET fts = to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body, ''))
            WHERE fts IS NULL OR updated_at > now() - interval '1 hour'
            """;
        
        int updated = jdbcTemplate.update(sql);
        log.info("更新内容索引: {} 条记录", updated);
    }
    
    /**
     * 更新活动索引
     */
    private void updateActivityIndex() {
        String sql = """
            UPDATE social.activity
            SET fts = to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
            WHERE fts IS NULL OR updated_at > now() - interval '1 hour'
            """;
        
        int updated = jdbcTemplate.update(sql);
        log.info("更新活动索引: {} 条记录", updated);
    }
}
