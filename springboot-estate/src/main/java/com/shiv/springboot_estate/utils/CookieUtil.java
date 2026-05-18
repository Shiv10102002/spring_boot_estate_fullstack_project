package com.shiv.springboot_estate.utils;

import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    private final JwtUtil jwtUtil;
    private final boolean secureCookie;

    public CookieUtil(JwtUtil jwtUtil,
                      @Value("${server.use-secure-cookie:false}") boolean secureCookie) {
        this.jwtUtil = jwtUtil;
        this.secureCookie = secureCookie;
    }

    public Cookie createAccessTokenCookie(String token) {
        Cookie cookie = new Cookie("access_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtUtil.getExpirationMs() / 1000));
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }

    public Cookie clearAccessTokenCookie() {
        Cookie cookie = new Cookie("access_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }
}
