package com.youthloop.activity.persistence.mapper;

import com.youthloop.activity.persistence.entity.ActivitySignupEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 活动报名 Mapper
 */
@Mapper
public interface ActivitySignupMapper {
    
    /**
     * 插入报名记录
     */
    int insert(ActivitySignupEntity entity);
    
    /**
     * 根据 ID 查询报名记录
     */
    ActivitySignupEntity selectById(@Param("id") UUID id);
    
    /**
     * 根据活动 ID 和去重键查询报名记录（用于幂等检查）
     */
    ActivitySignupEntity selectByActivityAndDedupKey(
        @Param("activityId") UUID activityId,
        @Param("dedupKey") String dedupKey
    );
    
    /**
     * 更新报名状态
     */
    int updateStatus(
        @Param("id") UUID id,
        @Param("status") Integer status,
        @Param("auditedBy") UUID auditedBy,
        @Param("auditNote") String auditNote
    );
    
    /**
     * 取消报名
     */
    int cancel(
        @Param("id") UUID id,
        @Param("cancelNote") String cancelNote
    );
    
    /**
     * 更新场次 ID（改场次）
     */
    int updateSession(
        @Param("id") UUID id,
        @Param("sessionId") UUID sessionId
    );
    
    /**
     * 更新报名信息（昵称/真实姓名/手机号）
     */
    int updateInfo(
        @Param("id") UUID id,
        @Param("nickname") String nickname,
        @Param("realName") String realName,
        @Param("phone") String phone
    );
    
    /**
     * 查询活动的报名列表（主办方查看）
     */
    List<Map<String, Object>> selectSignupList(
        @Param("activityId") UUID activityId,
        @Param("status") Integer status,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计活动的报名总数
     */
    Long countSignups(
        @Param("activityId") UUID activityId,
        @Param("status") Integer status
    );
}
