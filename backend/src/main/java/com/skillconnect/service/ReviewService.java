package com.skillconnect.service;

import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.review.*;
import com.skillconnect.entity.*;
import com.skillconnect.entity.enums.ContractStatus;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ContractRepository contractRepository,
                         UserRepository userRepository,
                         FreelancerProfileRepository freelancerProfileRepository,
                         ClientProfileRepository clientProfileRepository) {
        this.reviewRepository = reviewRepository;
        this.contractRepository = contractRepository;
        this.userRepository = userRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.clientProfileRepository = clientProfileRepository;
    }

    @Transactional
    public ReviewDto submitReview(SubmitReviewRequest request) {
        Long reviewerId = SecurityUtils.getCurrentUserId();
        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + request.contractId()));

        if (contract.getStatus() != ContractStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted for completed contracts");
        }
        if (!contract.getClient().getId().equals(reviewerId) && !contract.getFreelancer().getId().equals(reviewerId)) {
            throw new ForbiddenException("Not your contract");
        }
        if (reviewRepository.existsByContractIdAndReviewerId(request.contractId(), reviewerId)) {
            throw new ConflictException("You have already reviewed this contract");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        User reviewee = userRepository.findById(request.revieweeId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewee not found"));

        Review review = new Review();
        review.setContract(contract);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(request.rating());
        review.setComment(request.comment());

        Review saved = reviewRepository.save(review);

        // Update aggregate rating
        updateRatingAggregates(reviewee.getId());

        return ReviewDto.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewDto> getReviewsForUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.from(reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId, pageable), ReviewDto::from);
    }

    private void updateRatingAggregates(Long userId) {
        Double avg = reviewRepository.calculateAverageRating(userId);
        long count = reviewRepository.countByRevieweeId(userId);
        BigDecimal avgRating = avg != null
                ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        freelancerProfileRepository.findByUserId(userId).ifPresent(fp -> {
            fp.setAverageRating(avgRating);
            fp.setTotalReviews((int) count);
            freelancerProfileRepository.save(fp);
        });
        clientProfileRepository.findByUserId(userId).ifPresent(cp -> {
            cp.setAverageRating(avgRating);
            cp.setTotalReviews((int) count);
            clientProfileRepository.save(cp);
        });
    }
}
