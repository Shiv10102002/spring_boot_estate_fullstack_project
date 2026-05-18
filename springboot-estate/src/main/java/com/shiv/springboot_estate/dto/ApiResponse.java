package com.shiv.springboot_estate.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final int statuscode;
    private final String message;
    private final T data;

    private ApiResponse(boolean success, int statuscode, String message, T data) {
        this.success = success;
        this.statuscode = statuscode;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(int statuscode, String message, T data) {
        return new ApiResponse<>(true, statuscode, message, data);
    }

    public static ApiResponse<Void> success(int statuscode, String message) {
        return new ApiResponse<>(true, statuscode, message, null);
    }

    public static ApiResponse<Void> error(int statuscode, String message) {
        return new ApiResponse<>(false, statuscode, message, null);
    }
}
