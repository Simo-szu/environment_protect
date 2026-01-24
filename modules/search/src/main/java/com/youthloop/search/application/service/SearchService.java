package com.youthloop.search.application.service;

import com.youthloop.common.api.PageResponse;
import com.youthloop.search.api.dto.SearchRequest;
import com.youthloop.search.api.dto.SearchResultDTO;
import com.youthloop.search.persistence.mapper.SearchMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 搜索服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {
    
    private final SearchMapper searchMapper;
    
    /**
     * 搜索内容和活动
     */
    public PageResponse<SearchResultDTO> search(SearchRequest request) {
        if (request.getKeyword() == null || request.getKeyword().trim().isEmpty()) {
            return PageResponse.of(new ArrayList<>(), 0L, request.getPage(), request.getPageSize());
        }
        
        String keyword = request.getKeyword().trim();
        Integer type = request.getType() != null ? request.getType() : 3; // 默认搜索全部
        
        int page = Math.max(1, request.getPage());
        int pageSize = Math.min(100, Math.max(1, request.getPageSize()));
        int offset = (page - 1) * pageSize;
        
        List<SearchResultDTO> results = new ArrayList<>();
        long total = 0;
        
        // 根据类型搜索
        if (type == 1 || type == 3) {
            // 搜索内容
            List<SearchResultDTO> contentResults = searchMapper.searchContent(keyword, offset, pageSize);
            results.addAll(contentResults);
            total += searchMapper.countContent(keyword);
        }
        
        if (type == 2 || type == 3) {
            // 搜索活动
            List<SearchResultDTO> activityResults = searchMapper.searchActivity(keyword, offset, pageSize);
            results.addAll(activityResults);
            total += searchMapper.countActivity(keyword);
        }
        
        // 按相关度排序
        results.sort((a, b) -> Float.compare(
            b.getRelevanceScore() != null ? b.getRelevanceScore() : 0f,
            a.getRelevanceScore() != null ? a.getRelevanceScore() : 0f
        ));
        
        log.info("搜索完成: keyword={}, type={}, total={}", keyword, type, total);
        
        return PageResponse.of(results, total, page, pageSize);
    }
    
    /**
     * 获取搜索建议
     * v0.1 实现：返回预定义的热门搜索词
     * 未来可以：
     * 1. 从 Redis 缓存中获取实时热门搜索词
     * 2. 根据用户搜索历史返回个性化建议
     * 3. 使用前缀匹配从数据库查询相关标题
     */
    public List<String> getSuggestions(String prefix) {
        // 预定义的热门搜索词
        List<String> hotKeywords = java.util.Arrays.asList(
            "环保",
            "垃圾分类",
            "低碳生活",
            "节能减排",
            "绿色出行",
            "可持续发展",
            "生态保护",
            "循环经济",
            "清洁能源",
            "碳中和"
        );
        
        // 如果有前缀，进行过滤
        if (prefix != null && !prefix.trim().isEmpty()) {
            String lowerPrefix = prefix.trim().toLowerCase();
            return hotKeywords.stream()
                .filter(keyword -> keyword.toLowerCase().contains(lowerPrefix))
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
        }
        
        // 无前缀时返回前 5 个热门词
        return hotKeywords.stream()
            .limit(5)
            .collect(java.util.stream.Collectors.toList());
    }
}
