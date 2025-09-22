package com.backened.health_record_backend.Qr;

import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backened.health_record_backend.users.User;
import com.backened.health_record_backend.users.UserRepository;

@RestController
@RequestMapping("/qr")
@CrossOrigin(origins = "*")
public class QrController {

    private final QrService qrService;
    private final UserRepository userRepository;

    public QrController(QrService qrService, UserRepository userRepository) {
        this.qrService = qrService;
        this.userRepository = userRepository;
    }

    @PostMapping("/generate/{abhaNumber}")
    public Map<String, Object> generateQRForWorker(@PathVariable String abhaNumber) {
        try {
            Optional<User> workerOpt = userRepository.findByAbhaNumber(abhaNumber);

            if (workerOpt.isEmpty()) {
                return Map.of(
                        "success", false,
                        "error", "Worker not found with ABHA number: " + abhaNumber
                );
            }

            User worker = workerOpt.get();
            return qrService.generateQRForWorker(worker);

        } catch (Exception e) {
            return Map.of(
                    "success", false,
                    "error", "Failed to generate QR: " + e.getMessage()
            );
        }
    }

    @PostMapping("/decrypt")
    public Map<String, Object> decryptQRData(@RequestBody Map<String, String> request) {
        try {
            String encryptedData = request.get("encryptedData");
            return qrService.decryptQRData(encryptedData);
        } catch (Exception e) {
            return Map.of(
                    "success", false,
                    "error", "Failed to decrypt QR data: " + e.getMessage()
            );
        }
    }

    @GetMapping("/test")
    public Map<String, Object> test() {
        return Map.of(
                "success", true,
                "message", "QR Service is working!"
        );
    }
}
