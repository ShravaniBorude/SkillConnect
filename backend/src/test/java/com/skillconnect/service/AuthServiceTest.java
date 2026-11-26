package com.skillconnect.service;

import com.skillconnect.dto.auth.AuthResponse;
import com.skillconnect.dto.auth.RegisterRequest;
import com.skillconnect.entity.Role;
import com.skillconnect.entity.User;
import com.skillconnect.entity.enums.RoleName;
import com.skillconnect.exception.ConflictException;
import com.skillconnect.repository.*;
import com.skillconnect.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private FreelancerProfileRepository freelancerProfileRepository;
    @Mock private ClientProfileRepository clientProfileRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_DuplicateEmail_ThrowsConflictException() {
        RegisterRequest req = new RegisterRequest("Alice", "alice@example.com", "Password123!", "ROLE_CLIENT", null);
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_NewFreelancer_CreatesProfileAndReturnsJwt() {
        RegisterRequest req = new RegisterRequest("Bob", "bob@example.com", "Password123!", "ROLE_FREELANCER", null);
        Role role = new Role();
        role.setName(RoleName.ROLE_FREELANCER);

        when(userRepository.existsByEmail("bob@example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_FREELANCER)).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_pw");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(42L);
            return u;
        });
        when(jwtService.generateToken(any())).thenReturn("jwt-token");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertEquals("jwt-token", res.token());
        verify(freelancerProfileRepository, times(1)).save(any());
        verify(emailService, times(1)).sendVerificationEmail(eq("bob@example.com"), eq("Bob"), anyString());
    }
}
