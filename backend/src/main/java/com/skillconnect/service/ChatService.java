package com.skillconnect.service;

import com.skillconnect.dto.chat.*;
import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.entity.*;
import com.skillconnect.entity.enums.MessageType;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public ChatService(ConversationRepository conversationRepository,
                       MessageRepository messageRepository,
                       ContractRepository contractRepository,
                       UserRepository userRepository,
                       SimpMessagingTemplate messagingTemplate,
                       NotificationService notificationService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.contractRepository = contractRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    @Transactional
    public ConversationDto getOrCreateConversation(Long otherUserId, Long contractId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<Conversation> existing = conversationRepository.findBetweenUsers(currentUserId, otherUserId, contractId);
        if (!existing.isEmpty()) return ConversationDto.from(existing.get(0));

        User me = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + otherUserId));

        Conversation conv = new Conversation();
        conv.setParticipantOne(me);
        conv.setParticipantTwo(other);
        if (contractId != null) {
            contractRepository.findById(contractId).ifPresent(c -> {
                conv.setContract(c);
                conv.setProject(c.getProject());
            });
        }
        return ConversationDto.from(conversationRepository.save(conv));
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getMyConversations() {
        Long userId = SecurityUtils.getCurrentUserId();
        return conversationRepository.findUserConversations(userId)
                .stream().map(ConversationDto::from).toList();
    }

    @Transactional
    public MessageDto sendMessage(Long conversationId, SendMessageRequest request) {
        Long senderId = SecurityUtils.getCurrentUserId();
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        if (!conv.getParticipantOne().getId().equals(senderId) && !conv.getParticipantTwo().getId().equals(senderId)) {
            throw new ForbiddenException("Not your conversation");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Message message = new Message();
        message.setConversation(conv);
        message.setSender(sender);
        message.setContent(request.content());
        message.setAttachmentUrl(request.attachmentUrl());
        message.setAttachmentName(request.attachmentName());
        try {
            message.setMessageType(request.messageType() != null
                    ? MessageType.valueOf(request.messageType()) : MessageType.TEXT);
        } catch (IllegalArgumentException e) {
            message.setMessageType(MessageType.TEXT);
        }

        Message saved = messageRepository.save(message);

        // Update conversation preview
        conv.setLastMessageAt(Instant.now());
        conv.setLastMessagePreview(request.content().length() > 100
                ? request.content().substring(0, 100) + "…" : request.content());
        conversationRepository.save(conv);

        MessageDto dto = MessageDto.from(saved);

        // Push via WebSocket to conversation topic
        messagingTemplate.convertAndSend("/topic/conversation." + conversationId, dto);

        // Notify other participant
        Long recipientId = conv.getParticipantOne().getId().equals(senderId)
                ? conv.getParticipantTwo().getId() : conv.getParticipantOne().getId();
        notificationService.createAndSend(recipientId,
                "MESSAGE_RECEIVED",
                "New message from " + sender.getFullName(),
                request.content().length() > 80 ? request.content().substring(0, 80) + "…" : request.content(),
                "CONVERSATION", conversationId);

        return dto;
    }

    @Transactional
    public MessageDto handleWebSocketMessage(WsMessagePayload payload, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Conversation conv = conversationRepository.findById(payload.conversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conv.getParticipantOne().getId().equals(sender.getId())
                && !conv.getParticipantTwo().getId().equals(sender.getId())) {
            throw new ForbiddenException("Not your conversation");
        }

        SendMessageRequest req = new SendMessageRequest(
                payload.content(), payload.attachmentUrl(), payload.attachmentName(), payload.messageType());

        // Temporarily set security context — reuse same logic via service
        Message message = new Message();
        message.setConversation(conv);
        message.setSender(sender);
        message.setContent(payload.content());
        message.setAttachmentUrl(payload.attachmentUrl());
        message.setAttachmentName(payload.attachmentName());
        message.setMessageType(payload.messageType() != null
                ? MessageType.valueOf(payload.messageType()) : MessageType.TEXT);

        Message saved = messageRepository.save(message);
        conv.setLastMessageAt(Instant.now());
        conv.setLastMessagePreview(payload.content().length() > 100
                ? payload.content().substring(0, 100) + "…" : payload.content());
        conversationRepository.save(conv);

        return MessageDto.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<MessageDto> getMessages(Long conversationId, int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));
        if (!conv.getParticipantOne().getId().equals(userId) && !conv.getParticipantTwo().getId().equals(userId)) {
            throw new ForbiddenException("Not your conversation");
        }
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.from(messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, pageable), MessageDto::from);
    }

    @Transactional
    public void markMessagesRead(Long conversationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Message> unread = messageRepository.findByConversationIdAndSenderIdNotAndReadFalse(conversationId, userId);
        unread.forEach(m -> { m.setRead(true); m.setReadAt(Instant.now()); });
        messageRepository.saveAll(unread);
    }
}
