package com.shiv.springboot_estate.controllers;

import com.shiv.springboot_estate.dto.ApiResponse;
import com.shiv.springboot_estate.dto.UpdateUserRequest;
import com.shiv.springboot_estate.models.Listing;
import com.shiv.springboot_estate.models.User;
import com.shiv.springboot_estate.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Users", description = "Endpoints for managing user profiles and favourites (requires JWT)")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Update user", description = "Updates the profile of the authenticated user. Only the owner may update their own account.")
    @PostMapping("/update/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String id,
                                                        @Valid @RequestBody UpdateUserRequest req,
                                                        HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        User updated = userService.updateUser(id, userId, req);
        return ResponseEntity.ok(ApiResponse.success(200, "User updated successfully", updated));
    }

    @Operation(summary = "Delete user", description = "Deletes the authenticated user's account and clears their session cookie.")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id,
                                                        HttpServletRequest request,
                                                        HttpServletResponse response) {
        String userId = (String) request.getAttribute("userId");
        userService.deleteUser(id, userId, response);
        return ResponseEntity.ok(ApiResponse.success(200, "User has been deleted"));
    }

    @Operation(summary = "Get user by ID", description = "Returns public profile information for the specified user.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable String id) {
        User user = userService.getUser(id);
        return ResponseEntity.ok(ApiResponse.success(200, "User fetched successfully", user));
    }

    @Operation(summary = "Add listing to favourites", description = "Adds the specified listing to the authenticated user's favourites list.")
    @PostMapping("/favorites/{listingId}")
    public ResponseEntity<ApiResponse<List<String>>> addFavorite(@PathVariable String listingId,
                                                                  HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<String> favorites = userService.addFavorite(userId, listingId);
        return ResponseEntity.ok(ApiResponse.success(200, "Added to favorites", favorites));
    }

    @Operation(summary = "Remove listing from favourites", description = "Removes the specified listing from the authenticated user's favourites list.")
    @DeleteMapping("/favorites/{listingId}")
    public ResponseEntity<ApiResponse<List<String>>> removeFavorite(@PathVariable String listingId,
                                                                     HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<String> favorites = userService.removeFavorite(userId, listingId);
        return ResponseEntity.ok(ApiResponse.success(200, "Removed from favorites", favorites));
    }

    @Operation(summary = "Get favourite listings", description = "Returns all listings saved as favourites by the authenticated user.")
    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<Listing>>> getFavorites(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<Listing> listings = userService.getFavoriteListings(userId);
        return ResponseEntity.ok(ApiResponse.success(200, "Favorites fetched successfully", listings));
    }
}
