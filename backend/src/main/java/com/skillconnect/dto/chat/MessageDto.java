package com.skillconnect.dto.chat;

import com.skillconnect.entity.Message;

import java.time.Instant;

public record MessageDto(
        Long id,
        Long conversationId,
        Long senderId,
        String senderName,
        String senderAvatar,
        String content,
        String attachmentUrl,
        String attachmentName,
        String messageType,
        boolean read,
        Instant readAt,
        Instant createdAt
) {
    public static MessageDto from(Message m) {
        return new MessageDto(
                m.getId(),
                m.getConversation().getId(),
                m.getSender().getId(),
                m.getSender().getFullName(),
                m.getSender().getAvatarUrl(),
                m.getContent(),
                m.getAttachmentUrl(),
                m.getAttachmentName(),
                m.getMessageType().name(),
                m.isRead(),
                m.getReadAt(),
                m.getCreatedAt()
        );
    }
}
