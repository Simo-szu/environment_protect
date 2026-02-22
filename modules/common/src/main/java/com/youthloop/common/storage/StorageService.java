package com.youthloop.common.storage;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Object storage service (S3-compatible: MinIO/OSS).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {
    
    private final MinioClient minioClient;
    
    @Value("${minio.bucket-name}")
    private String bucketName;
    
    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.public-base-url:}")
    private String publicBaseUrl;
    
    /**
     * 生成上传预签名 URL
     * 
     * @param fileType 文件类型（avatar/poster/doc）
     * @param fileName 原始文件名
     * @param contentType MIME 类型
     * @return 预签名 URL 和最终访问 URL
     */
    public PresignResult generateUploadPresignUrl(String fileType, String fileName, String contentType) {
        try {
            // 生成唯一文件名：fileType/uuid-originalName
            String extension = getFileExtension(fileName);
            String objectName = String.format("%s/%s%s", fileType, UUID.randomUUID(), extension);
            
            // 生成预签名 PUT URL（15 分钟有效）
            String uploadUrl = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.PUT)
                    .bucket(bucketName)
                    .object(objectName)
                    .expiry(15, TimeUnit.MINUTES)
                    .build()
            );
            
            // Public file URL: prefer CDN/public base URL when configured.
            String fileUrl = buildPublicFileUrl(objectName);
            
            log.info("生成预签名 URL: objectName={}, uploadUrl={}", objectName, uploadUrl);
            
            return new PresignResult(uploadUrl, fileUrl, 900); // 15分钟 = 900秒
            
        } catch (Exception e) {
            log.error("生成预签名 URL 失败: fileType={}, fileName={}", fileType, fileName, e);
            throw new BizException(ErrorCode.SYSTEM_ERROR, "生成上传 URL 失败");
        }
    }
    
    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    private String buildPublicFileUrl(String objectName) {
        if (isNotBlank(publicBaseUrl)) {
            return joinUrl(publicBaseUrl, objectName);
        }
        return joinUrl(joinUrl(endpoint, bucketName), objectName);
    }

    private String joinUrl(String base, String path) {
        String normalizedBase = trimTrailingSlash(base);
        String normalizedPath = trimLeadingSlash(path);
        return normalizedBase + "/" + normalizedPath;
    }

    private String trimTrailingSlash(String value) {
        String trimmed = value == null ? "" : value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    private String trimLeadingSlash(String value) {
        String trimmed = value == null ? "" : value.trim();
        while (trimmed.startsWith("/")) {
            trimmed = trimmed.substring(1);
        }
        return trimmed;
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }
    
    /**
     * 预签名结果
     */
    public record PresignResult(String uploadUrl, String fileUrl, int expiresIn) {}
}
