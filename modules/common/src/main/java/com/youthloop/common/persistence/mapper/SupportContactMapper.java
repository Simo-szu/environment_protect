package com.youthloop.common.persistence.mapper;

import com.youthloop.common.domain.model.SupportContact;
import org.apache.ibatis.annotations.Mapper;
import java.util.UUID;

/**
 * 联系我们 Mapper
 */
@Mapper
public interface SupportContactMapper {
    
    void insert(SupportContact contact);
    
    SupportContact selectById(UUID id);
}
