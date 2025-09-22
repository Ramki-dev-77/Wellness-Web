package com.backened.health_record_backend.doctors;

import org.springframework.stereotype.Service;

import com.backened.health_record_backend.users.User;
import com.backened.health_record_backend.users.UserRepository;

@Service
public class DoctorService {
    
    private final UserRepository userRepository;
    
    public DoctorService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    public User findByUsernameAndRole(String username, String role) {
        return userRepository.findByUsernameAndRole(username, role);
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
}
