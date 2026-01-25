package com.youthloop.common.persistence.repository;

import com.youthloop.common.domain.model.SupportContact;
import java.util.UUID;

/**
 * 联系我们 Repository
 */
public interface SupportContactRepository {
    
    /**
     * 保存联系记录
     */
    void save(SupportContact contact);
    
    /**
     * 根据 ID 查询
     */
    SupportContact findById(UUID id);
}
