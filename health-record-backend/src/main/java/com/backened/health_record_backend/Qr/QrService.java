package com.backened.health_record_backend.Qr;

import com.backened.health_record_backend.users.User; // ADD THIS IMPORT
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import javax.imageio.ImageIO;
import java.awt.Color;
import java.security.MessageDigest;
import java.util.Arrays;

@Service
public class QrService {
    private final ObjectMapper objectMapper;
    private static final String ENCRYPTION_KEY = "MySecretHealthKey123";
    private static final String ALGORITHM = "AES";

    public QrService() {
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> generateHealthRecordsQR(Map<String, Object> workerData, Map<String, Object> healthRecords) {
        try {
            // Create QR payload with expiry
            Instant expiry = Instant.now().plus(10, ChronoUnit.MINUTES);

            Map<String, Object> qrPayload = Map.of(
                    "worker", workerData,
                    "records", healthRecords,
                    "timestamp", Instant.now().toString(),
                    "expiry", expiry.toString(),
                    "qrId", generateQrId()
            );

            // Convert to JSON string
            String jsonPayload = objectMapper.writeValueAsString(qrPayload);

            // Encrypt the payload
            String encryptedPayload = encryptData(jsonPayload);

            // Generate QR code image as Base64
            String qrImageBase64 = generateQRCodeImage(encryptedPayload, 300, 300);

            return Map.of(
                    "success", true, // ADD SUCCESS FLAG
                    "qrCode", qrImageBase64,
                    "qrId", qrPayload.get("qrId"),
                    "expiresAt", expiry.toString(),
                    "dataSize", jsonPayload.length(),
                    "encryptedSize", encryptedPayload.length(),
                    "encryptedPayload", encryptedPayload
            );

        } catch (Exception e) {
            return Map.of(
                    "success", false, // ADD SUCCESS FLAG
                    "error", "Failed to generate QR code: " + e.getMessage()
            );
        }
    }

    // WORKER-SPECIFIC QR GENERATION
    public Map<String, Object> generateQRForWorker(User worker) {
        try {
            // Validate worker input
            if (worker == null) {
                return Map.of(
                        "success", false,
                        "error", "Worker data is required"
                );
            }

            // Create worker data map with null checks
            Map<String, Object> workerData = Map.of(
                    "abha", worker.getAbhaNumber() != null ? worker.getAbhaNumber() : "N/A",
                    "name", worker.getName() != null ? worker.getName() : "Unknown Worker",
                    "mobile", worker.getMobile() != null ? worker.getMobile() : "N/A",
                    "region", worker.getRegion() != null ? worker.getRegion() : "Unknown Region",
                    "fhirPatientId", worker.getFhirPatientId() != null ? worker.getFhirPatientId() : "N/A"
            );

            // Create simple health records (you can enhance this with real FHIR data later)
            Map<String, Object> healthRecords = Map.of(
                    "bloodPressure", "120/80 mmHg",
                    "weight", "65 kg",
                    "temperature", "98.6°F",
                    "lastCheckup", "2025-09-15",
                    "status", "Normal",
                    "notes", "Routine checkup completed"
            );

            // Use your existing method to generate QR
            return generateHealthRecordsQR(workerData, healthRecords);

        } catch (Exception e) {
            return Map.of(
                    "success", false,
                    "error", "Failed to generate QR for worker: " + e.getMessage()
            );
        }
    }

    // ENCRYPTION METHODS (Your existing methods - these are correct)
    private String encryptData(String data) {
        try {
            // Create a fixed 16-byte key from the original key
            MessageDigest sha = MessageDigest.getInstance("SHA-1");
            byte[] keyBytes = sha.digest(ENCRYPTION_KEY.getBytes("UTF-8"));
            keyBytes = Arrays.copyOf(keyBytes, 16); // Use only first 16 bytes for AES-128

            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding"); // Use full transformation
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);

            byte[] encryptedBytes = cipher.doFinal(data.getBytes("UTF-8"));
            return Base64.getEncoder().encodeToString(encryptedBytes);

        } catch (Exception e) {
            throw new RuntimeException("Encryption failed: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> decryptQRData(String encryptedData) {
        try {
            // Validate input
            if (encryptedData == null || encryptedData.trim().isEmpty()) {
                return Map.of("error", "Encrypted data is required");
            }

            // Create same fixed 16-byte key
            MessageDigest sha = MessageDigest.getInstance("SHA-1");
            byte[] keyBytes = sha.digest(ENCRYPTION_KEY.getBytes("UTF-8"));
            keyBytes = Arrays.copyOf(keyBytes, 16);

            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            byte[] decodedBytes = Base64.getDecoder().decode(encryptedData);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);
            String decryptedJson = new String(decryptedBytes, "UTF-8");

            Map<String, Object> result = objectMapper.readValue(decryptedJson, Map.class);
            result.put("success", true); // ADD SUCCESS FLAG
            return result;

        } catch (Exception e) {
            return Map.of(
                    "success", false,
                    "error", "Failed to decrypt QR data: " + e.getMessage()
            );
        }
    }

    // QR IMAGE GENERATION
    private String generateQRCodeImage(String data, int width, int height) throws WriterException {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height, hints);

            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    image.setRGB(x, y, bitMatrix.get(x, y) ? Color.BLACK.getRGB() : Color.WHITE.getRGB());
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();

            return Base64.getEncoder().encodeToString(imageBytes);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR image: " + e.getMessage(), e);
        }
    }

    // UTILITY METHODS
    private String generateQrId() {
        return "QR" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }

    public boolean isQRExpired(String expiryTime) {
        try {
            if (expiryTime == null || expiryTime.trim().isEmpty()) {
                return true; // Consider null/empty as expired
            }

            Instant expiry = Instant.parse(expiryTime);
            return Instant.now().isAfter(expiry);
        } catch (Exception e) {
            return true; // Consider invalid expiry time as expired
        }
    }

    // ADDITIONAL UTILITY METHOD FOR ENHANCED QR GENERATION
    public Map<String, Object> generateQRWithCustomData(Map<String, Object> customWorkerData, Map<String, Object> customHealthRecords) {
        try {
            if (customWorkerData == null || customWorkerData.isEmpty()) {
                return Map.of(
                        "success", false,
                        "error", "Worker data is required"
                );
            }

            return generateHealthRecordsQR(customWorkerData, customHealthRecords != null ? customHealthRecords : Map.of());

        } catch (Exception e) {
            return Map.of(
                    "success", false,
                    "error", "Failed to generate custom QR: " + e.getMessage()
            );
        }
    }
}
