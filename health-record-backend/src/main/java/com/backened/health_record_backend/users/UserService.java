package com.backened.health_record_backend.users;

import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    public User findByMobile(String mobile) {
        return userRepository.findByMobile(mobile).orElse(null);
    }
    
    public User findByUsernameAndRole(String username, String role) {
        return userRepository.findByUsernameAndRole(username, role);
    }
    
    public User findByAbhaNumber(String abhaNumber) {
        return userRepository.findByAbhaNumber(abhaNumber).orElse(null);
    }
    
    public User findByHealthPid(String healthPid) {
        return userRepository.findByHealthPid(healthPid).orElse(null);
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
    
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
