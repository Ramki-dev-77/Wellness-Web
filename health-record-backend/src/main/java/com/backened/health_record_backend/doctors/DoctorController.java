package com.backened.health_record_backend.doctors;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backened.health_record_backend.Qr.QrService;
import com.backened.health_record_backend.auth.EmailService;
import com.backened.health_record_backend.fhirmock.FhirResourceService;
import com.backened.health_record_backend.fhirmock.FhirService;
import com.backened.health_record_backend.users.User;
import com.backened.health_record_backend.users.UserRepository;
import com.backened.health_record_backend.users.UserService;

@RestController
@RequestMapping("/doctor")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    private final UserService userService;
    private final QrService qrService;
    private final FhirService fhirService;
    private final ScanLogRepository scanLogRepository;
    private final FhirResourceService fhirResourceService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public DoctorController(UserService userService, QrService qrService, FhirService fhirService,
                            ScanLogRepository scanLogRepository, FhirResourceService fhirResourceService,
                            EmailService emailService, UserRepository userRepository) {
        this.userService = userService;
        this.qrService = qrService;
        this.fhirService = fhirService;
        this.scanLogRepository = scanLogRepository;
        this.fhirResourceService = fhirResourceService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @PostMapping("/email-input")
    public Map<String, Object> sendEmailVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return Map.of("success", false, "error", "Email is required");
        }

        try {
            boolean emailSent = emailService.sendVerificationOTP(email, "doctor");
            return Map.of(
                    "success", true,
                    "message", "Verification code sent to your email",
                    "email", email
            );
        } catch (Exception e) {
            return Map.of(
                    "success", true,
                    "message", "Verification code sent to your email (demo mode)",
                    "email", email
            );
        }
    }

    @PostMapping("/email-verify")
    public Map<String, Object> verifyEmailAndLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String otp = request.get("otp");

        String verificationCode = code != null ? code : otp;

        if (email == null || verificationCode == null) {
            return Map.of("success", false, "error", "Email and verification code are required");
        }

        try {
            boolean isValidOtp = "123456".equals(verificationCode) || emailService.verifyOTP(email, verificationCode);

            if (!isValidOtp) {
                return Map.of("success", false, "error", "Invalid verification code. Use 123456 for demo.");
            }

            User doctor = userService.findByMobile(email);
            if (doctor == null || !"DOCTOR".equals(doctor.getRole())) {
                doctor = new User();
                doctor.setMobile(email);
                doctor.setName(email.split("@")[0]);
                doctor.setUsername(email.split("@")[0] + "_doctor");
                doctor.setRole("DOCTOR");
                doctor.setId(999L);
            }

            return Map.of(
                    "success", true,
                    "token", "demo-token-" + doctor.getUsername(),
                    "user", Map.of(
                            "id", doctor.getId(),
                            "name", doctor.getName(),
                            "mobile", doctor.getMobile(),
                            "username", doctor.getUsername(),
                            "role", doctor.getRole()
                    ),
                    "role", "DOCTOR"
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Login failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        try {
            User doctor = userService.findByUsernameAndRole(username, "DOCTOR");
            if (doctor == null) {
                return Map.of("success", false, "error", "Doctor not found");
            }
            return Map.of(
                    "success", true,
                    "token", "demo-token-" + username,
                    "user", doctor,
                    "role", "DOCTOR"
            );
        } catch (RuntimeException e) {
            return Map.of("success", false, "error", "Invalid credentials");
        }
    }

    @GetMapping("/me")
    public Map<String, Object> fetchProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = token.replace("demo-token-", "");
            User doctor = userService.findByUsernameAndRole(username, "DOCTOR");
            if (doctor != null) {
                return Map.of("success", true, "user", doctor);
            } else {
                return Map.of("success", true,
                        "user", Map.of(
                                "id", 999L,
                                "name", username.replace("_doctor", ""),
                                "username", username,
                                "mobile", username.replace("_doctor", "") + "@example.com",
                                "role", "DOCTOR"
                        ));
            }
        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to fetch profile");
        }
    }

    @PostMapping("/scan")
    public Map<String, Object> scanQR(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Map<String, String> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String doctorUsername = token.replace("demo-token-", "");

            User doctor = userService.findByUsernameAndRole(doctorUsername, "DOCTOR");
            if (doctor == null) {
                doctor = new User();
                doctor.setUsername(doctorUsername);
                doctor.setName(doctorUsername.replace("_doctor", ""));
                doctor.setRole("DOCTOR");
                doctor.setId(999L);
            }

            String encryptedData = request.get("encryptedData");
            if (encryptedData == null || encryptedData.trim().isEmpty()) {
                return Map.of("success", false, "error", "Missing QR data");
            }

            Map<String, Object> decryptedData = qrService.decryptQRData(encryptedData);
            if (decryptedData.containsKey("error")) {
                return Map.of("success", false, "error", "Invalid or corrupted QR code");
            }

            String expiryTime = (String) decryptedData.get("expiry");
            if (qrService.isQRExpired(expiryTime)) {
                return Map.of("success", false, "error", "QR code has expired. Please ask patient to generate a new one.");
            }

            Map<String, Object> workerData = (Map<String, Object>) decryptedData.get("worker");
            Map<String, Object> healthRecords = (Map<String, Object>) decryptedData.get("records");
            String qrId = (String) decryptedData.get("qrId");
            String timestamp = (String) decryptedData.get("timestamp");

            return Map.of(
                    "success", true,
                    "scannedAt", Instant.now().toString(),
                    "doctor", Map.of("name", doctor.getName(), "username", doctor.getUsername()),
                    "patient", workerData,
                    "healthRecords", healthRecords,
                    "qrInfo", Map.of("qrId", qrId, "generatedAt", timestamp, "expiresAt", expiryTime)
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Scan failed: " + e.getMessage());
        }
    }

    @GetMapping("/scan-history")
    public Map<String, Object> getScanHistory(@RequestHeader("Authorization") String authHeader,
                                              @RequestParam(defaultValue = "10") int limit) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String doctorUsername = token.replace("demo-token-", "");

            return Map.of(
                    "success", true,
                    "doctor", doctorUsername.replace("_doctor", ""),
                    "totalScans", 0,
                    "recentScans", java.util.Collections.emptyList()
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to fetch scan history");
        }
    }

    @PostMapping("/records/observations")
    public Map<String, Object> addObservation(@RequestHeader("Authorization") String authHeader,
                                              @RequestBody Map<String, Object> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String doctorUsername = token.replace("demo-token-", "");

            String patientId = (String) request.get("patientId");
            String observationType = (String) request.get("type");
            String value = String.valueOf(request.get("value"));
            String unit = (String) request.get("unit");

            if (patientId == null || observationType == null || value == null || unit == null) {
                return Map.of("success", false, "error", "Missing required fields: patientId, type, value, unit");
            }

            return Map.of(
                    "success", true,
                    "message", "Observation recorded successfully (demo mode)",
                    "observation", Map.of(
                            "id", "obs_" + System.currentTimeMillis(),
                            "type", observationType,
                            "value", value + " " + unit,
                            "recordedBy", doctorUsername.replace("_doctor", ""),
                            "recordedAt", Instant.now().toString()
                    )
            );

        } catch (Exception e) {
            return Map.of("success", false, "error", "Failed to add observation: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = token.replace("demo-token-", "");

            return Map.of(
                    "success", true,
                    "message", "Doctor logged out successfully",
                    "doctor", username.replace("_doctor", "")
            );
        } catch (Exception e) {
            return Map.of(
                    "success", true,
                    "message", "Logged out"
            );
        }
    }

    // SEARCH ENDPOINTS FOR PATIENTS
    @GetMapping("/search/patient/{abhaNumber}")
    public Map<String, Object> searchPatientByAbha(@RequestHeader("Authorization") String authHeader,
                                                   @PathVariable String abhaNumber) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String doctorUsername = token.replace("demo-token-", "");
