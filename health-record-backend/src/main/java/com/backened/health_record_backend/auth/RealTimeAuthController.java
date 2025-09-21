package com.backened.health_record_backend.auth;

import com.backened.health_record_backend.users.User;
import com.backened.health_record_backend.users.UserService;
import com.backened.health_record_backend.users.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/auth")
public class RealTimeAuthController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public RealTimeAuthController(UserService userService, UserRepository userRepository, EmailService emailService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // ONE SMART ENDPOINT - Handles All 3 User Types
    @PostMapping("/smart-login")
    public Map<String, Object> smartLogin(@RequestBody Map<String, String> request) {
        String role = request.get("role");
        String identifier = request.get("identifier");
        String otp = request.get("otp");
        String password = request.get("password");
        String name = request.get("name");
        String region = request.get("region");
        String mobile = request.get("mobile");

        try {
            switch (role) {
                case "worker":
                    return handleWorkerAuth(identifier, otp, name, region);
                case "doctor":
                    return handleDoctorAuth(identifier, otp, password, name, region, mobile);
                case "official":
                    return handleOfficialAuth(identifier, otp, password, name, region, mobile);
                default:
                    return Map.of("success", false, "error", "Invalid role");
            }
        } catch (Exception e) {
            return Map.of("success", false, "error", "Authentication failed: " + e.getMessage());
        }
    }

    // === WORKER: Mobile + SMS OTP (Mock) ===
    private Map<String, Object> handleWorkerAuth(String mobile, String otp, String name, String region) {
        User existingWorker = userRepository.findByMobile(mobile).orElse(null);

        // Step 1: No OTP - Send SMS OTP (Mock)
        if (otp == null || otp.trim().isEmpty()) {
            if (mobile == null || mobile.length() != 10) {
                return Map.of("success", false, "error", "Invalid mobile number");
            }

            return Map.of(
                    "success", true,
                    "step", "otp_sent",
                    "message", "OTP sent to " + mobile,
                    "mobile", mobile,
                    "mockOTP", "123456", // For demo
                    "userExists", existingWorker != null
            );
        }

        // Step 2: Verify OTP (Mock)
        if (!"123456".equals(otp)) {
            return Map.of("success", false, "step", "otp_failed", "error", "Invalid OTP. Use 123456 for demo");
        }

        // Step 3: Existing worker - Login
        if (existingWorker != null) {
            return Map.of(
                    "success", true,
                    "step", "login_success",
                    "token", "demo-token-" + existingWorker.getAbhaNumber(),
                    "role", "worker",
                    "user", existingWorker
            );
        }

        // Step 4: New worker - Need details
        if (name == null || region == null) {
            return Map.of(
                    "success", true, // CHANGED TO TRUE
                    "step", "need_details",
                    "message", "OTP verified successfully! Please provide your details",
                    "required", new String[]{"name", "region"}
            );
        }

        // Step 5: Create new worker
        return createNewWorker(mobile, name, region);
    }

    // === DOCTOR: Email + Real Email OTP ===
    private Map<String, Object> handleDoctorAuth(String email, String otp, String password, String name, String region, String mobile) {
        User existingDoctor = userRepository.findByUsername(email).orElse(null);

        // Step 1: No OTP - Send Real Email OTP
        if (otp == null || otp.trim().isEmpty()) {
            if (email == null || !email.contains("@")) {
                return Map.of("success", false, "error", "Invalid email address");
            }

            boolean emailSent = emailService.sendVerificationOTP(email, "doctor");
            if (!emailSent) {
                return Map.of("success", false, "error", "Failed to send verification email");
            }

            return Map.of(
                    "success", true,
                    "step", "email_otp_sent",
                    "message", "Verification code sent to " + email,
                    "email", email,
                    "userExists", existingDoctor != null
            );
        }

        // Step 2: Verify Real Email OTP
        if (!emailService.verifyOTP(email, otp)) {
            return Map.of("success", false, "step", "otp_failed", "error", "Invalid or expired OTP");
        }

        // Step 3: Existing doctor - Login (after email verification)
        if (existingDoctor != null) {
            return Map.of(
                    "success", true,
                    "step", "login_success",
                    "token", "demo-token-" + existingDoctor.getUsername(),
                    "role", "doctor",
                    "user", existingDoctor,
                    "message", "Email verified! Welcome back Dr. " + existingDoctor.getName()
            );
        }

        // Step 4: New doctor - Need details (UPDATED - NOW SUCCESS TRUE)
        if (name == null || region == null || mobile == null) {
            return Map.of(
                    "success", true, // CHANGED FROM false TO true
                    "step", "need_details",
                    "message", "Email verified successfully! Please complete your profile",
                    "required", new String[]{"name", "region", "mobile"},
                    "email", email
            );
        }

        // Step 5: Create new doctor
        return createNewDoctor(email, name, region, mobile);
    }

    // === HEALTH OFFICIAL: Email + Real Email OTP ===
    private Map<String, Object> handleOfficialAuth(String email, String otp, String password, String name, String region, String mobile) {
        User existingOfficial = userRepository.findByUsername(email).orElse(null);

        // Step 1: No OTP - Send Real Email OTP
        if (otp == null || otp.trim().isEmpty()) {
            if (email == null || !email.contains("@")) {
                return Map.of("success", false, "error", "Invalid email address");
            }

            boolean emailSent = emailService.sendVerificationOTP(email, "official");
            if (!emailSent) {
                return Map.of("success", false, "error", "Failed to send verification email");
            }

            return Map.of(
                    "success", true,
                    "step", "email_otp_sent",
                    "message", "Verification code sent to " + email,
                    "email", email,
                    "userExists", existingOfficial != null
            );
        }

        // Step 2: Verify Real Email OTP
        if (!emailService.verifyOTP(email, otp)) {
            return Map.of("success", false, "step", "otp_failed", "error", "Invalid or expired OTP");
        }

        // Step 3: Existing official - Login
        if (existingOfficial != null) {
            return Map.of(
                    "success", true,
                    "step", "login_success",
                    "token", "demo-token-" + existingOfficial.getUsername(),
                    "role", "official",
                    "user", existingOfficial,
                    "message", "Email verified! Welcome back " + existingOfficial.getName()
            );
        }

        // Step 4: New official - Need details (UPDATED - NOW SUCCESS TRUE)
        if (name == null || region == null || mobile == null) {
            return Map.of(
                    "success", true, // CHANGED FROM false TO true
                    "step", "need_details",
                    "message", "Email verified successfully! Please complete your profile",
                    "required", new String[]{"name", "region", "mobile"},
                    "email", email
            );
        }

        // Step 5: Create new official
        return createNewOfficial(email, name, region, mobile);
    }

    // === HELPER METHODS ===
    private Map<String, Object> createNewWorker(String mobile, String name, String region) {
        try {
            String abhaId = "ABHA" + String.format("%08d", new Random().nextInt(99999999));

            User newWorker = User.builder()
                    .username(mobile)
                    .name(name)
                    .mobile(mobile)
                    .region(region)
                    .role("WORKER")
                    .abhaNumber(abhaId)
                    .abhaAddress(abhaId + "@abdm.gov.in")
                    .build();

            newWorker = userRepository.save(newWorker);

            return Map.of(
                    "success", true,
                    "step", "registration_success",
                    "token", "demo-token-" + abhaId,
                    "role", "worker",
                    "user", newWorker,
                    "message", "Welcome! Your ABHA ID: " + abhaId
            );
        } catch (Exception e) {
            return Map.of("success", false, "error", "Worker registration failed");
        }
    }

    private Map<String, Object> createNewDoctor(String email, String name, String region, String mobile) {
        try {
            String hprId = "HPR" + String.format("%06d", new Random().nextInt(999999));

            User newDoctor = User.builder()
                    .username(email)
                    .name("Dr. " + name)
                    .mobile(mobile)
                    .region(region)
                    .role("DOCTOR")
                    .abhaNumber(hprId) // Using as HPR ID
                    .abhaAddress(email)
                    .build();

            newDoctor = userRepository.save(newDoctor);

            return Map.of(
                    "success", true,
                    "step", "registration_success",
                    "token", "demo-token-" + email,
                    "role", "doctor",
                    "user", newDoctor,
                    "message", "Welcome Dr. " + name + "! Your HPR ID: " + hprId
            );
        } catch (Exception e) {
            return Map.of("success", false, "error", "Doctor registration failed");
        }
    }

    private Map<String, Object> createNewOfficial(String email, String name, String region, String mobile) {
        try {
            String facilityId = "FAC" + String.format("%06d", new Random().nextInt(999999));

            User newOfficial = User.builder()
                    .username(email)
                    .name(name)
                    .mobile(mobile)
                    .region(region)
                    .role("OFFICIAL")
                    .abhaNumber(facilityId) // Using as Facility ID
                    .abhaAddress(email)
                    .build();

            newOfficial = userRepository.save(newOfficial);

            return Map.of(
                    "success", true,
                    "step", "registration_success",
                    "token", "demo-token-" + email,
                    "role", "official",
                    "user", newOfficial,
                    "message", "Welcome " + name + "! Your Facility ID: " + facilityId
            );
        } catch (Exception e) {
            return Map.of("success", false, "error", "Official registration failed");
        }
    }
}
