package com.shiv.springboot_estate.services;

import com.shiv.springboot_estate.dto.ListingRequest;
import com.shiv.springboot_estate.dto.ListingSearchResponse;
import com.shiv.springboot_estate.exceptions.AppException;
import com.shiv.springboot_estate.models.Listing;
import com.shiv.springboot_estate.models.Role;
import com.shiv.springboot_estate.models.User;
import com.shiv.springboot_estate.repositories.ListingRepository;
import com.shiv.springboot_estate.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "regularPrice", "discountPrice");

    private void requireOwnerRole(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(404, "User not found"));
        if (user.getRole() != Role.OWNER) {
            throw new AppException(403, "Only property owners can manage listings");
        }
    }

    private Listing mapFromRequest(ListingRequest req) {
        Listing listing = new Listing();
        listing.setName(req.getName());
        listing.setDescription(req.getDescription());
        listing.setAddress(req.getAddress());
        listing.setRegularPrice(req.getRegularPrice());
        listing.setDiscountPrice(req.getDiscountPrice());
        listing.setBathrooms(req.getBathrooms());
        listing.setBedrooms(req.getBedrooms());
        listing.setFurnished(req.isFurnished());
        listing.setParking(req.isParking());
        listing.setType(req.getType());
        listing.setOffer(req.isOffer());
        listing.setImageUrls(req.getImageUrls());
        listing.setArea(req.getArea());
        return listing;
    }

    private void validatePricing(ListingRequest req) {
        if (req.isOffer() && req.getDiscountPrice() >= req.getRegularPrice()) {
            throw new AppException(400, "Discount price must be lower than regular price");
        }
    }

    public Listing createListing(ListingRequest req, String userId) {
        requireOwnerRole(userId);
        validatePricing(req);
        Listing listing = mapFromRequest(req);
        listing.setUserRef(userId);
        return listingRepository.save(listing);
    }

    public List<Listing> getUserListings(String pathId, String userId) {
        if (!userId.equals(pathId)) {
            throw new AppException(401, "You can only view your own listings!");
        }
        return listingRepository.findByUserRef(pathId);
    }

    public void deleteListing(String listingId, String userId) {
        requireOwnerRole(userId);
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new AppException(404, "Listing not found"));

        if (!userId.equals(listing.getUserRef())) {
            throw new AppException(401, "You can only delete your own listings!");
        }

        listingRepository.deleteById(listingId);
    }

    public Listing updateListing(String listingId, String userId, ListingRequest req) {
        requireOwnerRole(userId);
        validatePricing(req);
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new AppException(404, "Listing not found"));

        if (!userId.equals(listing.getUserRef())) {
            throw new AppException(401, "You can only update your own listings!");
        }

        listing.setName(req.getName());
        listing.setDescription(req.getDescription());
        listing.setAddress(req.getAddress());
        listing.setRegularPrice(req.getRegularPrice());
        listing.setDiscountPrice(req.getDiscountPrice());
        listing.setBathrooms(req.getBathrooms());
        listing.setBedrooms(req.getBedrooms());
        listing.setFurnished(req.isFurnished());
        listing.setParking(req.isParking());
        listing.setType(req.getType());
        listing.setOffer(req.isOffer());
        listing.setImageUrls(req.getImageUrls());
        listing.setArea(req.getArea());

        return listingRepository.save(listing);
    }

    public Listing getListingById(String id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new AppException(404, "Listing not found"));
    }

    public ListingSearchResponse searchListings(String searchTerm, String offer, String furnished,
                                                String parking, String type, Double minPrice, Double maxPrice,
                                                String sort, String order, int limit, int page) {
        limit = Math.min(Math.max(limit, 1), 50);
        page = Math.max(page, 0);

        List<Criteria> criteriaList = buildCriteria(searchTerm, offer, furnished, parking, type, minPrice, maxPrice);

        Query baseQuery = new Query();
        if (!criteriaList.isEmpty()) {
            baseQuery.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(baseQuery, Listing.class);

        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = ALLOWED_SORT_FIELDS.contains(sort) ? sort : "createdAt";
        baseQuery.with(Sort.by(direction, sortField));
        baseQuery.skip((long) page * limit).limit(limit);

        List<Listing> listings = mongoTemplate.find(baseQuery, Listing.class);
        int totalPages = (int) Math.ceil((double) total / limit);

        return new ListingSearchResponse(listings, total, page, totalPages);
    }

    private List<Criteria> buildCriteria(String searchTerm, String offer, String furnished,
                                         String parking, String type, Double minPrice, Double maxPrice) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (searchTerm != null && !searchTerm.isBlank()) {
            String escapedTerm = Pattern.quote(searchTerm.trim());
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("name").regex(escapedTerm, "i"),
                    Criteria.where("address").regex(escapedTerm, "i"),
                    Criteria.where("description").regex(escapedTerm, "i")
            ));
        }

        if ("true".equals(offer)) criteriaList.add(Criteria.where("offer").is(true));
        if ("true".equals(furnished)) criteriaList.add(Criteria.where("furnished").is(true));
        if ("true".equals(parking)) criteriaList.add(Criteria.where("parking").is(true));

        if (type != null && !type.isBlank() && !"all".equals(type)) {
            criteriaList.add(Criteria.where("type").is(type));
        }

        if (minPrice != null && maxPrice != null) {
            criteriaList.add(Criteria.where("regularPrice").gte(minPrice).lte(maxPrice));
        } else if (minPrice != null) {
            criteriaList.add(Criteria.where("regularPrice").gte(minPrice));
        } else if (maxPrice != null) {
            criteriaList.add(Criteria.where("regularPrice").lte(maxPrice));
        }

        return criteriaList;
    }
}
