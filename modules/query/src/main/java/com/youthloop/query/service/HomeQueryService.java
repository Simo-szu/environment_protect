package com.youthloop.query.service;

import com.youthloop.query.dto.ActivityListItemDTO;
import com.youthloop.query.dto.CarbonMarketSnapshotDTO;
import com.youthloop.query.dto.ContentListItemDTO;
import com.youthloop.query.dto.HomeBannerDTO;
import com.youthloop.query.dto.HomeDTO;
import com.youthloop.query.mapper.ContentQueryMapper;
import com.youthloop.query.mapper.HomeQueryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Homepage aggregate query service.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HomeQueryService {

    private final HomeQueryMapper homeQueryMapper;
    private final ContentQueryMapper contentQueryMapper;
    private final CarbonMarketSnapshotService carbonMarketSnapshotService;

    @Transactional(readOnly = true)
    public HomeDTO getHomeData() {
        HomeDTO dto = new HomeDTO();

        List<Map<String, Object>> bannerRows = homeQueryMapper.selectActiveBanners();
        dto.setBanners(bannerRows.stream()
            .map(this::mapToHomeBannerDTO)
            .collect(Collectors.toList()));

        List<Map<String, Object>> contentRows = contentQueryMapper.selectLatestContents(resolveLocale(), 10);
        dto.setLatestContents(contentRows.stream()
            .map(this::mapToContentListItem)
            .collect(Collectors.toList()));

        List<Map<String, Object>> activityRows = homeQueryMapper.selectLatestActivities(5);
        dto.setLatestActivities(activityRows.stream()
            .map(this::mapToActivityListItem)
            .collect(Collectors.toList()));

        dto.setMarketSnapshot(carbonMarketSnapshotService.getSnapshot());
        return dto;
    }

    @Transactional(readOnly = true)
    public CarbonMarketSnapshotDTO getCarbonMarketSnapshot() {
        return carbonMarketSnapshotService.getSnapshot();
    }

    private LocalDateTime toLocalDateTime(Object obj) {
        if (obj == null) {
            return null;
        }
        if (obj instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (obj instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        return null;
    }

    private HomeBannerDTO mapToHomeBannerDTO(Map<String, Object> row) {
        HomeBannerDTO dto = new HomeBannerDTO();
        dto.setId((UUID) row.get("id"));
        dto.setTitle((String) row.get("title"));
        dto.setImageUrl((String) row.get("image_url"));
        dto.setLinkUrl((String) row.get("link_url"));
        dto.setSortOrder((Integer) row.get("sort_order"));
        dto.setStartAt(toLocalDateTime(row.get("start_at")));
        dto.setEndAt(toLocalDateTime(row.get("end_at")));
        return dto;
    }

    private ContentListItemDTO mapToContentListItem(Map<String, Object> row) {
        ContentListItemDTO dto = new ContentListItemDTO();
        dto.setId((UUID) row.get("id"));
        dto.setType((Integer) row.get("type"));
        dto.setTitle((String) row.get("title"));
        dto.setSummary((String) row.get("summary"));
        dto.setCoverUrl((String) row.get("cover_url"));
        dto.setPublishedAt(toLocalDateTime(row.get("published_at")));
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt(toLocalDateTime(row.get("created_at")));
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        dto.setHotScore(row.get("hot_score") != null ? ((Number) row.get("hot_score")).longValue() : 0L);
        return dto;
    }

    private ActivityListItemDTO mapToActivityListItem(Map<String, Object> row) {
        ActivityListItemDTO dto = new ActivityListItemDTO();
        dto.setId((UUID) row.get("id"));
        dto.setSourceType((Integer) row.get("source_type"));
        dto.setTitle((String) row.get("title"));
        dto.setCategory((Integer) row.get("category"));
        dto.setTopic((String) row.get("topic"));
        dto.setStartTime(toLocalDateTime(row.get("start_time")));
        dto.setEndTime(toLocalDateTime(row.get("end_time")));
        dto.setLocation((String) row.get("location"));

        Object posterUrls = row.get("poster_urls");
        if (posterUrls != null) {
            dto.setPosterUrl(posterUrls.toString());
        }

        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt(toLocalDateTime(row.get("created_at")));
        dto.setSignupCount(row.get("signup_count") != null ? ((Number) row.get("signup_count")).intValue() : 0);
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
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
