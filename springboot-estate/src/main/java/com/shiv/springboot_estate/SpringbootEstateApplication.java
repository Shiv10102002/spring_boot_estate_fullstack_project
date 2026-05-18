package com.shiv.springboot_estate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class SpringbootEstateApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringbootEstateApplication.class, args);
	}

}
