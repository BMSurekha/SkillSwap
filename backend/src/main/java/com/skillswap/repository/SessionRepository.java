package com.skillswap.repository;

import com.skillswap.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByExchangeRequestId(Long requestId);
    
    @Query("SELECT s FROM Session s WHERE s.exchangeRequest.sender.id = :userId OR s.exchangeRequest.receiver.id = :userId")
    List<Session> findAllByUserId(Long userId);
    
    @Query("SELECT s FROM Session s WHERE (s.exchangeRequest.sender.id = :userId OR s.exchangeRequest.receiver.id = :userId) AND s.status = 'SCHEDULED' ORDER BY s.dateTime ASC")
    List<Session> findUpcomingSessionsByUserId(Long userId);
}
