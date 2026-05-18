package com.shiv.springboot_estate.controllers;

import com.shiv.springboot_estate.dto.ApiResponse;
import com.shiv.springboot_estate.dto.ForgotPasswordRequest;
import com.shiv.springboot_estate.dto.GoogleAuthRequest;
import com.shiv.springboot_estate.dto.ResetPasswordRequest;
import com.shiv.springboot_estate.dto.SigninRequest;
import com.shiv.springboot_estate.dto.SignupRequest;
import com.shiv.springboot_estate.models.User;
import com.shiv.springboot_estate.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequest req) {
        authService.signup(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "User created successfully"));
    }

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<User>> signin(@Valid @RequestBody SigninRequest req,
                                                    HttpServletResponse response) {
        User user = authService.signin(req, response);
        return ResponseEntity.ok(ApiResponse.success(200, "Signed in successfully", user));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<User>> google(@Valid @RequestBody GoogleAuthRequest req,
                                                    HttpServletResponse response) {
        User user = authService.googleAuth(req, response);
        return ResponseEntity.ok(ApiResponse.success(200, "Signed in with Google", user));
    }

    @GetMapping("/signout")
    public ResponseEntity<ApiResponse<Void>> signout(HttpServletResponse response) {
        authService.signout(response);
        return ResponseEntity.ok(ApiResponse.success(200, "User has been logged out"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
        // Always return success to prevent user enumeration
        return ResponseEntity.ok(ApiResponse.success(200,
                "If an account with that email exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success(200, "Password reset successfully. Please sign in."));
    }
}

