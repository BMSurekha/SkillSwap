package com.skillswap.repository;

import com.skillswap.model.ExchangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRequestRepository extends JpaRepository<ExchangeRequest, Long> {
    List<ExchangeRequest> findBySenderId(Long senderId);
    List<ExchangeRequest> findByReceiverId(Long receiverId);
    
    @Query("SELECT r FROM ExchangeRequest r WHERE r.sender.id = :userId OR r.receiver.id = :userId")
    List<ExchangeRequest> findAllByUserId(Long userId);
    
    Optional<ExchangeRequest> findBySenderIdAndReceiverIdAndStatus(Long senderId, Long receiverId, String status);
}
