package com.backened.health_record_backend.fhirmock;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FhirService {
    private final FhirResourceRepository fhirRepo;
    private final ObjectMapper objectMapper;

    public FhirService(FhirResourceRepository fhirRepo) {
        this.fhirRepo = fhirRepo;
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> getPatientHealthRecords(String patientId) {
        try {
            // Get all resources for this patient
            List<FhirResource> observations = fhirRepo.findBySubjectPatientId(patientId);
            List<FhirResource> immunizations = fhirRepo.findByPatientId(patientId);

            // Process observations (vitals, lab results)
            List<Map<String, Object>> processedObservations = processObservations(observations);

            // Process immunizations (vaccines)
            List<Map<String, Object>> processedImmunizations = processImmunizations(immunizations);

            return Map.of(
                    "observations", processedObservations,
                    "immunizations", processedImmunizations,
                    "summary", createSummary(processedObservations, processedImmunizations)
            );

        } catch (Exception e) {
            return Map.of(
                    "observations", Collections.emptyList(),
                    "immunizations", Collections.emptyList(),
                    "error", "Failed to load health records: " + e.getMessage()
            );
        }
    }

    private List<Map<String, Object>> processObservations(List<FhirResource> observations) {
        return observations.stream()
                .map(this::parseObservation)
                .filter(Objects::nonNull)
                .sorted((a, b) -> b.get("date").toString().compareTo(a.get("date").toString())) // Latest first
                .toList();
    }

    private List<Map<String, Object>> processImmunizations(List<FhirResource> immunizations) {
        return immunizations.stream()
                .map(this::parseImmunization)
                .filter(Objects::nonNull)
                .sorted((a, b) -> b.get("date").toString().compareTo(a.get("date").toString())) // Latest first
                .toList();
    }

    private Map<String, Object> parseObservation(FhirResource resource) {
        try {
            JsonNode json = objectMapper.readTree(resource.getBody());

            // Extract key fields
            String code = json.path("code").path("coding").get(0).path("code").asText();
            String display = json.path("code").path("coding").get(0).path("display").asText();
            String value = json.path("valueQuantity").path("value").asText();
            String unit = json.path("valueQuantity").path("unit").asText();
            String date = json.path("effectiveDateTime").asText();

            return Map.of(
                    "id", resource.getResourceId(),
                    "type", "observation",
                    "code", code,
                    "name", display,
                    "value", value,
                    "unit", unit,
                    "date", date,
                    "status", json.path("status").asText()
            );
        } catch (Exception e) {
            return null; // Skip malformed records
        }
    }

    private Map<String, Object> parseImmunization(FhirResource resource) {
        try {
            JsonNode json = objectMapper.readTree(resource.getBody());

            // Extract key fields
            String code = json.path("vaccineCode").path("coding").get(0).path("code").asText();
            String display = json.path("vaccineCode").path("coding").get(0).path("display").asText();
            String date = json.path("occurrenceDateTime").asText();
            String lotNumber = json.path("lotNumber").asText();

            return Map.of(
                    "id", resource.getResourceId(),
                    "type", "immunization",
                    "code", code,
                    "vaccine", display,
                    "date", date,
                    "lotNumber", lotNumber,
                    "status", json.path("status").asText()
            );
        } catch (Exception e) {
            return null; // Skip malformed records
        }
    }

    private Map<String, Object> createSummary(List<Map<String, Object>> observations,
                                              List<Map<String, Object>> immunizations) {
        return Map.of(
                "totalObservations", observations.size(),
                "totalImmunizations", immunizations.size(),
                "lastUpdated", new Date().toString()
        );
    }
}
