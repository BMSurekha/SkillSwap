package com.skillswap.service;

import com.skillswap.dto.SessionDto;
import com.skillswap.model.ExchangeRequest;
import com.skillswap.model.Session;
import com.skillswap.model.User;
import com.skillswap.repository.ExchangeRequestRepository;
import com.skillswap.repository.SessionRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private ExchangeRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<SessionDto> getSessionsForUser(Long userId) {
        return sessionRepository.findAllByUserId(userId).stream()
                .map(session -> convertToDto(session, userId))
                .collect(Collectors.toList());
    }

    public List<SessionDto> getUpcomingSessionsForUser(Long userId) {
        return sessionRepository.findUpcomingSessionsByUserId(userId).stream()
                .map(session -> convertToDto(session, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public SessionDto scheduleSession(Long requestId, SessionDto dto, Long userId) {
        ExchangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found!"));

        if (!request.getStatus().equals("ACCEPTED")) {
            throw new RuntimeException("Can only schedule sessions for accepted exchange requests!");
        }

        Session session = new Session();
        session.setExchangeRequest(request);
        session.setTitle(dto.getTitle());
        session.setDescription(dto.getDescription());
        session.setDateTime(dto.getDateTime());
        session.setDurationMinutes(dto.getDurationMinutes());
        session.setMeetingMode(dto.getMeetingMode());
        session.setMeetingLink(dto.getMeetingLink());
        session.setLocation(dto.getLocation());
        session.setStatus("SCHEDULED");

        Session saved = sessionRepository.save(session);

        // Notify other user
        User partner = request.getSender().getId().equals(userId) ? request.getReceiver() : request.getSender();
        User creator = request.getSender().getId().equals(userId) ? request.getSender() : request.getReceiver();
        notificationService.createNotification(partner, 
                creator.getFullName() + " scheduled a new session: " + session.getTitle(), "SESSION");

        return convertToDto(saved, userId);
    }

    @Transactional
    public SessionDto completeSession(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found!"));

        session.setStatus("COMPLETED");
        
        // Mark the underlying exchange request as completed too
        ExchangeRequest request = session.getExchangeRequest();
        if (!request.getStatus().equals("COMPLETED")) {
            request.setStatus("COMPLETED");
            requestRepository.save(request);
            
            // Increment exchange counters
            User sender = request.getSender();
            User receiver = request.getReceiver();
            
            sender.setCompletedExchanges(sender.getCompletedExchanges() + 1);
            receiver.setCompletedExchanges(receiver.getCompletedExchanges() + 1);
            
            userRepository.save(sender);
            userRepository.save(receiver);
        }

        Session saved = sessionRepository.save(session);
        
        // Notify both
        notificationService.createNotification(request.getSender(), 
                "Session completed! Please rate your experience with " + request.getReceiver().getFullName(), "REVIEW");
        notificationService.createNotification(request.getReceiver(), 
                "Session completed! Please rate your experience with " + request.getSender().getFullName(), "REVIEW");

        return convertToDto(saved, userId);
    }

    @Transactional
    public SessionDto cancelSession(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found!"));

        session.setStatus("CANCELLED");
        Session saved = sessionRepository.save(session);

        ExchangeRequest request = session.getExchangeRequest();
        User partner = request.getSender().getId().equals(userId) ? request.getReceiver() : request.getSender();
        User canceller = request.getSender().getId().equals(userId) ? request.getSender() : request.getReceiver();

        notificationService.createNotification(partner, 
                canceller.getFullName() + " cancelled the session: " + session.getTitle(), "SESSION");

        return convertToDto(saved, userId);
    }

    private SessionDto convertToDto(Session session, Long userId) {
        ExchangeRequest request = session.getExchangeRequest();
        User partner = request.getSender().getId().equals(userId) ? request.getReceiver() : request.getSender();

        return new SessionDto(
                session.getId(),
                request.getId(),
                session.getTitle(),
                session.getDescription(),
                session.getDateTime(),
                session.getDurationMinutes(),
                session.getMeetingMode(),
                session.getMeetingLink(),
                session.getLocation(),
                session.getStatus(),
                partner.getFullName(),
                partner.getAvatarUrl(),
                partner.getId()
        );
    }
}
