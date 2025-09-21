package com.backened.health_record_backend.fhirmock;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fhir_resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FhirResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resource_type")
    private String resourceType;

    @Column(name = "resource_id", unique = true)
    private String resourceId;

    // FIXED: Use TEXT instead of JSONB
    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(name = "subject_patient_id")
    private String subjectPatientId;

    @Column(name = "patient_id")
    private String patientId;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT now()")
    private java.time.Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = java.time.Instant.now();
        }
    }
}
