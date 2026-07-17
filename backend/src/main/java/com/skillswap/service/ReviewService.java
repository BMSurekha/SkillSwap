package com.skillswap.service;

import com.skillswap.dto.ReviewDto;
import com.skillswap.model.Review;
import com.skillswap.model.Session;
import com.skillswap.model.User;
import com.skillswap.repository.ReviewRepository;
import com.skillswap.repository.SessionRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<ReviewDto> getReviewsForUser(Long userId) {
        return reviewRepository.findByRevieweeId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto addReview(Long sessionId, ReviewDto dto, Long reviewerId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found!"));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found!"));

        // Determine reviewee
        User requestSender = session.getExchangeRequest().getSender();
        User requestReceiver = session.getExchangeRequest().getReceiver();
        User reviewee = requestSender.getId().equals(reviewerId) ? requestReceiver : requestSender;

        Review review = new Review();
        review.setSession(session);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(dto.getRating());
        review.setReviewText(dto.getReviewText());

        Review saved = reviewRepository.save(review);

        // Update average rating for reviewee
        Double averageRating = reviewRepository.getAverageRatingForUser(reviewee.getId());
        if (averageRating != null) {
            reviewee.setAverageRating(Math.round(averageRating * 10.0) / 10.0);
            userRepository.save(reviewee);
        }

        // Notify reviewee
        notificationService.createNotification(reviewee, 
                reviewer.getFullName() + " submitted a rating for your exchange: " + dto.getRating() + " stars.", "REVIEW");

        return convertToDto(saved);
    }

    private ReviewDto convertToDto(Review review) {
        return new ReviewDto(
                review.getId(),
                review.getSession().getId(),
                review.getReviewer().getId(),
                review.getReviewer().getFullName(),
                review.getReviewer().getAvatarUrl(),
                review.getReviewee().getId(),
                review.getRating(),
                review.getReviewText(),
                review.getCreatedAt()
        );
    }
}
