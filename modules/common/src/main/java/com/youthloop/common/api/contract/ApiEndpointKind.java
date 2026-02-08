package com.youthloop.common.api.contract;

/**
 * 接口响应类型分类
 */
public enum ApiEndpointKind {
    /**
     * 分页列表接口
     */
    PAGE_LIST,

    /**
     * 详情查询接口
     */
    DETAIL,

    /**
     * 写操作接口（新增/更新/删除/状态切换/审批）
     */
    COMMAND
}
