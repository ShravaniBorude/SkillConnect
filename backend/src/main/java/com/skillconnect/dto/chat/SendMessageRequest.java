package com.skillconnect.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotBlank(message = "Message content is required")
        @Size(max = 10000, message = "Message cannot exceed 10000 characters")
        String content,

        String attachmentUrl,
        String attachmentName,
        String messageType
) {}
