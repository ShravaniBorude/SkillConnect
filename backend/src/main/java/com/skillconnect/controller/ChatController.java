package com.skillconnect.controller;

import com.skillconnect.dto.chat.*;
import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.service.ChatService;
import com.skillconnect.service.NotificationService;
import com.skillconnect.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, NotificationService notificationService,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationDto>> getOrCreate(
            @RequestParam Long otherUserId,
            @RequestParam(required = false) Long contractId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.ok(chatService.getOrCreateConversation(otherUserId, contractId)));
    }

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConversationDto>>> myConversations() {
        return ResponseEntity.ok(ApiResponse.ok(chatService.getMyConversations()));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<MessageDto>>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.ok(chatService.getMessages(conversationId, page, size)));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(chatService.sendMessage(conversationId, request)));
    }

    @PatchMapping("/conversations/{conversationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long conversationId) {
        chatService.markMessagesRead(conversationId);
        return ResponseEntity.ok(ApiResponse.ok("Messages marked as read", null));
    }

    // WebSocket message handler
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload WsMessagePayload payload, Principal principal) {
        if (principal == null) return;
        MessageDto dto = chatService.handleWebSocketMessage(payload, principal.getName());
        messagingTemplate.convertAndSend("/topic/conversation." + payload.conversationId(), dto);
    }

    // Notifications REST
    @GetMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(userId, page, size)));
    }

    @GetMapping("/notifications/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> unreadCount() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.countUnread(SecurityUtils.getCurrentUserId())));
    }

    @PatchMapping("/notifications/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsRead() {
        notificationService.markAllRead(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
