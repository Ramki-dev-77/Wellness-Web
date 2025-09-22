package com.backened.health_record_backend.fhirmock;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FhirResourceRepository extends JpaRepository<FhirResource, Long> {
    Optional<FhirResource> findByResourceTypeAndResourceId(String resourceType, String resourceId);

    List<FhirResource> findByResourceType(String resourceType);

    List<FhirResource> findBySubjectPatientId(String subjectPatientId);  // For Observations

    List<FhirResource> findByPatientId(String patientId);  // For Immunizations

    long countByResourceType(String resourceType);
}