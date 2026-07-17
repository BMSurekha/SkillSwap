package com.skillswap.service;

import com.skillswap.dto.MessageDto;
import com.skillswap.dto.UserDto;
import com.skillswap.model.Message;
import com.skillswap.model.User;
import com.skillswap.repository.MessageRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    public List<MessageDto> getChatHistory(Long userId, Long partnerId) {
        // Mark partner messages as read
        List<Message> history = messageRepository.findChatHistory(userId, partnerId);
        history.stream()
                .filter(m -> m.getReceiver().getId().equals(userId) && !m.getIsRead())
                .forEach(m -> {
                    m.setIsRead(true);
                    messageRepository.save(m);
                });
        
        return history.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(Long senderId, Long receiverId, MessageDto dto) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found!"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found!"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(dto.getContent());
        message.setFileUrl(dto.getFileUrl());
        message.setIsRead(false);

        Message saved = messageRepository.save(message);

        // Notify receiver of new message
        notificationService.createNotification(receiver, 
                "New message from " + sender.getFullName() + ": " + 
                (dto.getContent().length() > 30 ? dto.getContent().substring(0, 27) + "..." : dto.getContent()), 
                "MESSAGE");

        return convertToDto(saved);
    }

    public List<UserDto> getChatContacts(Long userId) {
        List<Long> contactIds = messageRepository.findConnectedUserIds(userId);
        return contactIds.stream()
                .map(id -> userService.getUserDtoById(id))
                .collect(Collectors.toList());
    }

    private MessageDto convertToDto(Message message) {
        return new MessageDto(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getReceiver().getId(),
                message.getContent(),
                message.getFileUrl(),
                message.getIsRead(),
                message.getCreatedAt()
        );
    }
}
