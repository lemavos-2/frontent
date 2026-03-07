package tech.lemnova.continuum.infra.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

import java.security.Key;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private final Environment env;

    @Value("${jwt.expiration:2592000000}")
    private long expirationMs;

    public JwtService(Environment env) {
        this.env = env;
    }

    @PostConstruct
    private void validateSecret() {
        boolean isTest = (env == null) || Arrays.stream(env.getActiveProfiles()).anyMatch(p -> "test".equalsIgnoreCase(p));
        if (secret == null || secret.isBlank()) {
            if (isTest) {
                byte[] rnd = new byte[48];
                new SecureRandom().nextBytes(rnd);
                secret = Base64.getEncoder().encodeToString(rnd);
                return;
            }
            throw new IllegalStateException("Missing JWT secret. Set environment variable JWT_SECRET (must be >= 32 bytes).");
        }
        if (secret.getBytes().length < 32) {
            if (isTest) {
                byte[] seed = secret.getBytes();
                byte[] rnd = new byte[32];
                for (int i = 0; i < rnd.length; i++) rnd[i] = seed[i % seed.length];
                secret = Base64.getEncoder().encodeToString(rnd);
            } else {
                throw new IllegalStateException("JWT secret too short. Provide a secret with at least 32 bytes.");
            }
        }
    }

    private Key key() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generate(String userId, String username) {
        return Jwts.builder()
                .setClaims(Map.of("userId", userId, "username", username))
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
    }

    public String extractUsername(String token) { return parse(token).getSubject(); }
    public String extractUserId(String token)   { return parse(token).get("userId", String.class); }

    public boolean isValid(String token) {
        try { return !parse(token).getExpiration().before(new Date()); }
        catch (Exception e) { return false; }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
