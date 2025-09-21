package com.backened.health_record_backend.users;

import jakarta.persistence.*;
import lombok.*;
import org.hl7.fhir.utilities.settings.ServerDetailsPOJO;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;
    private String name;
    private String mobile;
    private String region;
    @Column(nullable = false)
    private String role;
    private String abhaNumber;
    private String abhaAddress;
    private String fhirPatientId;

}
