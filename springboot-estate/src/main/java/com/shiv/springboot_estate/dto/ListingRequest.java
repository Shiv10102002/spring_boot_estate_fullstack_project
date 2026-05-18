package com.shiv.springboot_estate.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ListingRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address must not exceed 200 characters")
    private String address;

    @Min(value = 1, message = "Regular price must be at least 1")
    private double regularPrice;

    @Min(value = 0, message = "Discount price cannot be negative")
    private double discountPrice;

    @Min(value = 1, message = "Must have at least 1 bathroom")
    @Max(value = 20, message = "Cannot exceed 20 bathrooms")
    private int bathrooms;

    @Min(value = 1, message = "Must have at least 1 bedroom")
    @Max(value = 20, message = "Cannot exceed 20 bedrooms")
    private int bedrooms;

    private boolean furnished;
    private boolean parking;

    @NotBlank(message = "Type is required")
    @Pattern(regexp = "^(rent|sale)$", message = "Type must be 'rent' or 'sale'")
    private String type;

    private boolean offer;

    @NotEmpty(message = "At least one image is required")
    @Size(max = 6, message = "Cannot upload more than 6 images")
    private List<@NotBlank(message = "Image URL cannot be blank") String> imageUrls;

    @Min(value = 0, message = "Area cannot be negative")
    private Double area;
}
