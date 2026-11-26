package com.skillconnect.dto.profile;

import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateClientProfileRequest(
        @Size(max = 150)
        String companyName,

        @Size(max = 120)
        String industry,

        @Size(max = 255)
        String website,

        @Size(max = 3000)
        String bio,

        @Size(max = 120)
        String location
) {}
