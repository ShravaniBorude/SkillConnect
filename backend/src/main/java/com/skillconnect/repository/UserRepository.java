package com.skillconnect.repository;

import com.skillconnect.entity.User;
import com.skillconnect.entity.enums.AccountStatus;
import com.skillconnect.entity.enums.RoleName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByResetToken(String token);
    long countByRole_Name(RoleName roleName);
    long countByAccountStatus(AccountStatus status);

    @Query("""
        SELECT u FROM User u
        WHERE (:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:roleName IS NULL OR u.role.name = :roleName)
          AND (:status IS NULL OR u.accountStatus = :status)
        ORDER BY u.createdAt DESC
        """)
    Page<User> searchAdminUsers(
            @Param("keyword") String keyword,
            @Param("roleName") RoleName roleName,
            @Param("status") AccountStatus status,
            Pageable pageable
    );
}
