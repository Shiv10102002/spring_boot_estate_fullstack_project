package com.shiv.springboot_estate.services;

import com.shiv.springboot_estate.dto.ForgotPasswordRequest;
import com.shiv.springboot_estate.dto.GoogleAuthRequest;
import com.shiv.springboot_estate.dto.ResetPasswordRequest;
import com.shiv.springboot_estate.dto.SigninRequest;
import com.shiv.springboot_estate.dto.SignupRequest;
import com.shiv.springboot_estate.exceptions.AppException;
import com.shiv.springboot_estate.models.Role;
import com.shiv.springboot_estate.models.User;
import com.shiv.springboot_estate.repositories.UserRepository;
import com.shiv.springboot_estate.utils.CookieUtil;
import com.shiv.springboot_estate.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Date;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final CookieUtil cookieUtil;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String appBaseUrl;

    public AuthService(UserRepository userRepository,
                       JwtUtil jwtUtil,
                       CookieUtil cookieUtil,
                       BCryptPasswordEncoder passwordEncoder,
                       EmailService emailService,
                       @Value("${app.base-url:http://localhost:5173}") String appBaseUrl) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.cookieUtil = cookieUtil;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.appBaseUrl = appBaseUrl;
    }

    public void signup(SignupRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        String normalizedUsername = req.getUsername().trim();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new AppException(409, "Email is already registered");
        }
        if (userRepository.findByUsername(normalizedUsername).isPresent()) {
            throw new AppException(409, "Username is already taken");
        }

        User user = new User();
        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        // Only BUYER and OWNER are valid self-selected roles
        Role role = Role.OWNER.name().equalsIgnoreCase(req.getRoleName()) ? Role.OWNER : Role.BUYER;
        user.setRole(role);
        userRepository.save(user);
    }

    public User signin(SigninRequest req, HttpServletResponse response) {
        // Use the same error message for both cases to prevent user enumeration
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new AppException(401, "Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new AppException(401, "Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getTokenVersion());
        response.addCookie(cookieUtil.createAccessTokenCookie(token));
        return user;
    }

    public User googleAuth(GoogleAuthRequest req, HttpServletResponse response) {
        // WARNING: This endpoint trusts client-supplied email/name/photo without verifying a Google ID token.
        // A malicious client can impersonate any user by sending their email.
        // TODO: Replace req.getEmail() with claims extracted from a verified Google ID token
        //       (use google-auth-library or Spring Security OAuth2 to verify the token server-side).
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        Optional<User> existing = userRepository.findByEmail(normalizedEmail);

        User user;
        if (existing.isPresent()) {
            user = existing.get();
        } else {
            String randomPassword = generateRandomString(16);
            String username = req.getName().trim().toLowerCase().replaceAll("\\s+", "")
                    + generateRandomString(4);

            user = new User();
            user.setUsername(username);
            user.setEmail(normalizedEmail);
            user.setPassword(passwordEncoder.encode(randomPassword));
            user.setAvatar(req.getPhoto());
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getTokenVersion());
        response.addCookie(cookieUtil.createAccessTokenCookie(token));
        return user;
    }

    public void signout(HttpServletResponse response) {
        response.addCookie(cookieUtil.clearAccessTokenCookie());
    }

    /**
     * Initiates password reset. Always returns success to prevent user enumeration.
     * Only sends email if a user with the given email exists.
     */
    public void forgotPassword(ForgotPasswordRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        Optional<User> optUser = userRepository.findByEmail(normalizedEmail);

        if (optUser.isEmpty()) {
            // Silent — do not reveal whether the email is registered
            return;
        }

        User user = optUser.get();
        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        user.setResetPasswordTokenHash(tokenHash);
        user.setResetPasswordExpiry(new Date(System.currentTimeMillis() + 3_600_000L)); // 1 hour
        userRepository.save(user);

        String resetUrl = appBaseUrl + "/reset-password?token=" + rawToken;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetUrl);
    }

    /**
     * Validates token and updates password. Increments tokenVersion to invalidate existing JWTs.
     */
    public void resetPassword(ResetPasswordRequest req) {
        String tokenHash = hashToken(req.getToken().trim());

        User user = userRepository.findByResetPasswordTokenHash(tokenHash)
                .orElseThrow(() -> new AppException(400, "Invalid or expired reset token"));

        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().before(new Date())) {
            throw new AppException(400, "Reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1); // Invalidate all existing JWTs
        user.setResetPasswordTokenHash(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32]; // 256-bit token
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private String generateRandomString(int length) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
