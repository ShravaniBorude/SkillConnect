package com.skillconnect.repository;

import com.skillconnect.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("""
        SELECT c FROM Conversation c
        WHERE c.participantOne.id = :userId OR c.participantTwo.id = :userId
        ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC
        """)
    List<Conversation> findUserConversations(@Param("userId") Long userId);

    @Query("""
        SELECT c FROM Conversation c
        WHERE ((c.participantOne.id = :u1 AND c.participantTwo.id = :u2)
           OR  (c.participantOne.id = :u2 AND c.participantTwo.id = :u1))
          AND (:contractId IS NULL OR c.contract.id = :contractId)
        ORDER BY c.createdAt DESC
        """)
    List<Conversation> findBetweenUsers(@Param("u1") Long u1, @Param("u2") Long u2, @Param("contractId") Long contractId);

    Optional<Conversation> findFirstByContractId(Long contractId);
}
