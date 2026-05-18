package com.shiv.springboot_estate.services;

import com.shiv.springboot_estate.exceptions.AppException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String username, String resetUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("ShivEstate — Password Reset Request");
            helper.setText(buildHtmlEmail(username, resetUrl), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new AppException(503, "Failed to send reset email. Please try again later.");
        }
    }

    private String buildHtmlEmail(String username, String resetUrl) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
                  <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 32px;">
                    <h2 style="color: #334155;">ShivEstate — Password Reset</h2>
                    <p style="color: #475569;">Hi <strong>%s</strong>,</p>
                    <p style="color: #475569;">
                      We received a request to reset your password. Click the button below to choose a new one.
                      This link expires in <strong>1 hour</strong>.
                    </p>
                    <a href="%s"
                       style="display:inline-block;padding:12px 24px;background:#334155;color:#fff;
                              text-decoration:none;border-radius:6px;margin:16px 0;">
                      Reset Password
                    </a>
                    <p style="color: #94a3b8; font-size: 13px;">
                      If you didn't request a password reset, you can safely ignore this email.<br>
                      This link will expire automatically.
                    </p>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">ShivEstate &mdash; Real Estate Platform</p>
                  </div>
                </body>
                </html>
                """.formatted(username, resetUrl);
    }
}
