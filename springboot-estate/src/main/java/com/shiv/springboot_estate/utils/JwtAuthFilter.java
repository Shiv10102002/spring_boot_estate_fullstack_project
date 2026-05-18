package com.shiv.springboot_estate.utils;

import com.shiv.springboot_estate.exceptions.AppException;
import com.shiv.springboot_estate.models.User;
import com.shiv.springboot_estate.repositories.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            Cookie cookie = WebUtils.getCookie(request, "access_token");
            if (cookie == null || cookie.getValue().isBlank()) {
                writeError(response, 401, "Unauthorized access");
                return;
            }
            String token = cookie.getValue();
            String userId = jwtUtil.extractUserId(token);
            int jwtTokenVersion = jwtUtil.extractTokenVersion(token);

            // Verify token version matches DB — rejects JWTs issued before a password reset
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(401, "Unauthorized access"));
            if (jwtTokenVersion != user.getTokenVersion()) {
                writeError(response, 401, "Session expired. Please sign in again.");
                return;
            }

            request.setAttribute("userId", userId);
            filterChain.doFilter(request, response);
        } catch (AppException ex) {
            writeError(response, ex.getStatuscode(), ex.getMessage());
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        return path.startsWith("/api/v1/auth/")
                || ("GET".equals(method) && path.startsWith("/api/v1/listing/getListingbyId/"))
                || ("GET".equals(method) && path.equals("/api/v1/listing/getSearchListing"));
    }

    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        String escaped = message.replace("\"", "\\\"");
        response.getWriter().write(
                String.format("{\"success\":false,\"statuscode\":%d,\"message\":\"%s\",\"data\":null}",
                        status, escaped));
    }
}
