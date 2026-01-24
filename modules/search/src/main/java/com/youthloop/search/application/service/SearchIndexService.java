package com.youthloop.search.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 搜索索引服务
 * 负责更新全文搜索索引（fts 字段）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchIndexService {
    
    private final JdbcTemplate jdbcTemplate;
    
    /**
     * 更新内容的全文搜索索引
     * @return 更新的记录数
     */
    @Transactional
    public int updateContentIndex() {
        String sql = """
            UPDATE social.content
            SET fts = to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body, ''))
            WHERE fts IS NULL OR updated_at > now() - interval '1 hour'
            """;
        
        int updated = jdbcTemplate.update(sql);
        log.info("更新内容索引: {} 条记录", updated);
        return updated;
    }
    
    /**
     * 更新活动的全文搜索索引
     * @return 更新的记录数
     */
    @Transactional
    public int updateActivityIndex() {
        String sql = """
            UPDATE social.activity
            SET fts = to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
            WHERE fts IS NULL OR updated_at > now() - interval '1 hour'
            """;
        
        int updated = jdbcTemplate.update(sql);
        log.info("更新活动索引: {} 条记录", updated);
        return updated;
    }
}
