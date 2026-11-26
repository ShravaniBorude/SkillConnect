package com.skillconnect.dto.chat;

import com.skillconnect.entity.Conversation;
import com.skillconnect.entity.Message;

import java.time.Instant;
import java.util.List;

public record ConversationDto(
        Long id,
        Long contractId,
        Long projectId,
        Long participantOneId,
        String participantOneName,
        String participantOneAvatar,
        Long participantTwoId,
        String participantTwoName,
        String participantTwoAvatar,
        Instant lastMessageAt,
        String lastMessagePreview,
        Instant createdAt
) {
    public static ConversationDto from(Conversation c) {
        return new ConversationDto(
                c.getId(),
                c.getContract() != null ? c.getContract().getId() : null,
                c.getProject() != null ? c.getProject().getId() : null,
                c.getParticipantOne().getId(),
                c.getParticipantOne().getFullName(),
                c.getParticipantOne().getAvatarUrl(),
                c.getParticipantTwo().getId(),
                c.getParticipantTwo().getFullName(),
                c.getParticipantTwo().getAvatarUrl(),
                c.getLastMessageAt(),
                c.getLastMessagePreview(),
                c.getCreatedAt()
        );
    }
}
