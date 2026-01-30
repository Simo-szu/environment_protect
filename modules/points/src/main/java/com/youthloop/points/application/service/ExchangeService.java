package com.youthloop.points.application.service;

import com.youthloop.points.api.dto.ExchangeRequestDTO;
import com.youthloop.points.api.dto.GoodDTO;
import java.util.List;

/**
 * 兑换商城服务接口
 */
public interface ExchangeService {
    
    /**
     * 获取可兑换商品
     */
    List<GoodDTO> getActiveGoods();
    
    /**
     * 兑换商品
     */
    void exchange(ExchangeRequestDTO request);
}
