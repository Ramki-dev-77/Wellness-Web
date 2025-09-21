package com.backened.health_record_backend.fhirmock;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class FhirResourceService {
    private final FhirResourceRepository fhirRepo;
    private final ObjectMapper objectMapper;

    public FhirResourceService(FhirResourceRepository fhirRepo) {
        this.fhirRepo = fhirRepo;
        this.objectMapper = new ObjectMapper();
    }

    public FhirResource createObservation(String patientId, String observationType,
                                          String value, String unit, String doctorId) {
        try {
            String observationId = "obs-" + observationType.toLowerCase() + "-" + patientId + "-" + System.currentTimeMillis();

            // Get LOINC codes for different observation types
            Map<String, String> codes = getObservationCodes(observationType);

            String observationJson = String.format("""
                {
                    "resourceType": "Observation",
                    "id": "%s",
                    "status": "final",
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "%s",
                                "display": "%s"
                            }
                        ]
                    },
                    "subject": {
                        "reference": "Patient/%s"
                    },
                    "valueQuantity": {
                        "value": %s,
                        "unit": "%s"
                    },
                    "effectiveDateTime": "%s",
                    "performer": [
                        {
                            "reference": "Doctor/%s"
                        }
                    ]
                }
                """, observationId, codes.get("code"), codes.get("display"),
                    patientId, value, unit, Instant.now().toString(), doctorId);

            FhirResource observation = FhirResource.builder()
                    .resourceType("Observation")
                    .resourceId(observationId)
                    .body(observationJson)
                    .subjectPatientId(patientId)
                    .build();

            return fhirRepo.save(observation);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create observation: " + e.getMessage());
        }
    }

    public FhirResource createImmunization(String patientId, String vaccineType,
                                           String lotNumber, String doctorId) {
        try {
            String immunizationId = "imm-" + vaccineType.toLowerCase().replaceAll("[^a-z0-9]", "") +
                    "-" + patientId + "-" + System.currentTimeMillis();

            // Get CVX codes for different vaccine types
            Map<String, String> codes = getVaccineCodes(vaccineType);

            String immunizationJson = String.format("""
                {
                    "resourceType": "Immunization",
                    "id": "%s",
                    "status": "completed",
                    "vaccineCode": {
                        "coding": [
                            {
                                "system": "http://hl7.org/fhir/sid/cvx",
                                "code": "%s",
                                "display": "%s"
                            }
                        ]
                    },
                    "patient": {
                        "reference": "Patient/%s"
                    },
                    "occurrenceDateTime": "%s",
                    "lotNumber": "%s",
                    "performer": [
                        {
                            "actor": {
                                "reference": "Doctor/%s"
                            }
                        }
                    ]
                }
                """, immunizationId, codes.get("code"), codes.get("display"),
                    patientId, Instant.now().toString(), lotNumber, doctorId);

            FhirResource immunization = FhirResource.builder()
                    .resourceType("Immunization")
                    .resourceId(immunizationId)
                    .body(immunizationJson)
                    .patientId(patientId)
                    .build();

            return fhirRepo.save(immunization);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create immunization: " + e.getMessage());
        }
    }

    private Map<String, String> getObservationCodes(String observationType) {
        return switch (observationType.toLowerCase()) {
            case "blood_pressure", "bp" -> Map.of(
                    "code", "85354-9",
                    "display", "Blood pressure systolic"
            );
            case "weight" -> Map.of(
                    "code", "29463-7",
                    "display", "Body weight"
            );
            case "height" -> Map.of(
                    "code", "8302-2",
                    "display", "Body height"
            );
            case "temperature", "temp" -> Map.of(
                    "code", "8310-5",
                    "display", "Body temperature"
            );
            case "heart_rate", "pulse" -> Map.of(
                    "code", "8867-4",
                    "display", "Heart rate"
            );
            case "blood_sugar", "glucose" -> Map.of(
                    "code", "2339-0",
                    "display", "Glucose"
            );
            case "oxygen_saturation", "spo2" -> Map.of(
                    "code", "20564-1",
                    "display", "Oxygen saturation"
            );
            default -> Map.of(
                    "code", "8716-3",
                    "display", "Vital signs"
            );
        };
    }

    private Map<String, String> getVaccineCodes(String vaccineType) {
        return switch (vaccineType.toLowerCase()) {
            case "covid-19", "covid", "coronavirus" -> Map.of(
                    "code", "207",
                    "display", "COVID-19 mRNA vaccine"
            );
            case "hepatitis_b", "hepb" -> Map.of(
                    "code", "08",
                    "display", "Hepatitis B vaccine"
            );
            case "tetanus" -> Map.of(
                    "code", "09",
                    "display", "Tetanus and diphtheria toxoids"
            );
            case "influenza", "flu" -> Map.of(
                    "code", "88",
                    "display", "Influenza vaccine"
            );
            case "measles" -> Map.of(
                    "code", "03",
                    "display", "Measles, mumps and rubella vaccine"
            );
            case "tuberculosis", "bcg" -> Map.of(
                    "code", "19",
                    "display", "Bacille Calmette-Guerin vaccine"
            );
            case "typhoid" -> Map.of(
                    "code", "25",
                    "display", "Typhoid vaccine"
            );
            default -> Map.of(
                    "code", "998",
                    "display", "No vaccine administered"
            );
        };
    }
}
