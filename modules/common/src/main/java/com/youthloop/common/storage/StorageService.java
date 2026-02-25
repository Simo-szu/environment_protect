package com.youthloop.common.storage;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

/**
 * Object storage service (S3-compatible: MinIO/OSS).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private static final Duration PRESIGN_TTL = Duration.ofMinutes(15);
    private static final int PRESIGN_TTL_SECONDS = 900;

    private final S3Presigner s3Presigner;

    @Value("${storage.bucket-name}")
    private String bucketName;

    @Value("${storage.public-base-url}")
    private String publicBaseUrl;

    /**
     * Generate a presigned upload URL for direct browser upload.
     */
    public PresignResult generateUploadPresignUrl(String fileType, String fileName, String contentType) {
        try {
            String extension = getFileExtension(fileName);
            String objectName = String.format("%s/%s%s", fileType, UUID.randomUUID(), extension);

            String uploadUrl = generatePresignedPutUrl(objectName, contentType);
            String fileUrl = buildPublicFileUrl(objectName);

            log.info("Generated presigned upload URL: objectName={}, uploadUrl={}", objectName, uploadUrl);

            return new PresignResult(uploadUrl, fileUrl, PRESIGN_TTL_SECONDS);

        } catch (Exception e) {
            log.error("Failed to generate presigned upload URL: fileType={}, fileName={}", fileType, fileName, e);
            throw new BizException(ErrorCode.SYSTEM_ERROR, "Failed to generate upload URL");
        }
    }

    /**
     * Get file extension including the dot.
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    private String generatePresignedPutUrl(String objectName, String contentType) {
        PutObjectRequest.Builder putObjectRequestBuilder = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(objectName);
        if (contentType != null && !contentType.isBlank()) {
            putObjectRequestBuilder.contentType(contentType.trim());
        }

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(
            PutObjectPresignRequest.builder()
                .signatureDuration(PRESIGN_TTL)
                .putObjectRequest(putObjectRequestBuilder.build())
                .build()
        );

        return presignedRequest.url().toString();
    }

    private String buildPublicFileUrl(String objectName) {
        String baseUrl = trimTrailingSlash(publicBaseUrl);
        if (baseUrl.isEmpty()) {
            throw new IllegalStateException("storage.public-base-url must not be blank");
        }
        return joinUrl(baseUrl, objectName);
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

    /**
     * Presigned upload result.
     */
    public record PresignResult(String uploadUrl, String fileUrl, int expiresIn) {}
}
