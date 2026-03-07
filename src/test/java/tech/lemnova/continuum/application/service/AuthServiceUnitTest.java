package tech.lemnova.continuum.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import tech.lemnova.continuum.controller.dto.auth.RegisterRequest;
import tech.lemnova.continuum.controller.dto.auth.LoginRequest;
import tech.lemnova.continuum.domain.email.EmailVerificationToken;
import tech.lemnova.continuum.domain.email.EmailVerificationTokenRepository;
import tech.lemnova.continuum.domain.plan.PlanConfiguration;
import tech.lemnova.continuum.domain.plan.PlanType;
import tech.lemnova.continuum.domain.subscription.SubscriptionRepository;
import tech.lemnova.continuum.domain.user.User;
import tech.lemnova.continuum.domain.user.UserRepository;
import tech.lemnova.continuum.infra.email.EmailService;
import tech.lemnova.continuum.infra.security.JwtService;
import tech.lemnova.continuum.infra.vault.VaultStorageService;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceUnitTest {

    @Mock
    UserRepository users;

    @Mock
    SubscriptionRepository subscriptions;

    @Mock
    EmailVerificationTokenRepository tokenRepo;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    JwtService jwtService;

    @Mock
    EmailService emailService;

    @Mock
    VaultStorageService vaultStorage;

    @Mock
    PlanConfiguration planConfig;

    @InjectMocks
    AuthService authService;

    @Captor
    ArgumentCaptor<User> userCaptor;

    @BeforeEach
    void setup() {
        // nothing
    }

    @Test
    void register_createsUser_and_sendsVerification() {
        RegisterRequest req = new RegisterRequest("alice", "alice@example.com", "secret123");

        when(users.existsByEmail(req.email())).thenReturn(false);
        when(users.existsByUsername(req.username())).thenReturn(false);

        User saved = new User();
        saved.setId("u-1");
        saved.setUsername(req.username());
        saved.setEmail(req.email());
        when(passwordEncoder.encode(any())).thenReturn("encoded-pass");
        when(users.save(any())).thenReturn(saved);
        when(subscriptions.findAllByUserId(any())).thenReturn(null);
        when(jwtService.generate(any(), any())).thenReturn("tok-1");

        authService.register(req);

        verify(users).save(userCaptor.capture());
        User u = userCaptor.getValue();
        assertThat(u.getUsername()).isEqualTo("alice");
        assertThat(u.isEmailVerified()).isFalse();
        assertThat(u.getVerificationToken()).isNotNull();
        verify(emailService).sendVerificationEmail(eq("alice@example.com"), any());
        verify(subscriptions).save(any());
    }

    @Test
    void login_withValidCredentials_returnsAuthResponse() {
        LoginRequest req = new LoginRequest("alice@example.com", "secret123");
        User user = new User();
        user.setId("u-2");
        user.setEmail(req.email());
        user.setPassword("encoded");
        user.setActive(true);

        when(users.findByEmail(req.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(req.password(), user.getPassword())).thenReturn(true);
        when(jwtService.generate(user.getId(), user.getUsername())).thenReturn("tok-2");

        var resp = authService.login(req);
        assertThat(resp.token()).isEqualTo("tok-2");
    }

    @Test
    void verifyEmail_activatesUser_and_deletesToken() {
        EmailVerificationToken token = new EmailVerificationToken();
        token.setToken("t1");
        token.setUserId("u-3");
        token.setExpiresAt(java.time.Instant.now().plusSeconds(3600));

        User user = new User();
        user.setId("u-3");
        user.setActive(false);

        when(tokenRepo.findByToken("t1")).thenReturn(Optional.of(token));
        when(users.findById("u-3")).thenReturn(Optional.of(user));

        authService.verifyEmail("t1");

        verify(users).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getActive()).isTrue();
        verify(tokenRepo).delete(token);
    }
}
