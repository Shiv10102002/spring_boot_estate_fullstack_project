package com.shiv.springboot_estate.controllers;

import com.shiv.springboot_estate.dto.ApiResponse;
import com.shiv.springboot_estate.dto.ListingRequest;
import com.shiv.springboot_estate.dto.ListingSearchResponse;
import com.shiv.springboot_estate.models.Listing;
import com.shiv.springboot_estate.services.ListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Listings", description = "Endpoints for creating, updating, deleting, and searching property listings")
public class ListingController {

    private final ListingService listingService;

    @Operation(summary = "Create a listing", description = "Creates a new property listing for the authenticated user.")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Listing>> createListing(@Valid @RequestBody ListingRequest request,
                                                              HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        Listing created = listingService.createListing(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Listing created successfully", created));
    }

    @Operation(summary = "Get listings by user", description = "Returns all listings owned by the specified user. Requires authentication.")
    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<List<Listing>>> getUserListings(@PathVariable String id,
                                                                      HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<Listing> listings = listingService.getUserListings(id, userId);
        return ResponseEntity.ok(ApiResponse.success(200, "Listings fetched successfully", listings));
    }

    @Operation(summary = "Delete a listing", description = "Deletes the specified listing. Only the listing owner may delete it.")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable String id,
                                                           HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        listingService.deleteListing(id, userId);
        return ResponseEntity.ok(ApiResponse.success(200, "Listing has been deleted"));
    }

    @Operation(summary = "Update a listing", description = "Updates the details of an existing listing. Only the listing owner may update it.")
    @PostMapping("/update/{id}")
    public ResponseEntity<ApiResponse<Listing>> updateListing(@PathVariable String id,
                                                              @Valid @RequestBody ListingRequest request,
                                                              HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        Listing updated = listingService.updateListing(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success(200, "Listing updated successfully", updated));
    }

    @Operation(summary = "Get listing by ID", description = "Returns full details for a single listing by its ID.")
    @GetMapping("/getListingbyId/{id}")
    public ResponseEntity<ApiResponse<Listing>> getListingById(@PathVariable String id) {
        Listing listing = listingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success(200, "Listing fetched successfully", listing));
    }

    @Operation(summary = "Search listings", description = "Returns a paginated list of listings matching the given filters (searchTerm, type, price range, offer, furnished, parking).")
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
