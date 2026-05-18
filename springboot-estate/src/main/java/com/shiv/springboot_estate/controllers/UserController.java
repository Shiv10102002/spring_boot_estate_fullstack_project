package com.shiv.springboot_estate.controllers;

import com.shiv.springboot_estate.dto.ApiResponse;
import com.shiv.springboot_estate.dto.UpdateUserRequest;
import com.shiv.springboot_estate.models.Listing;
import com.shiv.springboot_estate.models.User;
import com.shiv.springboot_estate.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/update/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String id,
                                                        @Valid @RequestBody UpdateUserRequest req,
                                                        HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        User updated = userService.updateUser(id, userId, req);
        return ResponseEntity.ok(ApiResponse.success(200, "User updated successfully", updated));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id,
                                                        HttpServletRequest request,
                                                        HttpServletResponse response) {
        String userId = (String) request.getAttribute("userId");
        userService.deleteUser(id, userId, response);
        return ResponseEntity.ok(ApiResponse.success(200, "User has been deleted"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable String id) {
        User user = userService.getUser(id);
        return ResponseEntity.ok(ApiResponse.success(200, "User fetched successfully", user));
    }

    @PostMapping("/favorites/{listingId}")
    public ResponseEntity<ApiResponse<List<String>>> addFavorite(@PathVariable String listingId,
                                                                  HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<String> favorites = userService.addFavorite(userId, listingId);
        return ResponseEntity.ok(ApiResponse.success(200, "Added to favorites", favorites));
    }

    @DeleteMapping("/favorites/{listingId}")
    public ResponseEntity<ApiResponse<List<String>>> removeFavorite(@PathVariable String listingId,
                                                                     HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<String> favorites = userService.removeFavorite(userId, listingId);
        return ResponseEntity.ok(ApiResponse.success(200, "Removed from favorites", favorites));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<Listing>>> getFavorites(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<Listing> listings = userService.getFavoriteListings(userId);
        return ResponseEntity.ok(ApiResponse.success(200, "Favorites fetched successfully", listings));
    }
}
