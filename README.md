# 🏡 SpringBoot Estate

A full-stack real estate web application where users can **browse**, **list**, and **manage** property listings. Built with a **Spring Boot** REST API backend and a **React + Vite** frontend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)

---

## Overview

SpringBoot Estate is a property listing platform where:

- **Buyers** can search, filter, and save favourite properties.
- **Owners** can create, update, and delete their own listings.
- All users can sign up with email/password or via **Google OAuth**.
- Secure **JWT authentication** is handled through HTTP-only cookies.
- A **forgot/reset password** flow sends a reset link to the user's email.

---

## Tech Stack

### Backend (`springboot-estate/`)

| Technology | Purpose |
|---|---|
| Java 21 | Language |
| Spring Boot 4.x (WebMVC) | REST API framework |
| MongoDB | NoSQL database |
| Spring Data MongoDB | ORM / repository layer |
| JJWT 0.12.6 | JWT creation & validation |
| Spring Security Crypto | BCrypt password hashing |
| Spring Boot Mail | Password-reset emails (SMTP) |
| Lombok | Boilerplate reduction |
| Bean Validation (Jakarta) | Request DTO validation |

### Frontend (`client/`)

| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Redux Toolkit + Redux Persist | Global state management |
| Tailwind CSS | Utility-first styling |
| Firebase | Google OAuth + image storage |
| React Leaflet / Leaflet | Interactive property maps |
| Swiper | Image carousel / gallery |
| React Icons | Icon library |

---

## Project Structure

```
springboot_estate_project/
├── springboot-estate/          # Spring Boot backend
│   ├── src/main/java/com/shiv/springboot_estate/
│   │   ├── config/             # CORS, app-level beans
│   │   ├── controllers/        # REST controllers (Auth, Listing, User)
│   │   ├── dto/                # Request & response DTOs
│   │   ├── exceptions/         # Custom exceptions & global handler
│   │   ├── models/             # MongoDB documents (User, Listing, Role)
│   │   ├── repositories/       # Spring Data repositories
│   │   ├── services/           # Business logic (Auth, Listing, User, Email)
│   │   └── utils/              # JWT filter, JWT util, Cookie util
│   └── src/main/resources/
│       └── application.properties
│
└── client/                     # React + Vite frontend
    ├── src/
    │   ├── pages/              # Route-level page components
    │   ├── component/          # Reusable UI components
    │   ├── redux/              # Redux store & user slice
    │   ├── firebase.js         # Firebase SDK initialisation
    │   └── App.jsx             # Route definitions
    ├── .env                    # Frontend environment variables
    └── package.json
```

---

## Features

### 🔐 Authentication & Security
- **Sign Up / Sign In** with email and password
- **Google OAuth** sign-in via Firebase (token exchanged with backend)
- JWT stored in **HTTP-only cookies** (not accessible to JavaScript)
- **Token versioning** — password change invalidates all existing JWTs
- **Forgot Password** — sends a time-limited reset link to the user's email
- **Reset Password** — verifies token hash before allowing password change
- Protected routes: unauthenticated users are redirected to Sign In

### 🏠 Listings
- **Create** a property listing (OWNER role only)
- **Update** or **Delete** your own listings
- **Browse** a detailed listing page with image gallery (Swiper), map (Leaflet), and contact form
- **Search & Filter** by: keyword, type (rent/sale), offer, furnished, parking, price range, sort order, pagination

### 👤 User Profile
- Update username, email, password, and avatar
- Delete your own account
- View all your own listings from the profile page
- **Favourites** — add/remove listings; view your favourite properties

### 🗺️ Map Integration
- Each listing page displays an interactive Leaflet map pinpointing the property address

---

## Architecture

```
Browser
  │
  │  HTTP (Vite dev proxy → :3000)
  ▼
React Frontend (:5173)
  │  REST API calls (/api/v1/...)
  ▼
Spring Boot Backend (:3000)
  │
  ├── JwtAuthFilter        ← reads JWT from cookie, sets userId on request
  ├── AuthController       ← /api/v1/auth/**
  ├── UserController       ← /api/v1/user/**
  └── ListingController    ← /api/v1/listing/**
        │
        ▼
     MongoDB
```

**Request lifecycle:**

1. Browser sends request with JWT cookie.
2. `JwtAuthFilter` validates the JWT and attaches `userId` to the request.
3. Controller delegates to the relevant `Service`.
4. Service interacts with `Repository` (Spring Data MongoDB).
5. Response is wrapped in a standard `ApiResponse<T>` envelope.

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/signup` | ❌ | Register a new user |
| `POST` | `/signin` | ❌ | Sign in and receive JWT cookie |
| `POST` | `/google` | ❌ | Sign in / register via Google |
| `GET`  | `/signout` | ❌ | Clear the JWT cookie |
| `POST` | `/forgot-password` | ❌ | Send password-reset email |
| `POST` | `/reset-password` | ❌ | Reset password with token |

### User — `/api/v1/user`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/{id}` | ✅ | Get user by ID |
| `POST` | `/update/{id}` | ✅ | Update user profile |
| `DELETE` | `/delete/{id}` | ✅ | Delete user account |
| `POST` | `/favorites/{listingId}` | ✅ | Add listing to favourites |
| `DELETE` | `/favorites/{listingId}` | ✅ | Remove listing from favourites |
| `GET`  | `/favorites` | ✅ | Get all favourite listings |

