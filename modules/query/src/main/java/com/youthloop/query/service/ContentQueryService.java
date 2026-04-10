package com.youthloop.query.service;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.query.dto.ContentDetailDTO;
import com.youthloop.query.dto.ContentListItemDTO;
import com.youthloop.query.dto.UserState;
import com.youthloop.query.mapper.ContentQueryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Aggregated content query service.
 */
@Slf4j
@Service("contentAggregateQueryService")
@RequiredArgsConstructor
public class ContentQueryService {

    private final ContentQueryMapper contentQueryMapper;

    @Transactional(readOnly = true)
    public PageResponse<ContentListItemDTO> getContentList(
        Integer type,
        String sourceKey,
        Integer status,
        String sort,
        Integer page,
        Integer size
    ) {
        status = status != null ? status : 1;
        sort = sort != null ? sort : "latest";
        page = Math.max(1, page != null ? page : 1);
        size = Math.min(100, Math.max(1, size != null ? size : 20));
        List<String> sourceKeys = parseSourceKeys(sourceKey);
        String locale = resolveLocale();
        int offset = (page - 1) * size;

        Long total = contentQueryMapper.countContentList(type, sourceKeys, status);
        if (total == 0) {
            return PageResponse.of(Collections.emptyList(), total, page, size);
        }

        List<Map<String, Object>> rows = contentQueryMapper.selectContentListWithStats(
            type,
            sourceKeys,
            status,
            sort,
            locale,
            offset,
            size
        );
        if (rows.isEmpty()) {
            return PageResponse.of(Collections.emptyList(), total, page, size);
        }

        List<ContentListItemDTO> items = rows.stream()
            .map(this::mapToContentListItem)
            .collect(Collectors.toList());

        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        if (currentUserId != null) {
            enrichWithUserState(items, currentUserId);
        }

        return PageResponse.of(items, total, page, size);
    }

    @Transactional(readOnly = true)
    public ContentDetailDTO getContentDetail(UUID contentId) {
        Map<String, Object> row = contentQueryMapper.selectContentDetailWithStats(contentId, resolveLocale());
        if (row == null) {
            return null;
        }

        ContentDetailDTO dto = mapToContentDetail(row);
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        if (currentUserId != null) {
            List<Map<String, Object>> reactions = contentQueryMapper.selectUserReactionsForContents(
                currentUserId,
                Collections.singletonList(contentId)
            );
            dto.setUserState(reactions.isEmpty() ? UserState.empty() : buildUserState(reactions.get(0)));
        }
        return dto;
    }

    private void enrichWithUserState(List<ContentListItemDTO> items, UUID userId) {
        List<UUID> contentIds = items.stream()
            .map(ContentListItemDTO::getId)
            .collect(Collectors.toList());

        List<Map<String, Object>> reactions = contentQueryMapper.selectUserReactionsForContents(userId, contentIds);
        Map<UUID, UserState> stateMap = reactions.stream().collect(Collectors.toMap(
            row -> (UUID) row.get("content_id"),
            this::buildUserState
        ));

        items.forEach(item -> item.setUserState(stateMap.getOrDefault(item.getId(), UserState.empty())));
    }

    private UserState buildUserState(Map<String, Object> row) {
        Boolean liked = (Boolean) row.getOrDefault("liked", false);
        Boolean favorited = (Boolean) row.getOrDefault("favorited", false);
        Boolean downvoted = (Boolean) row.getOrDefault("downvoted", false);
        return new UserState(liked, favorited, downvoted);
    }

    private List<String> parseSourceKeys(String sourceKey) {
        if (sourceKey == null) {
            return null;
        }
        Set<String> unique = new LinkedHashSet<>();
        for (String part : sourceKey.split(",")) {
            String normalized = part == null ? "" : part.trim();
            if (!normalized.isEmpty()) {
                unique.add(normalized);
            }
        }
        if (unique.isEmpty()) {
            return null;
        }
        return List.copyOf(unique);
    }

    private java.time.LocalDateTime toLocalDateTime(Object obj) {
        if (obj == null) {
            return null;
        }
        if (obj instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (obj instanceof java.time.LocalDateTime localDateTime) {
            return localDateTime;
        }
        return null;
    }

    private ContentListItemDTO mapToContentListItem(Map<String, Object> row) {
        ContentListItemDTO dto = new ContentListItemDTO();
        dto.setId((UUID) row.get("id"));
        dto.setType((Integer) row.get("type"));
        dto.setTitle((String) row.get("title"));
        dto.setSummary((String) row.get("summary"));
        dto.setCoverUrl((String) row.get("cover_url"));
        dto.setSourceUrl((String) row.get("source_url"));
        dto.setPublishedAt(toLocalDateTime(row.get("published_at")));
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt(toLocalDateTime(row.get("created_at")));
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        dto.setViewCount(row.get("view_count") != null ? ((Number) row.get("view_count")).longValue() : 0L);
        dto.setHotScore(row.get("hot_score") != null ? ((Number) row.get("hot_score")).longValue() : 0L);
        return dto;
    }

    private ContentDetailDTO mapToContentDetail(Map<String, Object> row) {
        ContentDetailDTO dto = new ContentDetailDTO();
        dto.setId((UUID) row.get("id"));
        dto.setType((Integer) row.get("type"));
        dto.setTitle((String) row.get("title"));
        dto.setSummary((String) row.get("summary"));
        dto.setCoverUrl((String) row.get("cover_url"));
        dto.setBody((String) row.get("body"));
        dto.setSourceType((Integer) row.get("source_type"));
        dto.setSourceUrl((String) row.get("source_url"));
        dto.setPublishedAt(toLocalDateTime(row.get("published_at")));
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt(toLocalDateTime(row.get("created_at")));
        dto.setUpdatedAt(toLocalDateTime(row.get("updated_at")));
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setDownCount(row.get("down_count") != null ? ((Number) row.get("down_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        dto.setViewCount(row.get("view_count") != null ? ((Number) row.get("view_count")).longValue() : 0L);
        dto.setHotScore(row.get("hot_score") != null ? ((Number) row.get("hot_score")).longValue() : 0L);
        return dto;
    }

    private String resolveLocale() {
        String language = LocaleContextHolder.getLocale() != null
            ? LocaleContextHolder.getLocale().getLanguage()
            : null;
        if (language == null) {
            return "zh";
        }
        String normalized = language.trim().toLowerCase();
        if (normalized.startsWith("en")) {
            return "en";
        }
        return "zh";
    }
}
