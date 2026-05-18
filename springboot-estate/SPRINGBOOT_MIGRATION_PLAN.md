# MERN Estate — Spring Boot Backend Migration Plan
## (GitHub Copilot Prompt Guide)

---

## Context for Every Prompt

> Paste this context block at the top whenever you start a new Copilot chat session:

```
I am rebuilding the backend of a MERN Real Estate app in Java Spring Boot.
The React frontend must work with ZERO changes. Key constraints:
- Server must run on port 3000
- All endpoints are prefixed with /api/v1/
- Auth uses an httpOnly cookie named "access_token" (JWT)
- User JSON responses must include "_id" (not "id") — use @JsonProperty("_id")
- Error responses must be: { "success": false, "statuscode": <int>, "message": "<string>" }
- CORS must allow http://localhost:5173 with credentials (for Vite dev proxy)
- MongoDB database name: "esatedb"
- Stack: Spring Boot 3.x, Java 17, Maven, Spring Data MongoDB, JJWT, BCrypt
```

---

## Step 0 — Create the Project (do this manually)

Go to https://start.spring.io and generate a project with:

| Setting | Value |
|---|---|
| Project | Maven |
| Language | Java |
| Spring Boot | 3.x (latest stable) |
| Group | `com.estate` |
| Artifact | `springboot-estate` |
| Packaging | Jar |
| Java | 17 |
| Dependencies | Spring Web, Spring Data MongoDB, Validation |

Download, unzip, and open the project in your IDE.

Then **manually add** these dependencies to `pom.xml` inside `<dependencies>`:

```xml
<!-- JJWT for JWT signing/verification -->
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-api</artifactId>
  <version>0.11.5</version>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-impl</artifactId>
  <version>0.11.5</version>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-jackson</artifactId>
  <version>0.11.5</version>
  <scope>runtime</scope>
</dependency>

<!-- BCrypt for password hashing (Spring Security Crypto only, no full Security) -->
<dependency>
  <groupId>org.springframework.security</groupId>
  <artifactId>spring-security-crypto</artifactId>
</dependency>
```

---

## Step 1 — application.properties

**📂 File:** `src/main/resources/application.properties`

**💬 Copilot Prompt:**
```
Create src/main/resources/application.properties for a Spring Boot 3 app with:
- server.port=3000
- spring.data.mongodb.uri reads from environment variable MONGODB_URI, appended with /esatedb
- A custom property jwt.secret that reads from environment variable JWT_SECRET
- spring.jackson.serialization.write-dates-as-timestamps=false  (ISO date format)
```

**✅ Expected result:**
```properties
server.port=3000
spring.data.mongodb.uri=${MONGODB_URI}/esatedb
jwt.secret=${JWT_SECRET}
spring.jackson.serialization.write-dates-as-timestamps=false
```

Also create a `.env` file (do NOT commit this) with your actual values:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net
JWT_SECRET=your_secret_key_here
```

---

## Step 2 — CORS Configuration

**📂 File:** `src/main/java/com/estate/config/CorsConfig.java`

**💬 Copilot Prompt:**
```
Create CorsConfig.java in package com.estate.config.
It should be a @Configuration class implementing WebMvcConfigurer.
Override addCorsMappings to:
- Allow all paths ("/**")
- Allow origin "http://localhost:5173"
- Allow all headers
- Allow methods: GET, POST, PUT, DELETE, OPTIONS
- Set allowCredentials to true (required for httpOnly cookie auth)
```

---

## Step 3 — Exception Handling

**📂 Files:**
- `src/main/java/com/estate/exceptions/AppException.java`
- `src/main/java/com/estate/exceptions/GlobalExceptionHandler.java`

**💬 Copilot Prompt:**
```
Create two files in package com.estate.exceptions:

1. AppException.java — extends RuntimeException, has two fields: int statuscode and String message.
   Constructor takes (int statuscode, String message).

2. GlobalExceptionHandler.java — annotated with @RestControllerAdvice.
   Handle AppException and return ResponseEntity with this exact JSON body:
   { "success": false, "statuscode": <from exception>, "message": "<from exception>" }
   Also add a generic Exception handler that returns statuscode 500 and message "Internal Server Error".
