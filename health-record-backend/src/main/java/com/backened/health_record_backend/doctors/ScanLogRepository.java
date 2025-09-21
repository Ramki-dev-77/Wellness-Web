package com.backened.health_record_backend.doctors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ScanLogRepository extends JpaRepository<ScanLog, Long> {

    List<ScanLog> findByDoctorIdOrderByScanTimestampDesc(String doctorId);

    List<ScanLog> findByPatientAbhaOrderByScanTimestampDesc(String patientAbha);

    List<ScanLog> findByScanTimestampBetween(Instant start, Instant end);

    long countByDoctorIdAndScanTimestampAfter(String doctorId, Instant since);

    boolean existsByQrId(String qrId);
}
