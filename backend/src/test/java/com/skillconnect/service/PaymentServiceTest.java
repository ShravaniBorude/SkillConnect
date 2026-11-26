package com.skillconnect.service;

import com.skillconnect.dto.payment.VerifyPaymentRequest;
import com.skillconnect.entity.Contract;
import com.skillconnect.entity.Payment;
import com.skillconnect.entity.User;
import com.skillconnect.entity.enums.PaymentStatus;
import com.skillconnect.exception.BadRequestException;
import com.skillconnect.repository.*;
import com.skillconnect.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private ContractRepository contractRepository;
    @Mock private MilestoneRepository milestoneRepository;
    @Mock private FreelancerProfileRepository freelancerProfileRepository;
    @Mock private ClientProfileRepository clientProfileRepository;
    @Mock private NotificationService notificationService;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentRepository,
                transactionRepository,
                contractRepository,
                milestoneRepository,
                freelancerProfileRepository,
                clientProfileRepository,
                notificationService,
                RestClient.builder()
        );
        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "test_secret_key");
        ReflectionTestUtils.setField(paymentService, "platformFeePercent", 10.0);

        User client = new User();
        client.setId(1L);
        client.setEmail("client@example.com");
        client.setFullName("Client User");
        CustomUserDetails details = mock(CustomUserDetails.class);
        when(details.getId()).thenReturn(1L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null)
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void verifyAndCapturePayment_InvalidSignature_ThrowsBadRequest() {
        Payment payment = new Payment();
        payment.setId(10L);
        payment.setRazorpayOrderId("order_123");
        payment.setStatus(PaymentStatus.CREATED);
        User payer = new User();
        payer.setId(1L);
        payment.setPayer(payer);

        when(paymentRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));

        VerifyPaymentRequest req = new VerifyPaymentRequest(10L, "order_123", "pay_456", "wrong_sig");

        assertThrows(BadRequestException.class, () -> paymentService.verifyAndCapturePayment(req));
        verify(paymentRepository, atLeastOnce()).save(payment);
    }

    @Test
    void verifyAndCapturePayment_ValidHmacSignature_CapturesPayment() throws Exception {
        User payer = new User();
        payer.setId(1L);
        payer.setFullName("Client");
        User payee = new User();
        payee.setId(2L);
        payee.setFullName("Freelancer");

        Contract contract = new Contract();
        contract.setId(99L);

        Payment payment = new Payment();
        payment.setId(10L);
        payment.setContract(contract);
        payment.setPayer(payer);
        payment.setPayee(payee);
        payment.setAmount(new BigDecimal("1000.00"));
        payment.setPlatformFee(new BigDecimal("100.00"));
        payment.setNetAmount(new BigDecimal("900.00"));
        payment.setCurrency("INR");
        payment.setRazorpayOrderId("order_123");
        payment.setStatus(PaymentStatus.CREATED);

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("test_secret_key".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String validSig = HexFormat.of().formatHex(mac.doFinal("order_123|pay_456".getBytes(StandardCharsets.UTF_8)));

        when(paymentRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(freelancerProfileRepository.findByUserId(2L)).thenReturn(Optional.empty());
        when(clientProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        var result = paymentService.verifyAndCapturePayment(new VerifyPaymentRequest(10L, "order_123", "pay_456", validSig));

        assertEquals("CAPTURED", result.status());
        assertEquals("pay_456", result.razorpayPaymentId());
        verify(transactionRepository, times(1)).save(any());
    }
}
