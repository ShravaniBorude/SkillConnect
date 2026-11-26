package com.skillconnect.service;

import com.skillconnect.dto.profile.*;
import com.skillconnect.entity.ClientProfile;
import com.skillconnect.exception.ResourceNotFoundException;
import com.skillconnect.repository.ClientProfileRepository;
import com.skillconnect.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientProfileService {

    private final ClientProfileRepository clientProfileRepository;

    public ClientProfileService(ClientProfileRepository clientProfileRepository) {
        this.clientProfileRepository = clientProfileRepository;
    }

    @Transactional(readOnly = true)
    public ClientProfileDto getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        ClientProfile cp = clientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));
        return ClientProfileDto.from(cp);
    }

    @Transactional(readOnly = true)
    public ClientProfileDto getProfileByUserId(Long userId) {
        ClientProfile cp = clientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found for user: " + userId));
        return ClientProfileDto.from(cp);
    }

    @Transactional
    public ClientProfileDto updateProfile(UpdateClientProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ClientProfile cp = clientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));

        if (request.companyName() != null) cp.setCompanyName(request.companyName());
        if (request.industry() != null) cp.setIndustry(request.industry());
        if (request.website() != null) cp.setWebsite(request.website());
        if (request.bio() != null) cp.setBio(request.bio());
        if (request.location() != null) cp.setLocation(request.location());

        return ClientProfileDto.from(clientProfileRepository.save(cp));
    }
}
