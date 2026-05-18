package com.shiv.springboot_estate.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "users")
public class User {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    @JsonIgnore
    private String password;

    private Role role = Role.BUYER;

    private String avatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    /** Incremented on every password change to invalidate existing JWTs. */
    private int tokenVersion = 0;

    @JsonIgnore
    private List<String> favorites = new ArrayList<>();

    @JsonIgnore
    @Indexed(unique = true, sparse = true)
    private String resetPasswordTokenHash;

    @JsonIgnore
    private Date resetPasswordExpiry;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;
}
