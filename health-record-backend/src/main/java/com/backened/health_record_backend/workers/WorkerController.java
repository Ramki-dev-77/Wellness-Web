package com.backened.health_record_backend.workers;

import com.backened.health_record_backend.users.User;
import com.backened.health_record_backend.users.UserService;
import com.backened.health_record_backend.fhirmock.FhirService;
import com.backened.health_record_backend.Qr.QrService;
import com.backened.health_record_backend.officials.Notification;
import com.backened.health_record_backend.officials.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workers")
@CrossOrigin(origins = "http://localhost:3000") // Enable CORS for React frontend
public class WorkerController {

    @Autowired
    private final UserService userService;

    @Autowired
    private final FhirService fhirService;

    @Autowired
    private final QrService qrService;

    @Autowired
    private final NotificationRepository notificationRepository;

    // Constructor injection
    public WorkerController(UserService userService, FhirService fhirService, QrService qrService,
                            NotificationRepository notificationRepository) {
        this.userService = userService;
        this.fhirService = fhirService;
        this.qrService = qrService;
        this.notificationRepository = notificationRepository;
    }

    // ==================== AUTHENTICATION ====================

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            // FIXED: Accept both 'abha' and 'abhaNumber' parameters from frontend
            String abhaNumber = request.get("abhaNumber");  // Primary parameter from frontend
            String abha = request.get("abha");              // Fallback parameter
            String otp = request.get("otp");

            // Use whichever parameter was provided
            String workerAbha = abhaNumber != null ? abhaNumber : abha;

            System.out.println("=== WORKER LOGIN REQUEST ===");
            System.out.println("ABHA: " + workerAbha);
            System.out.println("OTP: " + otp);
            System.out.println("============================");

