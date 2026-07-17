package com.skillswap.service;

import com.skillswap.dto.RequestDto;
import com.skillswap.model.ExchangeRequest;
import com.skillswap.model.User;
import com.skillswap.repository.ExchangeRequestRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RequestService {

    @Autowired
    private ExchangeRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<RequestDto> getRequestsForUser(Long userId) {
        return requestRepository.findAllByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RequestDto createRequest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("You cannot send an exchange request to yourself!");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found!"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found!"));

        // Check if there is already a pending or accepted request
        var existing = requestRepository.findBySenderIdAndReceiverIdAndStatus(senderId, receiverId, "PENDING");
        if (existing.isPresent()) {
            throw new RuntimeException("A request to this user is already pending!");
        }

        ExchangeRequest request = new ExchangeRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus("PENDING");

        ExchangeRequest saved = requestRepository.save(request);

        // Notify receiver
        notificationService.createNotification(receiver, 
                sender.getFullName() + " sent you an exchange request.", "REQUEST");

        return convertToDto(saved);
    }

    @Transactional
    public RequestDto updateRequestStatus(Long requestId, Long userId, String status) {
        ExchangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found!"));

        // Validation: Only receiver can Accept/Reject. Only sender can Cancel.
        if (status.equalsIgnoreCase("ACCEPTED") || status.equalsIgnoreCase("REJECTED")) {
            if (!request.getReceiver().getId().equals(userId)) {
                throw new RuntimeException("Only the request recipient can accept or reject it!");
            }
        } else if (status.equalsIgnoreCase("CANCELLED")) {
            if (!request.getSender().getId().equals(userId)) {
                throw new RuntimeException("Only the sender can cancel the request!");
            }
        }

        request.setStatus(status.toUpperCase());
        ExchangeRequest saved = requestRepository.save(request);

        // Trigger Notifications
        if (status.equalsIgnoreCase("ACCEPTED")) {
            notificationService.createNotification(request.getSender(), 
                    request.getReceiver().getFullName() + " accepted your exchange request! You can now chat and schedule a session.", "MATCH");
        } else if (status.equalsIgnoreCase("REJECTED")) {
            notificationService.createNotification(request.getSender(), 
                    request.getReceiver().getFullName() + " declined your exchange request.", "REQUEST");
        }

        return convertToDto(saved);
    }

    public RequestDto convertToDto(ExchangeRequest request) {
        return new RequestDto(
                request.getId(),
                request.getSender().getId(),
                request.getSender().getFullName(),
                request.getSender().getAvatarUrl(),
                request.getReceiver().getId(),
                request.getReceiver().getFullName(),
                request.getReceiver().getAvatarUrl(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}