### Listing — `/api/v1/listing`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/create` | ✅ (OWNER) | Create a new listing |
| `GET`  | `/listings/{userId}` | ✅ | Get all listings for a user |
| `GET`  | `/getListingbyId/{id}` | ❌ | Get a single listing |
| `POST` | `/update/{id}` | ✅ (OWNER) | Update a listing |
| `DELETE` | `/delete/{id}` | ✅ (OWNER) | Delete a listing |
| `GET`  | `/getSearchListing` | ❌ | Search & filter listings |

**Search query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `searchTerm` | string | `""` | Keyword search on name/address |
| `type` | string | — | `rent` or `sale` |
| `offer` | boolean | — | Only discounted listings |
| `furnished` | boolean | — | Furnished properties only |
| `parking` | boolean | — | Properties with parking |
| `minPrice` | number | — | Minimum regular price |
| `maxPrice` | number | — | Maximum regular price |
| `sort` | string | `createdAt` | Sort field |
| `order` | string | `desc` | `asc` or `desc` |
| `limit` | int | `9` | Results per page |
| `page` | int | `0` | Page number |

---

## Getting Started

### Prerequisites

- **Java 21+**
- **Maven 3.9+**
- **Node.js 18+** and **npm**
- **MongoDB** (local instance or MongoDB Atlas)
- A **Firebase** project (for Google OAuth and image storage)
- An **SMTP email account** (e.g. Gmail App Password) for password-reset emails

---

### Backend Setup

1. **Clone the repository and navigate to the backend:**
   ```bash
   cd springboot-estate
   ```

2. **Create your local properties file:**
   ```bash
   cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
   ```
   Then fill in the values (see [Environment Variables](#environment-variables) below).

3. **Run the application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   The API will be available at `http://localhost:3000`.

---

### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create the environment file:**
   ```bash
   cp .env.example .env
   ```
   Then fill in your Firebase credentials (see [Environment Variables](#environment-variables) below).

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Environment Variables

### Backend — `application.properties` / environment

| Variable | Description | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/springboot_estate` |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) | **Required** |
| `JWT_EXPIRATION` | Token expiry in milliseconds | `604800000` (7 days) |
| `USE_SECURE_COOKIE` | Set `true` in production (HTTPS) | `false` |
| `APP_BASE_URL` | Frontend URL (used in reset email link) | `http://localhost:5173` |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USERNAME` | SMTP login email | **Required** |
| `MAIL_PASSWORD` | SMTP password / App Password | **Required** |

### Frontend — `client/.env`

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

> **Note:** Never commit real secrets to version control. Add `.env` and `application-local.properties` to `.gitignore`.

---

## Authentication Flow

### Email / Password

```
Client                          Server
  │── POST /auth/signup ────────► Validate → Hash password (BCrypt) → Save User
  │── POST /auth/signin ────────► Validate credentials → Issue JWT → Set HTTP-only cookie
  │── GET  /auth/signout ───────► Clear JWT cookie
```

### Google OAuth

```
Client                          Firebase              Server
  │── Sign in with Google ──────► Returns ID token
  │── POST /auth/google (token) ──────────────────── Verify token → Find/create user → Issue JWT cookie
```

### Password Reset

```
Client                          Server
  │── POST /auth/forgot-password ──► Generate secure token → Hash → Store → Send email with link
  │── POST /auth/reset-password ───► Validate token hash & expiry → Update password → Invalidate token
```

---

## Database Schema

### `users` collection

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `username` | String (unique) | Display name |
| `email` | String (unique) | Login email |
| `password` | String | BCrypt hash (hidden from API) |
| `role` | Enum | `BUYER` or `OWNER` |
| `avatar` | String | Profile picture URL |
| `tokenVersion` | int | Incremented on password change to invalidate JWTs |
| `favorites` | String[] | List of favourite listing IDs |
| `resetPasswordTokenHash` | String | SHA-256 hash of reset token |
| `resetPasswordExpiry` | Date | Token expiry timestamp |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

### `listings` collection

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | Listing title |
| `description` | String | Full description |
| `address` | String | Property address (used for map geocoding) |
| `type` | String | `rent` or `sale` |
| `regularPrice` | double | Asking price |
| `discountPrice` | double | Discounted price (if offer) |
| `bedrooms` | int | Number of bedrooms |
| `bathrooms` | int | Number of bathrooms |
| `area` | double | Property area (sq ft / sq m) |
| `furnished` | boolean | Whether furnished |
| `parking` | boolean | Whether parking is available |
| `offer` | boolean | Whether a discount is active |
| `imageUrls` | String[] | Firebase Storage image URLs |
| `userRef` | String | Owner's user ID |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

---

## 📄 License

This project is open-source and available for personal and educational use.
