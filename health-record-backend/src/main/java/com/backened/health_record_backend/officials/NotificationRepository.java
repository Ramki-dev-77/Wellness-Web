package com.backened.health_record_backend.officials;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    List<Notification> findByActiveOrderByCreatedAtDesc(boolean active);

    // Get notifications for a specific region or global notifications
    @Query("SELECT n FROM Notification n WHERE n.active = true AND (n.region = :region OR n.region IS NULL) ORDER BY n.createdAt DESC")
    List<Notification> findActiveNotificationsForRegion(@Param("region") String region);

    // Get all active notifications
    @Query("SELECT n FROM Notification n WHERE n.active = true ORDER BY n.createdAt DESC")
    List<Notification> findAllActiveNotifications();

    long countByCreatedByAndActive(String createdBy, boolean active);
}
