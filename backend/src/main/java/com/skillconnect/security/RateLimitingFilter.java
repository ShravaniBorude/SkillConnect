package com.skillconnect.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillconnect.dto.common.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000L;
    private static final int AUTH_LIMIT_PER_MIN = 30;
    private static final int PAYMENT_LIMIT_PER_MIN = 20;

    private final Map<String, Deque<Long>> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        int limit = resolveLimit(path, request.getMethod());
        if (limit <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = resolveClientIp(request) + ":" + path;
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = buckets.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= limit) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                objectMapper.writeValue(
                        response.getWriter(),
                        ApiResponse.error("Too many requests. Please wait a minute and try again.")
                );
                return;
            }
            timestamps.addLast(now);
        }

        filterChain.doFilter(request, response);
    }

    private int resolveLimit(String path, String method) {
        if (!"POST".equalsIgnoreCase(method)) {
            return -1;
        }
        if (path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/forgot-password")
                || path.startsWith("/api/auth/reset-password")) {
            return AUTH_LIMIT_PER_MIN;
        }
        if (path.startsWith("/api/payments/orders")) {
            return PAYMENT_LIMIT_PER_MIN;
        }
        return -1;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
