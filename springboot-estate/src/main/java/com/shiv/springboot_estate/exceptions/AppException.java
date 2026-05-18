package com.shiv.springboot_estate.exceptions;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {

    private final int statuscode;

    public AppException(int statuscode, String message) {
        super(message);
        this.statuscode = statuscode;
    }
}
