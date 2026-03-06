package tech.lemnova.continuum.infra.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceUnitTest {

    @Test
    void generateAndParseToken() throws Exception {
        // provide a mock environment so JwtService can initialize properly
        org.springframework.mock.env.MockEnvironment env = new org.springframework.mock.env.MockEnvironment();
        // include the test profile so JwtService generates a random secret if needed
        env.setActiveProfiles("test");
        JwtService jwtService = new JwtService(env);

        // secret must be at least 32 bytes for HS256
        String secret = "01234567890123456789012345678901";

        Field secretField = JwtService.class.getDeclaredField("secret");
        secretField.setAccessible(true);
        secretField.set(jwtService, secret);

        Field expField = JwtService.class.getDeclaredField("expirationMs");
        expField.setAccessible(true);
        expField.setLong(jwtService, 1000L * 60 * 60); // 1 hour

        String token = jwtService.generate("user-123", "alice");
        assertThat(token).isNotNull();

        Claims claims = jwtService.parse(token);
        assertThat(claims.getSubject()).isEqualTo("alice");
        assertThat(jwtService.extractUserId(token)).isEqualTo("user-123");
        assertThat(jwtService.isValid(token)).isTrue();
    }
}
