package com.skillconnect.service;

import com.skillconnect.dto.auth.*;
import com.skillconnect.entity.ClientProfile;
import com.skillconnect.entity.FreelancerProfile;
import com.skillconnect.entity.Role;
import com.skillconnect.entity.User;
import com.skillconnect.entity.enums.AccountStatus;
import com.skillconnect.entity.enums.RoleName;
import com.skillconnect.exception.BadRequestException;
import com.skillconnect.exception.ConflictException;
import com.skillconnect.exception.ResourceNotFoundException;
import com.skillconnect.repository.*;
import com.skillconnect.security.CustomUserDetails;
import com.skillconnect.security.JwtService;
import com.skillconnect.security.SecurityUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       FreelancerProfileRepository freelancerProfileRepository,
                       ClientProfileRepository clientProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.clientProfileRepository = clientProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account already exists with this email address");
        }

        RoleName roleName;
        try {
            roleName = RoleName.valueOf("ROLE_" + request.role());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.role());
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone());
        user.setRole(role);
        user.setAccountStatus(AccountStatus.PENDING_VERIFICATION);

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));

        User savedUser = userRepository.save(user);

        // Create role-specific profile
        if (roleName == RoleName.ROLE_FREELANCER) {
            FreelancerProfile fp = new FreelancerProfile();
            fp.setUser(savedUser);
            freelancerProfileRepository.save(fp);
        } else if (roleName == RoleName.ROLE_CLIENT) {
            ClientProfile cp = new ClientProfile();
            cp.setUser(savedUser);
            clientProfileRepository.save(cp);
        }

        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getFullName(), token);

        // Auto-activate in dev (email not configured)
        CustomUserDetails details = new CustomUserDetails(savedUser);
        String jwt = jwtService.generateToken(details);
        return new AuthResponse(jwt, toUserSummaryDto(savedUser));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().toLowerCase().trim(),
                        request.password()
                )
        );
        CustomUserDetails details = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(details.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String jwt = jwtService.generateToken(details);
        return new AuthResponse(jwt, toUserSummaryDto(user));
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));
        if (user.getVerificationTokenExpiresAt() != null
                && user.getVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Verification token has expired. Please request a new one.");
        }
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with that email"));
        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), token);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email().toLowerCase().trim()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
        });
        // Always return success to prevent user enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (user.getResetTokenExpiresAt() != null
                && user.getResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Password reset token has expired. Please request a new one.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserSummaryDto updateBasicProfile(UpdateProfileBasicRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone());
        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            user.setAvatarUrl(request.avatarUrl());
        }
        return toUserSummaryDto(userRepository.save(user));
    }

    public UserSummaryDto getCurrentUserProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserSummaryDto(user);
    }

    public static UserSummaryDto toUserSummaryDto(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().getName().name(),
                user.getAvatarUrl(),
                user.getPhone(),
                user.isEmailVerified(),
                user.getAccountStatus().name(),
                user.getCreatedAt()
        );
    }
}
