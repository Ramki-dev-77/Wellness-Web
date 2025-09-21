package com.backened.health_record_backend.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByAbhaNumber(String abhaNumber);
    Optional<User> findByFhirPatientId(String fhirPatientId);
    List<User> findByRole(String role);
    User findByUsernameAndRole(String username, String role);
    List<User> findByRoleAndRegion(String role, String region);
    long countByRole(String role);
    long countByRoleAndRegion(String role, String region);

    // ← ADD THIS MISSING METHOD
    Optional<User> findByMobile(String mobile);
}
