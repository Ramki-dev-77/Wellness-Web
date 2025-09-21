package com.backened.health_record_backend.officials;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "region")
    private String region; // 'Kerala', 'Tamil Nadu', or NULL for all regions

    @Column(name = "type")
    private String type = "health_camp"; // 'health_camp', 'announcement', 'reminder'

    @Column(name = "created_by")
    private String createdBy; // Official username

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT now()")
    private Instant createdAt;

    @Column(name = "active")
    private Boolean active = true;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (active == null) {
            active = true;
        }
        if (type == null) {
            type = "health_camp";
        }
    }
}

