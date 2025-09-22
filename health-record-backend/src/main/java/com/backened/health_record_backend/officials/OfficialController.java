package com.backened.health_record_backend.officials;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping; // ADD THIS IMPORT
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backened.health_record_backend.auth.EmailService;
import com.backened.health_record_backend.users.User;
import com.backened.health_record_backend.users.UserRepository;
import com.backened.health_record_backend.users.UserService;

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
            // FIXED: Use findByEmail instead of findByMobile
            User official = userService.findByEmail(email);
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

            // FIXED: Use findByEmail instead of findByMobile
            User official = userService.findByEmail(email);
            if (official == null) {
                return Map.of("success", false, "error", "Official not found");
            }

            return Map.of(
                    "token", "demo-token-" + official.getUsername(),
                    "user", official,
                    "role", official.getRole(),
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

    // SEARCH ENDPOINTS FOR MIGRANTS AND DOCTORS
    @GetMapping("/search/migrant/{abhaNumber}")
    public Map<String, Object> searchMigrantByAbha(@RequestHeader("Authorization") String authHeader,
                                                   @PathVariable String abhaNumber) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String officialUsername = token.replace("demo-token-", "");

            // Verify official authentication
            User official = userService.findByUsernameAndRole(officialUsername, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(officialUsername, "HEALTH_OFFICER");
            }

            if (official == null) {
                return Map.of("success", false, "error", "Invalid official authentication");
            }

            // Debug: Log the search attempt
            System.out.println("Searching for migrant with ABHA: " + abhaNumber);

            // Search for migrant by ABHA number
            Optional<User> migrantOpt = userRepository.findByAbhaNumber(abhaNumber);
            User migrant = migrantOpt.orElse(null);
            
            // Debug: Log the result
            System.out.println("Search result: " + (migrant != null ? migrant.getName() : "Not found"));
            
            if (migrant == null) {
                return Map.of(
                        "success", false,
                        "error", "No migrant found with ABHA number: " + abhaNumber
                );
            }

            // Check if the user is actually a migrant worker
            if (!"WORKER".equals(migrant.getRole()) && !"MIGRANT".equals(migrant.getRole())) {
                return Map.of(
                        "success", false,
                        "error", "User found but is not a migrant worker. Role: " + migrant.getRole()
                );
            }

            return Map.of(
                    "success", true,
                    "migrant", migrant,
                    "searchedBy", official.getName()
            );

        } catch (Exception e) {
            System.err.println("Error searching migrant: " + e.getMessage());
            e.printStackTrace();
            return Map.of("success", false, "error", "Failed to search migrant: " + e.getMessage());
        }
    }

    @GetMapping("/search/doctor/{healthPid}")
    public Map<String, Object> searchDoctorByHealthPid(@RequestHeader("Authorization") String authHeader,
                                                       @PathVariable String healthPid) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String officialUsername = token.replace("demo-token-", "");

            // Verify official authentication
            User official = userService.findByUsernameAndRole(officialUsername, "OFFICIAL");
            if (official == null) {
                official = userService.findByUsernameAndRole(officialUsername, "HEALTH_OFFICER");
            }

            if (official == null) {
                return Map.of("success", false, "error", "Invalid official authentication");
            }

            // Debug: Log the search attempt
            System.out.println("Searching for doctor with Health PID: " + healthPid);

            // Search for doctor by Health Professional ID
            Optional<User> doctorOpt = userRepository.findByHealthPid(healthPid);
            User doctor = doctorOpt.orElse(null);
            
            // Debug: Log the result
            System.out.println("Search result: " + (doctor != null ? doctor.getName() : "Not found"));
            
            if (doctor == null) {
                return Map.of(
                        "success", false,
                        "error", "No doctor found with Health Professional ID: " + healthPid
                );
            }

            // Check if the user is actually a doctor
            if (!"DOCTOR".equals(doctor.getRole())) {
                return Map.of(
                        "success", false,
                        "error", "User found but is not a doctor. Role: " + doctor.getRole()
                );
            }

            return Map.of(
                    "success", true,
                    "doctor", doctor,
                    "searchedBy", official.getName()
            );

        } catch (Exception e) {
            System.err.println("Error searching doctor: " + e.getMessage());
            e.printStackTrace();
            return Map.of("success", false, "error", "Failed to search doctor: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public String test() {
        return "Official controller is working!";
    }

    // Simple test search without authentication for debugging
    @GetMapping("/test/simple-search")
    public Map<String, Object> simpleSearch() {
        try {
            // Test direct repository calls
            List<User> allUsers = userRepository.findAll();
            Optional<User> testMigrant = userRepository.findByAbhaNumber("ABHA14001234567890");
            Optional<User> testDoctor = userRepository.findByHealthPid("HLP1");
            
            return Map.of(
                "success", true,
                "total_users", allUsers.size(),
                "migrant_search", testMigrant.isPresent() ? testMigrant.get() : "Not found",
                "doctor_search", testDoctor.isPresent() ? testDoctor.get() : "Not found"
            );
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    // Test endpoint to verify database data and search functionality
    @GetMapping("/test/search")
    public Map<String, Object> testSearch() {
        try {
            // Get all users to debug
            List<User> allUsers = userRepository.findAll();
            
            // Test finding a migrant worker
            Optional<User> migrant = userRepository.findByAbhaNumber("ABHA14001234567890");
            
            // Test finding a doctor
            Optional<User> doctor = userRepository.findByHealthPid("HLP1");
            
            // Get counts by role
            long workerCount = userRepository.countByRole("WORKER");
            long doctorCount = userRepository.countByRole("DOCTOR");
            
            // Debug info about all users
            Map<String, Object> userDebugInfo = Map.of(
                "total_users", allUsers.size(),
                "worker_count", workerCount,
                "doctor_count", doctorCount,
                "sample_users", allUsers.stream().limit(5).map(user -> Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "role", user.getRole(),
                    "abha_number", user.getAbhaNumber() != null ? user.getAbhaNumber() : "null",
                    "health_pid", user.getHealthPid() != null ? user.getHealthPid() : "null"
                )).toList()
            );
            
            return Map.of(
                "success", true,
                "migrant_test", Map.of(
                    "searching_for", "ABHA14001234567890",
                    "found", migrant.isPresent(),
                    "result", migrant.isPresent() ? migrant.get().getName() : "Not found"
                ),
                "doctor_test", Map.of(
                    "searching_for", "HLP1", 
                    "found", doctor.isPresent(),
                    "result", doctor.isPresent() ? doctor.get().getName() : "Not found"
                ),
                "database_info", userDebugInfo
            );
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage(), "stack_trace", e.getStackTrace());
        }
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
