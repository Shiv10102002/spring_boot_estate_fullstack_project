package com.shiv.springboot_estate.repositories;

import com.shiv.springboot_estate.models.Listing;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ListingRepository extends MongoRepository<Listing, String> {
    List<Listing> findByUserRef(String userRef);
}
