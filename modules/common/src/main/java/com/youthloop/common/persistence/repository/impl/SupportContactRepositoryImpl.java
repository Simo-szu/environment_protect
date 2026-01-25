package com.youthloop.common.persistence.repository.impl;

import com.youthloop.common.domain.model.SupportContact;
import com.youthloop.common.persistence.mapper.SupportContactMapper;
import com.youthloop.common.persistence.repository.SupportContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.UUID;

/**
 * 联系我们 Repository 实现
 */
@Repository
@RequiredArgsConstructor
public class SupportContactRepositoryImpl implements SupportContactRepository {
    
    private final SupportContactMapper mapper;
    
    @Override
    public void save(SupportContact contact) {
        mapper.insert(contact);
    }
    
    @Override
    public SupportContact findById(UUID id) {
        return mapper.selectById(id);
    }
}
