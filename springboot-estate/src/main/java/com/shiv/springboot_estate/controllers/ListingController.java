package com.shiv.springboot_estate.controllers;

import com.shiv.springboot_estate.dto.ApiResponse;
import com.shiv.springboot_estate.dto.ListingRequest;
import com.shiv.springboot_estate.dto.ListingSearchResponse;
import com.shiv.springboot_estate.models.Listing;
import com.shiv.springboot_estate.services.ListingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listing")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Listing>> createListing(@Valid @RequestBody ListingRequest request,
                                                              HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        Listing created = listingService.createListing(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Listing created successfully", created));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<List<Listing>>> getUserListings(@PathVariable String id,
                                                                      HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<Listing> listings = listingService.getUserListings(id, userId);
        return ResponseEntity.ok(ApiResponse.success(200, "Listings fetched successfully", listings));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable String id,
                                                           HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        listingService.deleteListing(id, userId);
        return ResponseEntity.ok(ApiResponse.success(200, "Listing has been deleted"));
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ApiResponse<Listing>> updateListing(@PathVariable String id,
                                                              @Valid @RequestBody ListingRequest request,
                                                              HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        Listing updated = listingService.updateListing(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success(200, "Listing updated successfully", updated));
    }

    @GetMapping("/getListingbyId/{id}")
    public ResponseEntity<ApiResponse<Listing>> getListingById(@PathVariable String id) {
        Listing listing = listingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success(200, "Listing fetched successfully", listing));
    }

    @GetMapping("/getSearchListing")
    public ResponseEntity<ApiResponse<ListingSearchResponse>> searchListings(
            @RequestParam(defaultValue = "") String searchTerm,
            @RequestParam(required = false) String offer,
            @RequestParam(required = false) String furnished,
            @RequestParam(required = false) String parking,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(defaultValue = "9") int limit,
            @RequestParam(defaultValue = "0") int page) {
        ListingSearchResponse result = listingService.searchListings(
                searchTerm, offer, furnished, parking, type, minPrice, maxPrice, sort, order, limit, page);
        return ResponseEntity.ok(ApiResponse.success(200, "Listings fetched successfully", result));
    }
}