```

---

## Step 4 — User Model & Repository

**📂 Files:**
- `src/main/java/com/estate/models/User.java`
- `src/main/java/com/estate/repositories/UserRepository.java`

**💬 Copilot Prompt:**
```
Create User.java in package com.estate.models.
- Annotate with @Document(collection = "users")
- Fields: id (String), username (String), email (String), password (String), avatar (String), createdAt (Date), updatedAt (Date)
- The "id" field must be annotated with @Id AND @JsonProperty("_id") so JSON output uses "_id"
- The "password" field must be annotated with @JsonIgnore so it is never sent to the client
- Set default value for avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
- Use @CreatedDate for createdAt and @LastModifiedDate for updatedAt, and add @EnableMongoAuditing to the main app class

Then create UserRepository.java in package com.estate.repositories:
- Extends MongoRepository<User, String>
- Add method: Optional<User> findByEmail(String email)
- Add method: Optional<User> findByUsername(String username)
```

---

## Step 5 — Listing Model & Repository

**📂 Files:**
- `src/main/java/com/estate/models/Listing.java`
- `src/main/java/com/estate/repositories/ListingRepository.java`

**💬 Copilot Prompt:**
```
Create Listing.java in package com.estate.models.
- Annotate with @Document(collection = "listings")
- Fields:
    id (String) — @Id and @JsonProperty("_id")
    name (String)
    description (String)
    address (String)
    regularPrice (double)
    discountPrice (double)
    bathrooms (int)
    bedrooms (int)
    furnished (boolean)
    parking (boolean)
    type (String) — values will be "sale" or "rent"
    offer (boolean)
    imageUrls (List<String>)
    userRef (String) — stores the owner's user _id
    createdAt (Date) — @CreatedDate
    updatedAt (Date) — @LastModifiedDate

Then create ListingRepository.java in package com.estate.repositories:
- Extends MongoRepository<Listing, String>
- Add method: List<Listing> findByUserRef(String userRef)
```

---

## Step 6 — DTO Classes

**📂 Package:** `src/main/java/com/estate/dto/`

**💬 Copilot Prompt:**
```
Create the following DTO (Data Transfer Object) classes in package com.estate.dto.
Use simple POJOs with fields, getters, and setters (or Lombok @Data if available):

1. SignupRequest.java — fields: String username, String email, String password

2. SigninRequest.java — fields: String email, String password

3. GoogleAuthRequest.java — fields: String name, String email, String photo

4. UpdateUserRequest.java — fields: String username, String email, String password, String avatar
   (all optional — can be null if not being updated)
```

---

## Step 7 — JWT Utility

**📂 File:** `src/main/java/com/estate/utils/JwtUtil.java`

**💬 Copilot Prompt:**
```
Create JwtUtil.java in package com.estate.utils.
- Annotate with @Component
- Inject jwt.secret from application.properties using @Value("${jwt.secret}")
- Method: String generateToken(String userId) — signs a JWT with subject = userId, using HS256 and the secret key. No expiry (to match original Node.js behavior).
- Method: String extractUserId(String token) — verifies the token and returns the subject (userId). Throws AppException(403, "Forbidden") if token is invalid.
Use io.jsonwebtoken (JJWT 0.11.5) library. Convert the secret string to a Key using Keys.hmacShaKeyFor(secret.getBytes()).
```

---

## Step 8 — Cookie Utility

**📂 File:** `src/main/java/com/estate/utils/CookieUtil.java`

**💬 Copilot Prompt:**
```
Create CookieUtil.java in package com.estate.utils as a @Component.
- Method: Cookie createAccessTokenCookie(String token)
  Creates a Cookie named "access_token" with the given token value.
  Set httpOnly=true, path="/", maxAge=-1 (session cookie).

- Method: Cookie clearAccessTokenCookie()
  Creates a Cookie named "access_token" with value "".
  Set httpOnly=true, path="/", maxAge=0 (expires immediately).
```

---

## Step 9 — JWT Auth Filter

**📂 File:** `src/main/java/com/estate/utils/JwtAuthFilter.java`

**💬 Copilot Prompt:**
```
Create JwtAuthFilter.java in package com.estate.utils.
- Extends OncePerRequestFilter
- Inject JwtUtil
- In doFilterInternal:
    1. Read the cookie named "access_token" from the request using WebUtils.getCookie()
    2. If the cookie is missing or blank, throw AppException(401, "Unauthorized access")
    3. Call jwtUtil.extractUserId(token) to get the userId. If it throws, let the exception propagate.
    4. Set the userId as a request attribute: request.setAttribute("userId", userId)
    5. Call filterChain.doFilter(request, response) to continue

