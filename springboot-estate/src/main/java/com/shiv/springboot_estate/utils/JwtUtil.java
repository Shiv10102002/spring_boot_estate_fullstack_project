package com.shiv.springboot_estate.utils;

import com.shiv.springboot_estate.exceptions.AppException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration:604800000}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public String generateToken(String userId, int tokenVersion) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId)
                .claim("tv", tokenVersion)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new AppException(403, "Forbidden");
        }
    }

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    public int extractTokenVersion(String token) {
        Object tv = parseClaims(token).get("tv");
        return tv != null ? ((Number) tv).intValue() : 0;
    }
}
