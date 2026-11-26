package com.skillconnect.service;

import com.skillconnect.entity.Notification;
import com.skillconnect.entity.User;
import com.skillconnect.entity.enums.NotificationType;
import com.skillconnect.repository.NotificationRepository;
import com.skillconnect.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository,
                                SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void createAndSend(Long userId, String type, String title, String message,
                               String referenceType, Long referenceId) {
        userRepository.findById(userId).ifPresent(user -> {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(NotificationType.valueOf(type));
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setReferenceType(referenceType);
            notification.setReferenceId(referenceId);
            notification.setRead(false);
            Notification saved = notificationRepository.save(notification);

            // Push via WebSocket
            try {
                messagingTemplate.convertAndSendToUser(
                        user.getEmail(),
                        "/queue/notifications",
                        Map.of(
                                "id", saved.getId(),
                                "type", saved.getType().name(),
                                "title", saved.getTitle(),
                                "message", saved.getMessage(),
                                "referenceType", referenceType != null ? referenceType : "",
                                "referenceId", referenceId != null ? referenceId : 0,
                                "createdAt", saved.getCreatedAt().toString()
                        )
                );
            } catch (Exception ignored) {
                // WebSocket push is best-effort; notification is already persisted
            }
        });
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Long userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }
}
