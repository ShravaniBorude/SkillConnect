package com.skillconnect.repository;

import com.skillconnect.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Page<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId, Pageable pageable);
    List<Message> findByConversationIdAndSenderIdNotAndReadFalse(Long conversationId, Long userId);

    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.read = false AND m.sender.id <> :userId
          AND (m.conversation.participantOne.id = :userId OR m.conversation.participantTwo.id = :userId)
        """)
    long countUnreadForUser(@Param("userId") Long userId);
}
