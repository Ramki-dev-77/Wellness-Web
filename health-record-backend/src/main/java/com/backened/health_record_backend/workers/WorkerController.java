 package com.backened.health_record_backend.workers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backened.health_record_backend.Qr.QrService;
import com.backened.health_record_backend.fhirmock.FhirService;
import com.backened.health_record_backend.officials.Notification;
import com.backened.health_record_backend.officials.NotificationRepository;
import com.backened.health_record_backend.users.User;
import com.backened.health_record_backend.users.UserService;

@RestController
@RequestMapping("/workers")
@CrossOrigin(origins = "http://localhost:3000")
public class WorkerController {

    private final UserService userService;
    private final FhirService fhirService;
    private final QrService qrService;
    private final NotificationRepository notificationRepository;

    @Autowired
    public WorkerController(UserService userService, FhirService fhirService, QrService qrService,
                            NotificationRepository notificationRepository) {
        this.userService = userService;
        this.fhirService = fhirService;
        this.qrService = qrService;
        this.notificationRepository = notificationRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String abhaNumber = request.get("abhaNumber");
            String abha = request.get("abha");
            String otp = request.get("otp");

            String workerAbha = abhaNumber != null ? abhaNumber : abha;

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

            if (!"123456".equals(otp)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid OTP. Use 123456 for demo."
                ));
            }

            User worker = userService.findByAbhaNumber(workerAbha);

            if (worker == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Worker not found with ABHA: " + workerAbha
                ));
            }

            if (worker.getRole() == null || !"WORKER".equalsIgnoreCase(worker.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid worker credentials. User role: " + worker.getRole()
                ));
            }

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
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Login failed: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> fetchProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            User worker = userService.findByAbhaNumber(abha);

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
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to fetch profile: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/me/records")
    public ResponseEntity<Map<String, Object>> fetchRecords(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            User worker = userService.findByAbhaNumber(abha);

            if (worker == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "error", "Worker not found"
                ));
            }

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
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to fetch health records: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/me/qr")
    public ResponseEntity<Map<String, Object>> generateQR(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            User worker = userService.findByAbhaNumber(abha);

            if (worker == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "error", "Worker not found"
                ));
            }

            Map<String, Object> qrResult = qrService.generateQRForWorker(worker);

            if (qrResult.containsKey("error") || !Boolean.TRUE.equals(qrResult.get("success"))) {
                return ResponseEntity.status(500).body(qrResult);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "qrCode", qrResult.get("qrCode"),
                    "expiresAt", qrResult.get("expiresAt"),
                    "qrId", qrResult.get("qrId"),
                    "encryptedPayload", qrResult.get("encryptedPayload"),
                    "message", "QR code generated successfully. Valid for 10 minutes."
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to generate QR code: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/me/notifications")
    public ResponseEntity<Map<String, Object>> getNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            User worker = userService.findByAbhaNumber(abha);

            if (worker == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "error", "Worker not found"
                ));
            }

            List<Notification> notifications;
            try {
                notifications = notificationRepository.findActiveNotificationsForRegion(worker.getRegion());
            } catch (Exception e) {
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
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Failed to fetch notifications: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String abha = token.replace("demo-token-", "");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Worker logged out successfully",
                    "worker", abha
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Logged out"
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Worker Controller",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}
