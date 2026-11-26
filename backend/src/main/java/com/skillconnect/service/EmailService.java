package com.skillconnect.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:no-reply@skillconnect.local}")
    private String mailFrom;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String to, String fullName, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String subject = "Verify your SkillConnect account";
        String body = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
                  <h2 style="color:#108a3d;">Welcome to SkillConnect, %s!</h2>
                  <p>Please verify your email address to activate your account and start collaborating.</p>
                  <p style="margin:24px 0;">
                    <a href="%s" style="background:#108a3d;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Verify Email Address</a>
                  </p>
                  <p style="color:#64748b;font-size:13px;">Or paste this link in your browser:<br/>%s</p>
                </div>
                """.formatted(fullName, link, link);
        sendEmail(to, subject, body, "Verification link for " + to + ": " + link);
    }

    @Async
    public void sendPasswordResetEmail(String to, String fullName, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String subject = "Reset your SkillConnect password";
        String body = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
                  <h2 style="color:#0f172a;">Password Reset Request</h2>
                  <p>Hi %s, we received a request to reset your SkillConnect password. This link expires in 30 minutes.</p>
                  <p style="margin:24px 0;">
                    <a href="%s" style="background:#108a3d;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
                  </p>
                  <p style="color:#64748b;font-size:13px;">If you did not request this, you can safely ignore this email.</p>
                </div>
                """.formatted(fullName, link);
        sendEmail(to, subject, body, "Password reset link for " + to + ": " + link);
    }

    @Async
    public void sendNotificationEmail(String to, String subject, String messageText) {
        String body = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
                  <h3 style="color:#108a3d;">SkillConnect Notification</h3>
                  <p>%s</p>
                  <p><a href="%s" style="color:#108a3d;">Open SkillConnect</a></p>
                </div>
                """.formatted(messageText, frontendUrl);
        sendEmail(to, subject, body, "Notification for " + to + " [" + subject + "]: " + messageText);
    }

    private void sendEmail(String to, String subject, String htmlBody, String devLogFallback) {
        if (mailSender == null || mailHost == null || mailHost.isBlank()) {
            log.info("[DEV EMAIL] {}", devLogFallback);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
