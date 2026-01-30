package com.youthloop.points.persistence.mapper;

import com.youthloop.points.api.dto.GoodDTO;
import com.youthloop.points.persistence.entity.GoodEntity;
import com.youthloop.points.persistence.entity.OrderEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 兑换商城 Mapper
 */
@Mapper
public interface ExchangeMapper {
    
    /**
     * 获取所有上架商品
     */
    List<GoodEntity> selectAllActiveGoods();
    
    /**
     * 根据 ID 获取商品
     */
    GoodEntity selectGoodById(@Param("id") UUID id);
    
    /**
     * 扣减库存
     */
    int decreaseStock(@Param("id") UUID id, @Param("amount") int amount);
    
    /**
     * 插入订单
     */
    int insertOrder(OrderEntity order);
}
