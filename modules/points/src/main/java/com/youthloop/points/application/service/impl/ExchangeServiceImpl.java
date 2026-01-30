package com.youthloop.points.application.service.impl;

import com.youthloop.common.util.SecurityUtil;
import com.youthloop.points.api.dto.ExchangeRequestDTO;
import com.youthloop.points.api.dto.GoodDTO;
import com.youthloop.points.application.service.ExchangeService;
import com.youthloop.points.application.service.PointsService;
import com.youthloop.points.persistence.entity.GoodEntity;
import com.youthloop.points.persistence.entity.OrderEntity;
import com.youthloop.points.persistence.mapper.ExchangeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 兑换商城服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeServiceImpl implements ExchangeService {

    private final ExchangeMapper exchangeMapper;
    private final PointsService pointsService;

    @Override
    public List<GoodDTO> getActiveGoods() {
        List<GoodEntity> entities = exchangeMapper.selectAllActiveGoods();
        return entities.stream().map(e -> GoodDTO.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .imageUrl(e.getImageUrl())
                .pointsCost(e.getPointsCost())
                .stock(e.getStock())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void exchange(ExchangeRequestDTO request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        GoodEntity good = exchangeMapper.selectGoodById(request.getGoodId());

        if (good == null || good.getStatus() != 1) {
            throw new IllegalArgumentException("商品不存在或已下架");
        }

        if (good.getStock() <= 0) {
            throw new IllegalStateException("商品库存不足");
        }

        // 1. 扣除积分 (PointsService 内部有余额检查)
        // reason=6(兑换), refType=6(EXCHANGE), refId=商品ID
        pointsService.deductPoints(userId, good.getPointsCost(), 6, 6, good.getId(), "兑换: " + good.getTitle());

        // 2. 扣减库存
        int rows = exchangeMapper.decreaseStock(good.getId(), 1);
        if (rows == 0) {
            throw new IllegalStateException("扣减库存失败，可能库存已变动");
        }

        // 3. 创建订单（包含收货信息）
        OrderEntity order = OrderEntity.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .goodId(good.getId())
                .pointsCost(good.getPointsCost())
                .status(1) // 1=placed
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .shippingAddress(request.getShippingAddress())
                .shippingNote(request.getShippingNote())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        exchangeMapper.insertOrder(order);

        log.info("用户兑换成功: userId={}, goodId={}, title={}, recipient={}", 
                userId, good.getId(), good.getTitle(), request.getRecipientName());
    }
}
