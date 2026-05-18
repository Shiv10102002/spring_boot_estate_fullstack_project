package com.shiv.springboot_estate.dto;

import com.shiv.springboot_estate.models.Listing;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ListingSearchResponse {
    private List<Listing> listings;
    private long total;
    private int page;
    private int totalPages;
}
