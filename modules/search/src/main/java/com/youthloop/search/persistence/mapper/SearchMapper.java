package com.youthloop.search.persistence.mapper;

import com.youthloop.search.api.dto.SearchResultDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 搜索Mapper
 */
@Mapper
public interface SearchMapper {
    
    /**
     * 搜索内容
     */
    List<SearchResultDTO> searchContent(@Param("keyword") String keyword, 
                                        @Param("offset") int offset, 
                                        @Param("limit") int limit);
    
    /**
     * 统计内容搜索结果数
     */
    Long countContent(@Param("keyword") String keyword);
    
    /**
     * 搜索活动
     */
    List<SearchResultDTO> searchActivity(@Param("keyword") String keyword, 
                                         @Param("offset") int offset, 
                                         @Param("limit") int limit);
    
    /**
     * 统计活动搜索结果数
     */
    Long countActivity(@Param("keyword") String keyword);
}
