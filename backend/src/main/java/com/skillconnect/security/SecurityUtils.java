package com.skillconnect.security;

import com.skillconnect.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static CustomUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails details)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return details;
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
