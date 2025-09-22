package com.backened.health_record_backend.auth;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final ConcurrentHashMap<String, OTPData> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendVerificationOTP(String email, String role) {
        if (email == null || email.trim().isEmpty()) {
            System.err.println("Email is null or empty");
            return false;
        }
        
        try {
            // Generate 6-digit OTP (100000 to 999999)
            String otp = String.format("%06d", 100000 + random.nextInt(900000));

            // Store OTP with timestamp
            otpStorage.put(email, new OTPData(otp, LocalDateTime.now()));

            // Create professional email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Health Records System - Verification Code");

            String emailBody = buildEmailBody(role, otp);
            if (emailBody.isEmpty()) {
                System.err.println("Invalid role provided: " + role);
                return false;
            }

            message.setText(emailBody);

            // Send email
            mailSender.send(message);

            System.out.println("Email sent to: " + email + " with OTP: " + otp); // For demo logs
            return true;

        } catch (Exception e) {
            System.err.println("Failed to send email to " + email + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private String buildEmailBody(String role, String otp) {
        if ("doctor".equals(role)) {
            return "Dear Doctor,\n\n" +
                    "Welcome to the Health Records System!\n\n" +
                    "Your email verification code is: " + otp + "\n\n" +
                    "This code will expire in 10 minutes.\n\n" +
                    "If you didn't request this verification, please ignore this email.\n\n" +
                    "Best regards,\nHealth Records Team";
        } else if ("official".equals(role)) {
            return "Dear Health Official,\n\n" +
                    "Welcome to the Health Records System!\n\n" +
                    "Your email verification code is: " + otp + "\n\n" +
                    "This code will expire in 10 minutes.\n\n" +
                    "If you didn't request this verification, please ignore this email.\n\n" +
                    "Best regards,\nHealth Records Team";
        }
        return "";
    }

    public boolean verifyOTP(String email, String otp) {
        if (email == null || otp == null || email.trim().isEmpty() || otp.trim().isEmpty()) {
            return false;
        }

        OTPData otpData = otpStorage.get(email);

        if (otpData == null) {
            System.out.println("No OTP found for email: " + email);
            return false; // No OTP found
        }

        // Check if OTP expired (10 minutes)
        long minutesElapsed = ChronoUnit.MINUTES.between(otpData.timestamp, LocalDateTime.now());
        if (minutesElapsed > 10) {
            otpStorage.remove(email);
            System.out.println("OTP expired for email: " + email + " (elapsed: " + minutesElapsed + " minutes)");
            return false; // Expired
        }

        // Check if OTP matches
        if (otpData.otp.equals(otp.trim())) {
            otpStorage.remove(email); // Remove after successful verification
            System.out.println("OTP verified successfully for email: " + email);
            return true;
        }

        System.out.println("Invalid OTP for email: " + email);
        return false; // Wrong OTP
    }

    // Clean up expired OTPs periodically
    public void cleanupExpiredOTPs() {
        LocalDateTime now = LocalDateTime.now();
        otpStorage.entrySet().removeIf(entry -> 
            ChronoUnit.MINUTES.between(entry.getValue().timestamp, now) > 10
        );
    }

    // Inner class to store OTP with timestamp
    private static class OTPData {
        final String otp;
        final LocalDateTime timestamp;

        OTPData(String otp, LocalDateTime timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
    }
}
