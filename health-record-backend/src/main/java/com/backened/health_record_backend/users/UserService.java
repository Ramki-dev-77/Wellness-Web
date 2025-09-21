package com.backened.health_record_backend.users;

import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public User getByAbhaNumber(String abhaNumber) {
        return userRepository.findByAbhaNumber(abhaNumber)
                .orElseThrow(() -> new RuntimeException("User not found with ABHA: " + abhaNumber));
    }

    public User getByFhirPatientId(String fhirPatientId) {
        return userRepository.findByFhirPatientId(fhirPatientId)
                .orElseThrow(() -> new RuntimeException("User not found with Patient ID: " + fhirPatientId));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // FIXED: Remove the duplicate declaration and keep only the implementation
    public User findByUsernameAndRole(String username, String role) {
        return userRepository.findByUsernameAndRole(username, role);
    }
    public User findByMobile(String mobile) {
        return userRepository.findByMobile(mobile)
                .orElse(null); // Return null if not found
    }
}
