package com.shiv.springboot_estate.services;

import com.shiv.springboot_estate.dto.UpdateUserRequest;
import com.shiv.springboot_estate.exceptions.AppException;
import com.shiv.springboot_estate.models.Listing;
import com.shiv.springboot_estate.models.User;
import com.shiv.springboot_estate.repositories.ListingRepository;
import com.shiv.springboot_estate.repositories.UserRepository;
import com.shiv.springboot_estate.utils.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final CookieUtil cookieUtil;
    private final MongoTemplate mongoTemplate;

    public User updateUser(String pathId, String userId, UpdateUserRequest req) {
        if (!userId.equals(pathId)) {
            throw new AppException(401, "You can only update your own account");
        }

        User user = userRepository.findById(pathId)
                .orElseThrow(() -> new AppException(404, "User not found"));

        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            String newUsername = req.getUsername().trim();
            if (!newUsername.equals(user.getUsername())) {
                userRepository.findByUsername(newUsername)
                        .ifPresent(u -> { throw new AppException(409, "Username is already taken"); });
            }
            user.setUsername(newUsername);
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String newEmail = req.getEmail().trim().toLowerCase();
            if (!newEmail.equals(user.getEmail())) {
                userRepository.findByEmail(newEmail)
                        .ifPresent(u -> { throw new AppException(409, "Email is already registered"); });
            }
            user.setEmail(newEmail);
        }

        if (req.getAvatar() != null && !req.getAvatar().isBlank()) {
            user.setAvatar(req.getAvatar());
        }

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteUser(String pathId, String userId, HttpServletResponse response) {
        if (!userId.equals(pathId)) {
            throw new AppException(401, "You can only delete your own account");
        }
        userRepository.deleteById(pathId);
        response.addCookie(cookieUtil.clearAccessTokenCookie());
    }

    public User getUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(404, "User not found"));
    }

    public List<String> addFavorite(String userId, String listingId) {
        listingRepository.findById(listingId)
                .orElseThrow(() -> new AppException(404, "Listing not found"));
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(userId)),
                new Update().addToSet("favorites", listingId),
                User.class
        );
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(404, "User not found"))
                .getFavorites();
    }

    public List<String> removeFavorite(String userId, String listingId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(userId)),
                new Update().pull("favorites", listingId),
                User.class
        );
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(404, "User not found"))
                .getFavorites();
    }

    public List<Listing> getFavoriteListings(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(404, "User not found"));
        List<String> favorites = user.getFavorites();
        if (favorites == null || favorites.isEmpty()) return List.of();
        List<Listing> listings = new ArrayList<>(listingRepository.findAllById(favorites));
        // preserve wishlist order and filter out deleted listings
        List<String> validIds = listings.stream().map(Listing::getId).toList();
        listings.sort((a, b) -> {
            int ia = favorites.indexOf(a.getId());
            int ib = favorites.indexOf(b.getId());
            return Integer.compare(ia, ib);
        });
        return listings;
    }
}