            // Validate input parameters
            if (workerAbha == null || workerAbha.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "ABHA number is required"
                ));
            }

            if (otp == null || otp.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "OTP is required"
                ));
            }

            // Mock OTP validation (always accept 123456 for demo)
            if (!"123456".equals(otp)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid OTP. Use 123456 for demo."
                ));
            }

            // Find worker by ABHA number
            User worker = userService.getByAbhaNumber(workerAbha);

            if (worker == null) {
                System.err.println("ERROR: Worker not found with ABHA: " + workerAbha);
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Worker not found with ABHA: " + workerAbha + ". Please check your ABHA number."
                ));
            }

            System.out.println("Found worker: " + worker.getName() + ", Role: " + worker.getRole());

            // Check if user role is WORKER
            if (worker.getRole() == null || !"WORKER".equals(worker.getRole().toUpperCase())) {
                System.err.println("ERROR: Invalid role for user. Expected: WORKER, Found: " + worker.getRole());
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid worker credentials. User role: " + worker.getRole()
                ));
            }

            System.out.println("✅ Worker login successful: " + worker.getName());

            // Return successful login response
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", "demo-token-" + workerAbha,
                    "user", Map.of(
                            "id", worker.getId(),
                            "name", worker.getName(),
                            "username", worker.getUsername(),
                            "abhaNumber", worker.getAbhaNumber(),
                            "mobile", worker.getMobile(),
                            "region", worker.getRegion(),
                            "role", worker.getRole(),
                            "fhirPatientId", worker.getFhirPatientId()
                    ),
                    "role", "WORKER"
            ));

        } catch (RuntimeException e) {
            System.err.println("RuntimeException in worker login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Worker not found: " + e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Unexpected error in worker login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Login failed: " + e.getMessage()
            ));
        }
    }

    // ==================== PROFILE MANAGEMENT ====================

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> fetchProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            System.out.println("Fetching profile for ABHA: " + abha);

            User worker = userService.getByAbhaNumber(abha);

            if (worker == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "error", "Worker not found"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", Map.of(
                            "id", worker.getId(),
                            "name", worker.getName(),
                            "username", worker.getUsername(),
                            "abhaNumber", worker.getAbhaNumber(),
                            "mobile", worker.getMobile(),
                            "region", worker.getRegion(),
                            "role", worker.getRole(),
                            "fhirPatientId", worker.getFhirPatientId()
                    )
            ));
        } catch (Exception e) {
            System.err.println("Error fetching worker profile: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to fetch profile: " + e.getMessage()
            ));
        }
    }

    // ==================== HEALTH RECORDS ====================

    @GetMapping("/me/records")
    public ResponseEntity<Map<String, Object>> fetchRecords(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            User worker = userService.getByAbhaNumber(abha);

            if (worker == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "error", "Worker not found"
                ));
            }

            // Check if worker has FHIR patient ID
            if (worker.getFhirPatientId() == null || worker.getFhirPatientId().trim().isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "No health records linked to this worker yet",
                        "worker", Map.of(
                                "name", worker.getName(),
                                "abha", worker.getAbhaNumber()
                        ),
                        "records", Map.of(
                                "observations", Map.of(),
                                "immunizations", Map.of()
                        )
                ));
            }

            // Fetch health records from FHIR service
            Map<String, Object> healthRecords = fhirService.getPatientHealthRecords(worker.getFhirPatientId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "worker", Map.of(
                            "name", worker.getName(),
                            "abha", worker.getAbhaNumber(),
                            "patientId", worker.getFhirPatientId()
                    ),
                    "records", healthRecords
            ));

        } catch (Exception e) {
            System.err.println("Error fetching health records: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to fetch health records: " + e.getMessage()
            ));
        }
    }

    // ==================== QR CODE GENERATION ====================

    @GetMapping("/me/qr")
    public ResponseEntity<Map<String, Object>> generateQR(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            User worker = userService.getByAbhaNumber(abha);

            if (worker == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "error", "Worker not found"
                ));
            }

            System.out.println("Generating QR for worker: " + worker.getName());

            // Use QrService to generate QR for worker
            Map<String, Object> qrResult = qrService.generateQRForWorker(worker);

            if (qrResult.containsKey("error") || !Boolean.TRUE.equals(qrResult.get("success"))) {
                System.err.println("QR generation failed: " + qrResult.get("error"));
                return ResponseEntity.status(500).body(qrResult);
            }

            System.out.println("✅ QR generated successfully for: " + worker.getName());

            // Return QR response in expected format
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "qrCode", qrResult.get("qrCode"), // Base64 PNG image
                    "expiresAt", qrResult.get("expiresAt"),
                    "qrId", qrResult.get("qrId"),
                    "encryptedPayload", qrResult.get("encryptedPayload"),
                    "message", "QR code generated successfully. Valid for 10 minutes."
            ));

        } catch (Exception e) {
            System.err.println("Error generating QR code: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to generate QR code: " + e.getMessage()
            ));
        }
    }

    // ==================== NOTIFICATIONS ====================

    @GetMapping("/me/notifications")
    public ResponseEntity<Map<String, Object>> getNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            User worker = userService.getByAbhaNumber(abha);

            if (worker == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "error", "Worker not found"
                ));
            }

            // Get notifications for worker's region
            List<Notification> notifications;
            try {
                notifications = notificationRepository.findActiveNotificationsForRegion(worker.getRegion());
            } catch (Exception e) {
                System.err.println("Error fetching notifications: " + e.getMessage());
                // Return empty notifications if database query fails
                notifications = List.of();
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "worker", worker.getName(),
                    "region", worker.getRegion(),
                    "totalNotifications", notifications.size(),
                    "notifications", notifications
            ));

        } catch (Exception e) {
            System.err.println("Error in getNotifications: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to fetch notifications: " + e.getMessage()
            ));
        }
    }

    // ==================== LOGOUT ====================

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            User worker = null;
            try {
                worker = userService.getByAbhaNumber(abha);
            } catch (Exception e) {
                // Ignore errors during logout
            }

            System.out.println("Worker logout: " + (worker != null ? worker.getName() : abha));

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Worker logged out successfully",
                    "worker", worker != null ? worker.getName() : "Unknown"
            ));
        } catch (Exception e) {
            // Always return success for logout
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Logged out"
            ));
        }
    }

    // ==================== HEALTH CHECK ====================

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Worker Controller",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}
