package com.skillconnect.service;

import com.skillconnect.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "png", "jpg", "jpeg", "webp", "pdf", "doc", "docx", "zip", "txt", "csv"
    );
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/png", "image/jpeg", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/zip", "application/x-zip-compressed",
            "text/plain", "text/csv"
    );

    private final RestClient restClient;

    @Value("${app.storage.cloudinary-cloud-name:}")
    private String cloudName;

    @Value("${app.storage.cloudinary-api-key:}")
    private String apiKey;

    @Value("${app.storage.cloudinary-api-secret:}")
    private String apiSecret;

    @Value("${app.storage.local-upload-dir:./uploads}")
    private String localUploadDir;

    public FileStorageService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public UploadedFileResult storeFile(MultipartFile file, String folder) {
        validateFile(file);
        String originalName = sanitizeFilename(file.getOriginalFilename());
        String sanitizedFolder = sanitizeFolder(folder);

        if (isCloudinaryConfigured()) {
            try {
                return uploadToCloudinary(file, originalName, sanitizedFolder);
            } catch (Exception ex) {
                log.warn("Cloudinary upload failed, falling back to validated local storage: {}", ex.getMessage());
            }
        }
        return storeLocally(file, originalName, sanitizedFolder);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File exceeds maximum allowed size of 10 MB");
        }
        String original = file.getOriginalFilename();
        String ext = extractExtension(original);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Unsupported file extension: " + ext);
        }
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank() && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Unsupported file type: " + contentType);
        }
    }

    private UploadedFileResult storeLocally(MultipartFile file, String originalName, String folder) {
        try {
            Path targetDir = Paths.get(localUploadDir, folder).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);
            String ext = extractExtension(originalName);
            String storedName = UUID.randomUUID() + "." + ext;
            Path targetFile = targetDir.resolve(storedName).normalize();
            if (!targetFile.startsWith(targetDir)) {
                throw new BadRequestException("Invalid file path");
            }
            Files.write(targetFile, file.getBytes());
            String url = "/uploads/" + folder + "/" + storedName;
            return new UploadedFileResult(originalName, url, file.getContentType(), file.getSize());
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file: " + ex.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private UploadedFileResult uploadToCloudinary(MultipartFile file, String originalName, String folder) throws IOException {
        long timestamp = System.currentTimeMillis() / 1000L;
        String folderPath = "skillconnect/" + folder;
        String toSign = "folder=" + folderPath + "&timestamp=" + timestamp + apiSecret;
        String signature = sha1Hex(toSign);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return originalName;
            }
        });
        body.add("api_key", apiKey);
        body.add("timestamp", String.valueOf(timestamp));
        body.add("folder", folderPath);
        body.add("signature", signature);

        String endpoint = "https://api.cloudinary.com/v1_1/" + cloudName + "/auto/upload";
        Map<String, Object> response = restClient.post()
                .uri(endpoint)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("secure_url") == null) {
            throw new BadRequestException("Cloudinary did not return a secure URL");
        }
        return new UploadedFileResult(
                originalName,
                response.get("secure_url").toString(),
                file.getContentType(),
                file.getSize()
        );
    }

    private boolean isCloudinaryConfigured() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }

    private String sanitizeFilename(String name) {
        if (name == null || name.isBlank()) {
            return "file.bin";
        }
        return Paths.get(name).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String sanitizeFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            return "general";
        }
        return folder.replaceAll("[^a-zA-Z0-9_-]", "").toLowerCase();
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private String sha1Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("SHA-1 not available", ex);
        }
    }

    public record UploadedFileResult(String fileName, String fileUrl, String fileType, long fileSize) {}
}
