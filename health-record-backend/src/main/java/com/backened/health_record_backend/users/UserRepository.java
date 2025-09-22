package com.backened.health_record_backend.users;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByAbhaNumber(String abhaNumber);
    Optional<User> findByHealthPid(String healthPid);
    Optional<User> findByFhirPatientId(String fhirPatientId);
    List<User> findByRole(String role);
    User findByUsernameAndRole(String username, String role);
    List<User> findByRoleAndRegion(String role, String region);
    long countByRole(String role);
    long countByRoleAndRegion(String role, String region);

    // Find user by mobile/email
    Optional<User> findByMobile(String mobile);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByAbhaNumber(String abhaNumber);
}
