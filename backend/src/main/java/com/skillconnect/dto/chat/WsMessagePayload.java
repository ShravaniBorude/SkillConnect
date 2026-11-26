package com.skillconnect.dto.chat;

public record WsMessagePayload(
        Long conversationId,
        String content,
        String attachmentUrl,
        String attachmentName,
        String messageType
) {}
