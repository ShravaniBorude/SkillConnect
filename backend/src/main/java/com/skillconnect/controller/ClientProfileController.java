package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.dto.profile.*;
import com.skillconnect.service.ClientProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ClientProfileController {

    private final ClientProfileService clientProfileService;

    public ClientProfileController(ClientProfileService clientProfileService) {
        this.clientProfileService = clientProfileService;
    }

    @GetMapping("/client/profile")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ClientProfileDto>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.ok(clientProfileService.getMyProfile()));
    }

    @PutMapping("/client/profile")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ClientProfileDto>> updateProfile(
            @Valid @RequestBody UpdateClientProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", clientProfileService.updateProfile(request)));
    }

    @GetMapping("/clients/{userId}")
    public ResponseEntity<ApiResponse<ClientProfileDto>> getClientByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(clientProfileService.getProfileByUserId(userId)));
    }
}
