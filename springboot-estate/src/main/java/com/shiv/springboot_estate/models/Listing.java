package com.shiv.springboot_estate.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "listings")
public class Listing {

    @Id
    @JsonProperty("_id")
    private String id;

    private String name;
    private String description;
    private String address;
    private double regularPrice;
    private double discountPrice;
    private int bathrooms;
    private int bedrooms;
    private boolean furnished;
    private boolean parking;
    private String type;
    private boolean offer;
    private List<String> imageUrls;
    private String userRef;
    private Double area;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;
}