System.out.println("Searching patient with ABHA: " + abhaNumber); 
            // Verify doctor authentication
            User doctor = userService.findByUsernameAndRole(doctorUsername, "DOCTOR");
            if (doctor == null) {
                // Create demo doctor if not found
                doctor = new User();
                doctor.setUsername(doctorUsername);
                doctor.setName(doctorUsername.replace("_doctor", ""));
                doctor.setRole("DOCTOR");
                doctor.setId(999L);
            }

            // Debug: Log the search attempt
            System.out.println("Doctor searching for patient with ABHA: " + abhaNumber);

            // Search for patient by ABHA number
            Optional<User> patientOpt = userRepository.findByAbhaNumber(abhaNumber);
            User patient = patientOpt.orElse(null);
            System.out.println("Patient found: " + (patient != null ? patient.getName() : "null"));
            // Debug: Log the result
            System.out.println("Search result: " + (patient != null ? patient.getName() : "Not found"));
            
            if (patient == null) {
                return Map.of(
                        "success", false,
                        "error", "No patient found with ABHA number: " + abhaNumber
                );
            }

            // Check if the user is a patient (migrant worker)
            if (!"WORKER".equals(patient.getRole()) && !"MIGRANT".equals(patient.getRole())) {
                return Map.of(
                        "success", false,
                        "error", "User found but is not a patient. Role: " + patient.getRole()
                );
            }

            return Map.of(
                    "success", true,
                    "patient", Map.of(
                            "id", patient.getId(),
                            "name", patient.getName(),
                            "abhaNumber", patient.getAbhaNumber(),
                            "mobile", patient.getMobile(),
                            "region", patient.getRegion(),
                            "fhirPatientId", patient.getFhirPatientId() != null ? patient.getFhirPatientId() : "",
                            "role", patient.getRole()
                    ),
                    "searchedBy", doctor.getName()
            );

        } catch (Exception e) {
            System.err.println("Error searching patient: " + e.getMessage());
            e.printStackTrace();
            return Map.of("success", false, "error", "Failed to search patient: " + e.getMessage());
        }
    }

    @GetMapping("/records/patient/{abhaNumber}")
    public Map<String, Object> getPatientRecords(@RequestHeader("Authorization") String authHeader,
                                                 @PathVariable String abhaNumber) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String doctorUsername = token.replace("demo-token-", "");

            // Verify doctor authentication
            User doctor = userService.findByUsernameAndRole(doctorUsername, "DOCTOR");
            if (doctor == null) {
                // Create demo doctor if not found
                doctor = new User();
                doctor.setUsername(doctorUsername);
                doctor.setName(doctorUsername.replace("_doctor", ""));
                doctor.setRole("DOCTOR");
                doctor.setId(999L);
            }

            // Find patient by ABHA number
            Optional<User> patientOpt = userRepository.findByAbhaNumber(abhaNumber);
            if (patientOpt.isEmpty()) {
                return Map.of(
                        "success", false,
                        "error", "No patient found with ABHA number: " + abhaNumber
                );
            }

            User patient = patientOpt.get();

            // Mock health records for demo
            return Map.of(
                    "success", true,
                    "patient", Map.of(
                            "id", patient.getId(),
                            "name", patient.getName(),
                            "abhaNumber", patient.getAbhaNumber(),
                            "mobile", patient.getMobile(),
                            "region", patient.getRegion()
                    ),
                    "records", Map.of(
                            "observations", java.util.List.of(
                                    Map.of(
                                            "id", "obs_1",
                                            "type", "Blood Pressure",
                                            "value", "120/80",
                                            "unit", "mmHg",
                                            "date", "2024-01-15",
                                            "recordedBy", "Dr. Demo"
                                    ),
                                    Map.of(
                                            "id", "obs_2",
                                            "type", "Weight",
                                            "value", "70",
                                            "unit", "kg",
                                            "date", "2024-01-15",
                                            "recordedBy", "Dr. Demo"
                                    )
                            ),
                            "immunizations", java.util.List.of(
                                    Map.of(
                                            "id", "imm_1",
                                            "vaccineType", "COVID-19",
                                            "lotNumber", "LOT123",
                                            "date", "2024-01-10",
                                            "administeredBy", "Dr. Demo"
                                    )
                            ),
                            "conditions", java.util.List.of(
                                    Map.of(
                                            "id", "cond_1",
                                            "name", "Hypertension",
                                            "status", "Active",
                                            "diagnosedDate", "2024-01-01"
                                    )
                            )
                    ),
                    "accessedBy", doctor.getName(),
                    "accessTime", Instant.now().toString()
            );

        } catch (Exception e) {
            System.err.println("Error fetching patient records: " + e.getMessage());
            e.printStackTrace();
            return Map.of("success", false, "error", "Failed to fetch patient records: " + e.getMessage());
        }
    }
}
