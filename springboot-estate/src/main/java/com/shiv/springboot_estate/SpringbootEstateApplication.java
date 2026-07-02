package com.shiv.springboot_estate;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class SpringbootEstateApplication {

	// Logs the URI Spring Boot actually resolved — not just the raw env var.
	@Value("${spring.mongodb.uri:NOT SET}")
	private String mongoUri;

	@PostConstruct
	public void checkEnv() {
		String masked = mongoUri.length() > 20
				? mongoUri.substring(0, 20) + "..." : mongoUri;
		System.out.println("[startup] spring.data.mongodb.uri resolved to: " + masked);
	}

	public static void main(String[] args) {
		SpringApplication.run(SpringbootEstateApplication.class, args);
	}

}