- Override shouldNotFilter to return true (skip this filter) for any request whose path starts with "/api/v1/auth/"
  Also skip GET "/api/v1/listing/getListingbyId/" and GET "/api/v1/listing/getSearchListing"
```

---

## Step 10 — Auth Controller & Service

**📂 Files:**
- `src/main/java/com/estate/services/AuthService.java`
- `src/main/java/com/estate/controllers/AuthController.java`

**💬 Copilot Prompt:**
```
Create AuthService.java in package com.estate.services and AuthController.java in com.estate.controllers.
Use BCryptPasswordEncoder (inject as a @Bean from AppConfig) for password hashing.
Inject UserRepository, JwtUtil, CookieUtil, BCryptPasswordEncoder.

Implement these endpoints (all under /api/v1/auth):

POST /signup
- Body: { username, email, password }
- Hash the password with BCrypt, save new User to MongoDB
- Return HTTP 201 with body: "user created successfully"

POST /signin
- Body: { email, password }
- Find user by email — if not found throw AppException(404, "User not found")
- Compare password with BCrypt — if wrong throw AppException(401, "wrong credentials!")
- Generate JWT with jwtUtil.generateToken(user.getId())
- Add httpOnly cookie "access_token" to response using CookieUtil
- Return HTTP 200 with the User object (password excluded via @JsonIgnore on model)

POST /google
- Body: { name, email, photo }
- If user with that email exists: generate token, set cookie, return user
- If not: generate random password (16 random chars), hash it, create username from name + 4 random chars (lowercase, no spaces), save new user with avatar=photo
  Then generate token, set cookie, return user

GET /signout
- Add the clear-cookie from CookieUtil to the response
- Return HTTP 200 with body: "User has been logged out"

Also create AppConfig.java in com.estate.config with a @Bean for BCryptPasswordEncoder.
```

---

## Step 11 — User Controller & Service

**📂 Files:**
- `src/main/java/com/estate/services/UserService.java`
- `src/main/java/com/estate/controllers/UserController.java`

**💬 Copilot Prompt:**
```
Create UserService.java in package com.estate.services and UserController.java in com.estate.controllers.
All routes are under /api/v1/user and are protected by JwtAuthFilter (token already verified).
Get the authenticated userId from request.getAttribute("userId").

POST /update/{id}
- Request attribute "userId" must equal path variable {id}, else throw AppException(401, "You can only update your own account")
- Body fields (UpdateUserRequest): username, email, password, avatar — update only non-null fields
- If password is provided, hash it with BCrypt before saving
- Use findByIdAndUpdate equivalent: load user, apply changes, save
- Return HTTP 200 with updated User (password excluded)

DELETE /delete/{id}
- userId must equal {id}, else throw AppException(401, "You can only delete your own account")
- Delete user from MongoDB by id
- Clear the access_token cookie
- Return HTTP 200 with body: "User has been deleted"

GET /{id}
- Find user by {id} — if not found throw AppException(404, "User not Found")
- Return HTTP 200 with User (password excluded)
```

---

## Step 12 — Listing Controller & Service

**📂 Files:**
- `src/main/java/com/estate/services/ListingService.java`
- `src/main/java/com/estate/controllers/ListingController.java`

**💬 Copilot Prompt:**
```
Create ListingService.java in package com.estate.services and ListingController.java in com.estate.controllers.
All routes are under /api/v1/listing.

POST /create  [PROTECTED]
- userId from request attribute
- Save the Listing from request body to MongoDB (the body already includes userRef)
- Return HTTP 201 with the saved Listing

GET /listings/{id}  [PROTECTED]
- userId must equal path {id}, else throw AppException(401, "You can only view your own listings!")
- Return all listings where userRef == id

DELETE /delete/{id}  [PROTECTED]
- Find listing by {id} — if not found throw AppException(404, "Listing not found")
- userId must equal listing.getUserRef(), else throw AppException(401, "You can only delete your own listings !")
- Delete listing, return HTTP 200 with body: "Listing has been deleted!"

