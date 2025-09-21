package com.backened.health_record_backend.seed;

import com.backened.health_record_backend.fhirmock.FhirResource;
import com.backened.health_record_backend.fhirmock.FhirResourceRepository;
import com.backened.health_record_backend.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FhirResourceRepository fhirRepo;

    public DemoSeeder(UserRepository userRepository, FhirResourceRepository fhirRepo) {
        this.userRepository = userRepository;
        this.fhirRepo = fhirRepo;
    }

    @Override
    public void run(String... args) {
        // Check if FHIR resources exist (not users, since users already exist)
        if (userRepository.count() > 0 || fhirRepo.count() > 0) {
            System.out.println("✅ Demo data already exists, skipping seeding...");
            return;
        }

        System.out.println("🌱 Seeding FHIR demo data for existing users...");

        // Only create FHIR resources for existing users
        createFhirResourcesOnly();

        System.out.println("✅ FHIR Demo data seeding completed!");
    }

    private void createFhirResourcesOnly() {
        // Create FHIR resources for existing ABHA00001 (Gokul)
        createPatientResource("patient-001", "Gokul Demo Worker", "9000000001", "ABHA00001");
        createSampleObservations("patient-001");
        createSampleImmunizations("patient-001");

        // Create FHIR resources for existing ABHA00002 (Ravi)
        createPatientResource("patient-002", "Ravi Migrant Worker", "9000000002", "ABHA00002");
        createSampleObservations("patient-002");
        createSampleImmunizations("patient-002");
    }

    private void createPatientResource(String patientId, String name, String mobile, String abhaNumber) {
        String[] nameParts = name.split(" ");
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Worker";

        String patientJson = String.format("""
            {
                "resourceType": "Patient",
                "id": "%s",
                "identifier": [
                    {
                        "system": "https://healthid.ndhm.gov.in",
                        "value": "%s"
                    }
                ],
                "name": [
                    {
                        "text": "%s",
                        "family": "%s",
                        "given": ["%s"]
                    }
                ],
                "telecom": [
                    {
                        "system": "phone",
                        "value": "%s",
                        "use": "mobile"
                    }
                ],
                "gender": "male",
                "birthDate": "1990-01-01"
            }
            """, patientId, abhaNumber, name, lastName, firstName, mobile);

        FhirResource patient = FhirResource.builder()
                .resourceType("Patient")
                .resourceId(patientId)
                .body(patientJson)
                .build();
        fhirRepo.save(patient);
    }

    private void createSampleObservations(String patientId) {
        // Blood Pressure Observation
        String bpObservation = String.format("""
            {
                "resourceType": "Observation",
                "id": "obs-bp-%s",
                "status": "final",
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "85354-9",
                            "display": "Blood pressure systolic"
                        }
                    ]
                },
                "subject": {
                    "reference": "Patient/%s"
                },
                "valueQuantity": {
                    "value": 120,
                    "unit": "mmHg"
                },
                "effectiveDateTime": "2025-09-15T10:00:00Z"
            }
            """, patientId, patientId);

        FhirResource bpObs = FhirResource.builder()
                .resourceType("Observation")
                .resourceId("obs-bp-" + patientId)
                .body(bpObservation)
                .subjectPatientId(patientId)
                .build();
        fhirRepo.save(bpObs);

        // Weight Observation
        String weightObservation = String.format("""
            {
                "resourceType": "Observation",
                "id": "obs-weight-%s",
                "status": "final",
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "29463-7",
                            "display": "Body weight"
                        }
                    ]
                },
                "subject": {
                    "reference": "Patient/%s"
                },
                "valueQuantity": {
                    "value": 65,
                    "unit": "kg"
                },
                "effectiveDateTime": "2025-09-10T09:00:00Z"
            }
            """, patientId, patientId);

        FhirResource weightObs = FhirResource.builder()
                .resourceType("Observation")
                .resourceId("obs-weight-" + patientId)
                .body(weightObservation)
                .subjectPatientId(patientId)
                .build();
        fhirRepo.save(weightObs);
    }

    private void createSampleImmunizations(String patientId) {
        // COVID-19 Vaccination
        String covidVaccine = String.format("""
            {
                "resourceType": "Immunization",
                "id": "imm-covid-%s",
                "status": "completed",
                "vaccineCode": {
                    "coding": [
                        {
                            "system": "http://hl7.org/fhir/sid/cvx",
                            "code": "207",
                            "display": "COVID-19 mRNA vaccine"
                        }
                    ]
                },
                "patient": {
                    "reference": "Patient/%s"
                },
                "occurrenceDateTime": "2025-08-01T10:00:00Z",
                "lotNumber": "COV123456"
            }
            """, patientId, patientId);

        FhirResource covidImm = FhirResource.builder()
                .resourceType("Immunization")
                .resourceId("imm-covid-" + patientId)
                .body(covidVaccine)
                .patientId(patientId)
                .build();
        fhirRepo.save(covidImm);

        // Hepatitis B Vaccination
        String hepBVaccine = String.format("""
            {
                "resourceType": "Immunization",
                "id": "imm-hepb-%s",
                "status": "completed",
                "vaccineCode": {
                    "coding": [
                        {
                            "system": "http://hl7.org/fhir/sid/cvx",
                            "code": "08",
                            "display": "Hepatitis B vaccine"
                        }
                    ]
                },
                "patient": {
                    "reference": "Patient/%s"
                },
                "occurrenceDateTime": "2025-07-15T14:00:00Z",
                "lotNumber": "HEPB789"
            }
            """, patientId, patientId);

        FhirResource hepBImm = FhirResource.builder()
                .resourceType("Immunization")
                .resourceId("imm-hepb-" + patientId)
                .body(hepBVaccine)
                .patientId(patientId)
                .build();
        fhirRepo.save(hepBImm);
    }
}
