package com.youthloop.content.application.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.content.api.dto.ContentDTO;
import com.youthloop.content.api.dto.ContentListDTO;
import com.youthloop.content.api.dto.ContentQueryRequest;
import com.youthloop.content.api.facade.ContentQueryFacade;
import com.youthloop.content.application.service.ContentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * 内容查询门面实现
 */
@Service
@RequiredArgsConstructor
public class ContentQueryFacadeImpl implements ContentQueryFacade {
    
    @Qualifier("contentBasicQueryService")
    private final ContentQueryService contentQueryService;
    
    @Override
    public PageResponse<ContentListDTO> getContentList(ContentQueryRequest request) {
        return contentQueryService.getContentList(request);
    }
    
    @Override
    public ContentDTO getContentById(UUID id) {
        return contentQueryService.getContentById(id);
    }
}
