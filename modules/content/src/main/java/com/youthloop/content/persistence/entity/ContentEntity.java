package com.youthloop.content.persistence.entity;

import com.youthloop.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 内容实体（对应 social.content 表）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ContentEntity extends BaseEntity {
    
    /**
     * 内容 ID
     */
    private UUID id;
    
    /**
     * 内容类型：1=新闻 2=动态 3=政策 4=百科
     */
    private Integer type;
    
    /**
     * 标题
     */
    private String title;
    
    /**
     * 摘要
     */
    private String summary;
    
    /**
     * 封面图 URL
     */
    private String coverUrl;
    
    /**
     * 正文内容
     */
    private String body;
    
    /**
     * 来源类型：1=人工 2=爬取
     */
    private Integer sourceType;
    
    /**
     * 来源 URL
     */
    private String sourceUrl;
    
    /**
     * 发布时间
     */
    private LocalDateTime publishedAt;
    
    /**
     * 状态：1=已发布 2=草稿 3=隐藏
     */
    private Integer status;
    
    /**
     * 全文搜索字段（tsvector）
     */
    private String fts;
}
