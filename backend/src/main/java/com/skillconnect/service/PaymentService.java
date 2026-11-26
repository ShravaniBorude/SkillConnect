package com.skillconnect.service;

import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.payment.*;
import com.skillconnect.entity.*;
import com.skillconnect.entity.enums.*;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;
    private final ContractRepository contractRepository;
    private final MilestoneRepository milestoneRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final NotificationService notificationService;
    private final RestClient restClient;

    @Value("${app.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:}")
    private String razorpayKeySecret;

    @Value("${app.razorpay.platform-fee-percent:10.0}")
    private double platformFeePercent;

    public PaymentService(PaymentRepository paymentRepository,
                          TransactionRepository transactionRepository,
                          ContractRepository contractRepository,
                          MilestoneRepository milestoneRepository,
                          FreelancerProfileRepository freelancerProfileRepository,
                          ClientProfileRepository clientProfileRepository,
                          NotificationService notificationService,
                          RestClient.Builder restClientBuilder) {
        this.paymentRepository = paymentRepository;
        this.transactionRepository = transactionRepository;
        this.contractRepository = contractRepository;
        this.milestoneRepository = milestoneRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.clientProfileRepository = clientProfileRepository;
        this.notificationService = notificationService;
        this.restClient = restClientBuilder.build();
    }

    @Transactional
    public Map<String, Object> createPaymentOrder(CreatePaymentOrderRequest request) {
        Long clientId = SecurityUtils.getCurrentUserId();

        // Idempotency check
        if (paymentRepository.findByIdempotencyKey(request.idempotencyKey()).isPresent()) {
            throw new ConflictException("Duplicate payment request detected. Use a unique idempotency key.");
        }

        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + request.contractId()));

        if (!contract.getClient().getId().equals(clientId)) {
            throw new ForbiddenException("Not your contract");
        }
        if (contract.getStatus() != ContractStatus.ACTIVE && contract.getStatus() != ContractStatus.IN_REVIEW) {
            throw new BadRequestException("Contract must be ACTIVE to initiate payment");
        }

        BigDecimal amount = request.amount();
        BigDecimal fee = amount.multiply(BigDecimal.valueOf(platformFeePercent / 100.0)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal net = amount.subtract(fee).setScale(2, RoundingMode.HALF_UP);

        Payment payment = new Payment();
        payment.setContract(contract);
        payment.setPayer(contract.getClient());
        payment.setPayee(contract.getFreelancer());
        payment.setAmount(amount);
        payment.setPlatformFee(fee);
        payment.setNetAmount(net);
        payment.setCurrency(request.currency() != null ? request.currency().toUpperCase() : "INR");
        payment.setIdempotencyKey(request.idempotencyKey());
        payment.setStatus(PaymentStatus.CREATED);
        payment.setReceiptNumber("SC-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());

        if (request.milestoneId() != null) {
            milestoneRepository.findById(request.milestoneId()).ifPresent(payment::setMilestone);
        }

        // Create Razorpay order if configured
        String razorpayOrderId = null;
        if (razorpayKeyId != null && !razorpayKeyId.isBlank()
                && razorpayKeySecret != null && !razorpayKeySecret.isBlank()) {
            razorpayOrderId = createRazorpayOrder(amount, payment.getCurrency(), payment.getReceiptNumber());
        }
        payment.setRazorpayOrderId(razorpayOrderId != null ? razorpayOrderId : "mock_order_" + UUID.randomUUID().toString().substring(0, 16));
        payment.setStatus(PaymentStatus.PENDING);

        Payment saved = paymentRepository.save(payment);

        return Map.of(
                "paymentId", saved.getId(),
                "razorpayOrderId", saved.getRazorpayOrderId(),
                "razorpayKeyId", razorpayKeyId != null ? razorpayKeyId : "",
                "amount", amount.multiply(BigDecimal.valueOf(100)).longValue(),
                "currency", saved.getCurrency(),
                "receiptNumber", saved.getReceiptNumber()
        );
    }

    @Transactional
    public PaymentDto verifyAndCapturePayment(VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.paymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + request.paymentId()));

        Long clientId = SecurityUtils.getCurrentUserId();
        if (!payment.getPayer().getId().equals(clientId)) {
            throw new ForbiddenException("Not your payment");
        }
        if (payment.getStatus() == PaymentStatus.CAPTURED) {
            throw new ConflictException("Payment already captured");
        }

        // HMAC-SHA256 signature verification
        if (razorpayKeySecret != null && !razorpayKeySecret.isBlank()) {
            boolean valid = verifyRazorpaySignature(
                    request.razorpayOrderId() + "|" + request.razorpayPaymentId(),
                    request.razorpaySignature(),
                    razorpayKeySecret
            );
            if (!valid) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Payment signature verification failed");
                paymentRepository.save(payment);
                throw new BadRequestException("Payment signature verification failed. Transaction rejected.");
            }
        }

        payment.setRazorpayPaymentId(request.razorpayPaymentId());
        payment.setRazorpaySignature(request.razorpaySignature());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setPaidAt(Instant.now());
        Payment saved = paymentRepository.save(payment);

        // Record transactions
        recordTransaction(saved, saved.getPayer(), TransactionType.PAYMENT,
                saved.getAmount(), "Payment for contract #" + saved.getContract().getId());
        recordTransaction(saved, saved.getPayee(), TransactionType.EARNING_RECORD,
                saved.getNetAmount(), "Earnings from contract #" + saved.getContract().getId());

        // Update aggregate stats
        clientProfileRepository.findByUserId(clientId).ifPresent(cp -> {
            cp.setTotalSpent(cp.getTotalSpent().add(saved.getAmount()));
            clientProfileRepository.save(cp);
        });
        freelancerProfileRepository.findByUserId(saved.getPayee().getId()).ifPresent(fp -> {
            fp.setTotalEarnings(fp.getTotalEarnings().add(saved.getNetAmount()));
            freelancerProfileRepository.save(fp);
        });

        // Update milestone if applicable
        if (payment.getMilestone() != null) {
            payment.getMilestone().setStatus(MilestoneStatus.PAID);
            milestoneRepository.save(payment.getMilestone());
        }

        notificationService.createAndSend(saved.getPayee().getId(),
                "PAYMENT_CAPTURED",
                "Payment Received",
                "Payment of " + saved.getCurrency() + " " + saved.getNetAmount() + " received for contract #" + saved.getContract().getId(),
                "CONTRACT", saved.getContract().getId());

        return PaymentDto.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentDto> getMyPaymentHistory(int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        String role = SecurityUtils.getCurrentUser().getRoleName();
        Pageable pageable = PageRequest.of(page, size);
        if (role.contains("CLIENT")) {
            return PageResponse.from(paymentRepository.findByPayerIdOrderByCreatedAtDesc(userId, pageable), PaymentDto::from);
        }
        return PageResponse.from(paymentRepository.findByPayeeIdOrderByCreatedAtDesc(userId, pageable), PaymentDto::from);
    }

    private void recordTransaction(Payment payment, User user, TransactionType type, BigDecimal amount, String description) {
        Transaction tx = new Transaction();
        tx.setPayment(payment);
        tx.setUser(user);
        tx.setTransactionType(type);
        tx.setAmount(amount);
        tx.setCurrency(payment.getCurrency());
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setReferenceCode("TX-" + UUID.randomUUID().toString().substring(0, 16).toUpperCase());
        tx.setDescription(description);
        transactionRepository.save(tx);
    }

    @SuppressWarnings("unchecked")
    private String createRazorpayOrder(BigDecimal amount, String currency, String receipt) {
        try {
            String credentials = Base64.getEncoder()
                    .encodeToString((razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8));
            long amountPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();
            Map<String, Object> response = restClient.post()
                    .uri("https://api.razorpay.com/v1/orders")
                    .header("Authorization", "Basic " + credentials)
                    .header("Content-Type", "application/json")
                    .body(Map.of("amount", amountPaise, "currency", currency, "receipt", receipt))
                    .retrieve()
                    .body(Map.class);
            return response != null ? (String) response.get("id") : null;
        } catch (Exception ex) {
            return null;
        }
    }

    private boolean verifyRazorpaySignature(String data, String signature, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] computed = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String computedHex = HexFormat.of().formatHex(computed);
            return computedHex.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
