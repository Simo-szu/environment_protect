package com.youthloop.content.api.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.content.api.dto.ContentDTO;
import com.youthloop.content.api.dto.ContentListDTO;
import com.youthloop.content.api.dto.ContentQueryRequest;

import java.util.UUID;

/**
 * 内容查询门面（对外契约）
 */
public interface ContentQueryFacade {
    
    /**
     * 分页查询内容列表
     */
    PageResponse<ContentListDTO> getContentList(ContentQueryRequest request);
    
    /**
     * 根据 ID 查询内容详情
     */
    ContentDTO getContentById(UUID id);
}