POST /update/{id}  [PROTECTED]
- Find listing by {id} — if not found throw AppException(404, "Listing not found")
- userId must equal listing.getUserRef(), else throw AppException(401, "You can only update your own listings !")
- Update all fields from request body, save, return HTTP 200 with updated Listing

GET /getListingbyId/{id}  [PUBLIC]
- Find listing by {id} — if not found throw AppException(404, "Listing not found")
- Return HTTP 200 with Listing

GET /getSearchListing  [PUBLIC]
Query parameters (all optional):
- searchTerm (default ""): filter listings where name matches (case-insensitive regex)
- offer: "true" filters offer=true only; "false" or absent returns both
- furnished: same pattern as offer
- parking: same pattern as offer
- type: "sale" or "rent" filters that type; "all" or absent returns both
- sort (default "createdAt"): field to sort by
- order (default "desc"): "asc" or "desc"
- limit (default 9): max results
- startIndex (default 0): skip N results (for pagination)

Use MongoTemplate or build a Query object with Criteria to implement this dynamic search.
Return HTTP 200 with list of matching Listings.
```

---

## Step 13 — Register JwtAuthFilter

**💬 Copilot Prompt:**
```
In the Spring Boot main application class (EstateApplication.java), ensure:
1. @EnableMongoAuditing is added so @CreatedDate and @LastModifiedDate work on models
2. The JwtAuthFilter is registered as a Spring bean (it can be @Component)
3. Create a FilterRegistrationBean in AppConfig.java that registers JwtAuthFilter
   for URL pattern "/api/v1/*" (Spring Boot does not auto-register OncePerRequestFilter for specific paths when using shouldNotFilter — this is fine as-is if using @Component, just confirm the filter runs correctly)
```

---

## Step 14 — Run & Test

**Start the server:**
```bash
MONGODB_URI=your_uri JWT_SECRET=your_secret ./mvnw spring-boot:run
```
Or in IntelliJ/VS Code: set environment variables in Run Configuration, then run `EstateApplication`.

**Quick curl tests:**
```bash
# Signup
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"pass123"}'

# Signin
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@test.com","password":"pass123"}'

# Get listing search (public)
curl http://localhost:3000/api/v1/listing/getSearchListing?limit=4
```

Then start the React frontend (`npm run dev` in the `client/` folder) and verify:
- Sign up / sign in works
- Google OAuth works
- Profile update and delete works
- Create / edit / delete listing works
- Home page and Search page load listings correctly

---

## Full File Structure (reference)

```
springboot-estate/
├── pom.xml
└── src/main/
    ├── java/com/estate/
    │   ├── EstateApplication.java
    │   ├── config/
    │   │   ├── AppConfig.java          ← BCryptPasswordEncoder bean
    │   │   └── CorsConfig.java         ← CORS for localhost:5173
    │   ├── models/
    │   │   ├── User.java
    │   │   └── Listing.java
    │   ├── repositories/
    │   │   ├── UserRepository.java
    │   │   └── ListingRepository.java
    │   ├── dto/
    │   │   ├── SignupRequest.java
    │   │   ├── SigninRequest.java
    │   │   ├── GoogleAuthRequest.java
    │   │   └── UpdateUserRequest.java
    │   ├── exceptions/
    │   │   ├── AppException.java
    │   │   └── GlobalExceptionHandler.java
    │   ├── utils/
    │   │   ├── JwtUtil.java
    │   │   ├── CookieUtil.java
    │   │   └── JwtAuthFilter.java
    │   ├── services/
    │   │   ├── AuthService.java
    │   │   ├── UserService.java
    │   │   └── ListingService.java
    │   └── controllers/
    │       ├── AuthController.java
    │       ├── UserController.java
    │       └── ListingController.java
    └── resources/
        └── application.properties
```

---

## Critical Rules (never break these)

| Rule | Why |
|---|---|
| Return `_id` not `id` in JSON | Frontend Redux state reads `currentUser._id` |
| Cookie name must be `access_token` | Frontend never sends Authorization header |
| Error body must have `statuscode` (not `status`) | Frontend reads `data.statuscode` |
| Port must be **3000** | Vite proxy target is `http://localhost:3000` |
| CORS `allowCredentials = true` | Cookies won't be sent cross-origin without this |
| Do NOT enable Spring Security filter chain | It will intercept requests and break cookie auth |
