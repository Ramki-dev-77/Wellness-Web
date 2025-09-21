package com.backened.health_record_backend.auth;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final ConcurrentHashMap<String, OTPData> otpStorage = new ConcurrentHashMap<>();

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendVerificationOTP(String email, String role) {
        try {
            // Generate 6-digit OTP
            String otp = String.format("%06d", new Random().nextInt(999999));

            // Store OTP with timestamp
            otpStorage.put(email, new OTPData(otp, LocalDateTime.now()));

            // Create professional email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Health Records System - Verification Code");

            String emailBody = "";
            if ("doctor".equals(role)) {
                emailBody = "Dear Doctor,\n\n" +
                        "Welcome to the Health Records System!\n\n" +
                        "Your email verification code is: " + otp + "\n\n" +
                        "This code will expire in 10 minutes.\n\n" +
                        "If you didn't request this verification, please ignore this email.\n\n" +
                        "Best regards,\nHealth Records Team";
            } else if ("official".equals(role)) {
                emailBody = "Dear Health Official,\n\n" +
                        "Welcome to the Health Records System!\n\n" +
                        "Your email verification code is: " + otp + "\n\n" +
                        "This code will expire in 10 minutes.\n\n" +
                        "If you didn't request this verification, please ignore this email.\n\n" +
                        "Best regards,\nHealth Records Team";
            }

            message.setText(emailBody);

            // Send email
            mailSender.send(message);

            System.out.println("Email sent to: " + email + " with OTP: " + otp); // For demo logs
            return true;

        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            return false;
        }
    }

    public boolean verifyOTP(String email, String otp) {
        OTPData otpData = otpStorage.get(email);

        if (otpData == null) {
            return false; // No OTP found
        }

        // Check if OTP expired (10 minutes)
        if (ChronoUnit.MINUTES.between(otpData.timestamp, LocalDateTime.now()) > 10) {
            otpStorage.remove(email);
            return false; // Expired
        }

        // Check if OTP matches
        if (otpData.otp.equals(otp)) {
            otpStorage.remove(email); // Remove after successful verification
            return true;
        }

        return false; // Wrong OTP
    }

    // Inner class to store OTP with timestamp
    private static class OTPData {
        String otp;
        LocalDateTime timestamp;

        OTPData(String otp, LocalDateTime timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
    }
}
