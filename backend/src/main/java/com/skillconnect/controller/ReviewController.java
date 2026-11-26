package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.review.*;
import com.skillconnect.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDto>> submit(@Valid @RequestBody SubmitReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Review submitted", reviewService.submitReview(request)));
    }

    @GetMapping("/reviews/user/{userId}")
    public ResponseEntity<ApiResponse<PageResponse<ReviewDto>>> getForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsForUser(userId, page, size)));
    }
}
