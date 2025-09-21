package com.backened.health_record_backend.doctors;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "scan_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id")
    private String doctorId;  // DOC001, DOC002, etc.

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "patient_abha")
    private String patientAbha;  // ABHA00001, etc.

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "qr_id")
    private String qrId;  // QR tracking ID

    @Column(name = "scan_timestamp", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT now()")
    private Instant scanTimestamp;

    @Column(name = "qr_generated_at")
    private Instant qrGeneratedAt;

    @Column(name = "qr_expires_at")
    private Instant qrExpiresAt;

    @Column(name = "success")
    private Boolean success;  // true if scan successful, false if expired/error

    @Column(name = "error_message")
    private String errorMessage;

    @PrePersist
    public void prePersist() {
        if (scanTimestamp == null) {
            scanTimestamp = Instant.now();
        }
        if (success == null) {
            success = true;
        }
    }
}
