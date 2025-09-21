package com.backened.health_record_backend.officials;

import com.backened.health_record_backend.users.User;
import com.backened.health_record_backend.users.UserService;
import com.backened.health_record_backend.users.UserRepository;
import com.backened.health_record_backend.auth.EmailService; // ADD THIS IMPORT
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/official")
public class OfficialController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService; // ADD THIS FIELD

    // UPDATED CONSTRUCTOR - ADD EmailService
    public OfficialController(UserService userService, UserRepository userRepository,
                              NotificationRepository notificationRepository,
                              EmailService emailService) { // ADD THIS PARAMETER
        this.userService = userService;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService; // ADD THIS LINE
    }

    // EMAIL-BASED AUTHENTICATION ENDPOINTS
    @PostMapping("/email-input")
    public Map<String, Object> sendEmailVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return Map.of("success", false, "error", "Email is required");
        }

        try {
            // FIXED: Check for both OFFICIAL and HEALTH_OFFICER roles
            User official = userService.findByMobile(email);
            if (official == null || (!("OFFICIAL".equals(official.getRole())) && !("HEALTH_OFFICER".equals(official.getRole())))) {
                return Map.of("success", false, "error", "Health Official not found with this email");
            }

            boolean emailSent = emailService.sendVerificationOTP(email, "official");

            return Map.of(
                    "success", emailSent,
                    "message", emailSent ? "Verification code sent to your email" : "Failed to send verification email",
                    "email", email
            );
        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to process email: " + e.getMessage());
        }
    }

    @PostMapping("/email-verify")
    public Map<String, Object> verifyEmailAndLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null) {
            return Map.of("success", false, "error", "Email and verification code are required");
        }

        try {
            // Verify OTP
            if (!emailService.verifyOTP(email, code)) {
                return Map.of("success", false, "error", "Invalid or expired verification code");
            }

            // Get official by email
            User official = userService.findByMobile(email);
            if (official == null) {
                return Map.of("success", false, "error", "Official not found");
            }

            return Map.of(
                    "token", "demo-token-" + official.getUsername(),
                    "user", official,
                    "role", official.getRole(), // FIXED: Use actual role from user
                    "success", true
            );
        } catch (Exception e) {
            return Map.of("success", false, "error", "Login failed: " + e.getMessage());
        }
    }

    // USERNAME/PASSWORD AUTHENTICATION (EXISTING)
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        try {
            // FIXED: Check for both OFFICIAL and HEALTH_OFFICER roles
            User official = userService.findByUsernameAndRole(username, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(username, "HEALTH_OFFICER");
            }

            if (official == null) {
                return Map.of("success", false, "error", "Health official not found");
            }

            return Map.of(
                    "token", "demo-token-" + username,
                    "user", official,
                    "role", official.getRole(),
                    "success", true
            );
        } catch (RuntimeException e) {
            return Map.of("success", false, "error", "Invalid credentials");
        }
    }

    @GetMapping("/me")
    public User fetchProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = token.replace("demo-token-", "");

        // FIXED: Try both role types
        User official = userService.findByUsernameAndRole(username, "OFFICIAL");
        if (official == null) {
            official = userService.findByUsernameAndRole(username, "HEALTH_OFFICER");
        }

        return official;
    }

    // REGION-BASED WORKER MANAGEMENT
    @GetMapping("/workers/region/{region}")
    public Map<String, Object> getWorkersByRegion(@RequestHeader("Authorization") String authHeader,
                                                  @PathVariable String region) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String officialUsername = token.replace("demo-token-", "");

            // FIXED: Try both role types
            User official = userService.findByUsernameAndRole(officialUsername, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(officialUsername, "HEALTH_OFFICER");
            }

            if (official == null) {
                return Map.of("success", false, "error", "Invalid official authentication");
            }

            List<User> workers = userRepository.findByRoleAndRegion("WORKER", region);

            return Map.of(
                    "success", true,
                    "region", region,
                    "totalWorkers", workers.size(),
                    "workers", workers.stream().map(worker -> Map.of(
                            "name", worker.getName(),
                            "abha", worker.getAbhaNumber(),
                            "mobile", worker.getMobile(),
                            "fhirPatientId", worker.getFhirPatientId()
                    )).toList()
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to fetch workers: " + e.getMessage());
        }
    }

    // NOTIFICATION MANAGEMENT
    @PostMapping("/notifications")
    public Map<String, Object> createNotification(@RequestHeader("Authorization") String authHeader,
                                                  @RequestBody Map<String, String> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String officialUsername = token.replace("demo-token-", "");

            // FIXED: Try both role types
            User official = userService.findByUsernameAndRole(officialUsername, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(officialUsername, "HEALTH_OFFICER");
            }

            if (official == null) {
                return Map.of("success", false, "error", "Invalid official authentication");
            }

            String title = request.get("title");
            String message = request.get("message");
            String region = request.get("region");
            String type = request.getOrDefault("type", "health_camp");

            if (title == null || title.trim().isEmpty()) {
                return Map.of("success", false, "error", "Title is required");
            }

            if (message == null || message.trim().isEmpty()) {
                return Map.of("success", false, "error", "Message is required");
            }

            Notification notification = Notification.builder()
                    .title(title)
                    .message(message)
                    .region(region)
                    .type(type)
                    .createdBy(officialUsername)
                    .build();

            notification = notificationRepository.save(notification);

            // Count affected workers
            long affectedWorkers;
            if (region != null) {
                affectedWorkers = userRepository.countByRoleAndRegion("WORKER", region);
            } else {
                affectedWorkers = userRepository.countByRole("WORKER");
            }

            return Map.of(
                    "success", true,
                    "message", "Notification created successfully",
                    "notification", Map.of(
                            "id", notification.getId(),
                            "title", notification.getTitle(),
                            "region", region != null ? region : "All Regions",
                            "affectedWorkers", affectedWorkers
                    ),
                    "postedBy", official.getName(),
                    "postedAt", notification.getCreatedAt()
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to create notification: " + e.getMessage());
        }
    }

    @GetMapping("/notifications")
    public Map<String, Object> getMyNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String officialUsername = token.replace("demo-token-", "");

            // FIXED: Try both role types
            User official = userService.findByUsernameAndRole(officialUsername, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(officialUsername, "HEALTH_OFFICER");
            }

            if (official == null) {
                return Map.of("success", false, "error", "Invalid official authentication");
            }

            List<Notification> notifications = notificationRepository
                    .findByCreatedByOrderByCreatedAtDesc(officialUsername);

            return Map.of(
                    "success", true,
                    "official", official.getName(),
                    "totalNotifications", notifications.size(),
                    "notifications", notifications
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to fetch notifications: " + e.getMessage());
        }
    }

    @PutMapping("/notifications/{id}")
    public Map<String, Object> updateNotification(@RequestHeader("Authorization") String authHeader,
                                                  @PathVariable Long id,
                                                  @RequestBody Map<String, String> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String officialUsername = token.replace("demo-token-", "");

            // FIXED: Try both role types
            User official = userService.findByUsernameAndRole(officialUsername, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(officialUsername, "HEALTH_OFFICER");
            }

            if (official == null) {
                return Map.of("success", false, "error", "Invalid official authentication");
            }

            Notification notification = notificationRepository.findById(id).orElse(null);
            if (notification == null) {
                return Map.of("success", false, "error", "Notification not found");
            }

            // Security check - only creator can edit
            if (!notification.getCreatedBy().equals(officialUsername)) {
                return Map.of("success", false, "error", "You can only edit your own notifications");
            }

            // Update fields if provided
            if (request.containsKey("title") && !request.get("title").trim().isEmpty()) {
                notification.setTitle(request.get("title"));
            }
            if (request.containsKey("message") && !request.get("message").trim().isEmpty()) {
                notification.setMessage(request.get("message"));
            }
            if (request.containsKey("region")) {
                notification.setRegion(request.get("region"));
            }
            if (request.containsKey("type")) {
                notification.setType(request.get("type"));
            }

            notification = notificationRepository.save(notification);

            // Count affected workers after update
            long affectedWorkers;
            if (notification.getRegion() != null) {
                affectedWorkers = userRepository.countByRoleAndRegion("WORKER", notification.getRegion());
            } else {
                affectedWorkers = userRepository.countByRole("WORKER");
            }

            return Map.of(
                    "success", true,
                    "message", "Notification updated successfully",
                    "notification", Map.of(
                            "id", notification.getId(),
                            "title", notification.getTitle(),
                            "message", notification.getMessage(),
                            "region", notification.getRegion() != null ? notification.getRegion() : "All Regions",
                            "type", notification.getType(),
                            "affectedWorkers", affectedWorkers,
                            "lastUpdated", notification.getCreatedAt()
                    ),
                    "updatedBy", official.getName()
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to update notification: " + e.getMessage());
        }
    }

    @DeleteMapping("/notifications/{id}")
    public Map<String, Object> deleteNotification(@RequestHeader("Authorization") String authHeader,
                                                  @PathVariable Long id) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String officialUsername = token.replace("demo-token-", "");

            // FIXED: Try both role types
            User official = userService.findByUsernameAndRole(officialUsername, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(officialUsername, "HEALTH_OFFICER");
            }

            if (official == null) {
                return Map.of("success", false, "error", "Invalid official authentication");
            }

            Notification notification = notificationRepository.findById(id).orElse(null);
            if (notification == null) {
                return Map.of("success", false, "error", "Notification not found");
            }

            // Security check - only creator can delete
            if (!notification.getCreatedBy().equals(officialUsername)) {
                return Map.of("success", false, "error", "You can only delete your own notifications");
            }

            // Soft delete - mark as inactive
            notification.setActive(false);
            notificationRepository.save(notification);

            return Map.of(
                    "success", true,
                    "message", "Notification deleted successfully",
                    "deletedNotification", Map.of(
                            "id", notification.getId(),
                            "title", notification.getTitle(),
                            "region", notification.getRegion() != null ? notification.getRegion() : "All Regions"
                    ),
                    "deletedBy", official.getName()
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to delete notification: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public String test() {
        return "Official controller is working!";
    }
    @PostMapping("/logout")
    public Map<String, Object> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = token.replace("demo-token-", "");

            User official = userService.findByUsernameAndRole(username, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(username, "HEALTH_OFFICER");
            }

            return Map.of(
                    "success", true,
                    "message", "Health Officer logged out successfully",
                    "official", official != null ? official.getName() : "Unknown"
            );
        } catch (Exception e) {
            return Map.of(
                    "success", true,
                    "message", "Logged out"
            );
        }
    }

}
