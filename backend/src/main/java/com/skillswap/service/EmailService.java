package com.skillswap.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public boolean sendOtpEmail(String toEmail, String otpCode) {
        String subject = "SkillSwap - Your Password Reset OTP Code";
        String body = "Hello,\n\n"
                + "You requested a password reset for your SkillSwap account.\n"
                + "Your 6-digit OTP verification code is:\n\n"
                + "    " + otpCode + "\n\n"
                + "This code is valid for 10 minutes.\n"
                + "If you did not request this reset, please ignore this email.\n\n"
                + "Best regards,\n"
                + "The SkillSwap Team";

        logger.info("=========================================");
        logger.info("PASSWORD RESET OTP GENERATED FOR: {}", toEmail);
        logger.info("OTP CODE: {}", otpCode);
        logger.info("=========================================");

        if (mailSender == null) {
            logger.warn("JavaMailSender not initialized. OTP logged to console above.");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("skillswap.platform@gmail.com");
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            logger.info("Successfully sent OTP email to: {}", toEmail);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }
}
