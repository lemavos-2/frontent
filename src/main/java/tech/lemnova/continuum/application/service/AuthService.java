package tech.lemnova.continuum.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.lemnova.continuum.application.exception.BadRequestException;
import tech.lemnova.continuum.application.exception.NotFoundException;
import tech.lemnova.continuum.controller.dto.auth.AuthResponse;
import tech.lemnova.continuum.controller.dto.auth.LoginRequest;
import tech.lemnova.continuum.controller.dto.auth.RegisterRequest;
import tech.lemnova.continuum.controller.dto.auth.UserContextResponse;
import tech.lemnova.continuum.domain.email.EmailVerificationToken;
import tech.lemnova.continuum.domain.email.EmailVerificationTokenRepository;
import tech.lemnova.continuum.domain.email.PasswordResetToken;
import tech.lemnova.continuum.domain.email.PasswordResetTokenRepository;
import tech.lemnova.continuum.domain.plan.PlanConfiguration;
import tech.lemnova.continuum.domain.plan.PlanType;
import tech.lemnova.continuum.domain.subscription.Subscription;
import tech.lemnova.continuum.domain.subscription.SubscriptionRepository;
import tech.lemnova.continuum.domain.subscription.SubscriptionStatus;
import tech.lemnova.continuum.domain.user.User;
import tech.lemnova.continuum.domain.user.UserRepository;
import tech.lemnova.continuum.infra.email.EmailService;
import tech.lemnova.continuum.infra.google.GoogleOAuthService;
import tech.lemnova.continuum.infra.security.JwtService;
import tech.lemnova.continuum.infra.vault.VaultStorageService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository users;
    private final SubscriptionRepository subscriptions;
    private final EmailVerificationTokenRepository tokenRepo;
    private final PasswordResetTokenRepository passwordResetRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final VaultStorageService vaultStorage;
    private final PlanConfiguration planConfig;

    public AuthService(UserRepository users,
                       SubscriptionRepository subscriptions,
                       EmailVerificationTokenRepository tokenRepo,
                       PasswordResetTokenRepository passwordResetRepo,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       EmailService emailService,
                       VaultStorageService vaultStorage,
                       PlanConfiguration planConfig) {
        this.users           = users;
        this.subscriptions   = subscriptions;
        this.tokenRepo       = tokenRepo;
        this.passwordResetRepo = passwordResetRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService      = jwtService;
        this.emailService    = emailService;
        this.vaultStorage    = vaultStorage;
        this.planConfig      = planConfig;
    }

    @Transactional
    public void register(RegisterRequest req) {
        if (users.existsByEmail(req.email()))    throw new BadRequestException("Email already in use");

        String vaultId = UUID.randomUUID().toString().replace("-", "");

        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setVaultId(vaultId);
        user.setPlan(PlanType.FREE);
        user.setRole("USER");
        user.setActive(false);
        user.setEmailVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setTokenExpiry(Instant.now().plus(24, ChronoUnit.HOURS));
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user = users.save(user);

        createFreeSubscription(user.getId());
        initVaultAsync(vaultId);
        sendVerificationEmail(user);

        // Don't return auth response - user needs to verify email first
    }

    private void sendVerificationEmail(User user) {
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(req.email())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPassword()))
            throw new BadRequestException("Invalid credentials");
        if (!user.isEmailVerified())
            throw new BadRequestException("Email not verified. Check your inbox.");
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse googleAuth(GoogleOAuthService.GoogleUserInfo googleUser) {
        User user = users.findByEmail(googleUser.email()).orElse(null);

        if (user == null) {
            String vaultId = UUID.randomUUID().toString().replace("-", "");
            user = new User();
            user.setUsername(generateUsername(googleUser.email()));
            user.setEmail(googleUser.email());
            user.setGoogleId(googleUser.googleId());
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setActive(true);
            user.setRole("USER");
            user.setPlan(PlanType.FREE);
            user.setVaultId(vaultId);
            user.setCreatedAt(Instant.now());
            user.setUpdatedAt(Instant.now());
            user = users.save(user);
            createFreeSubscription(user.getId());
            initVaultAsync(vaultId);
            log.info("New user via Google: {}", user.getId());
        } else {
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleUser.googleId());
                user.setActive(true);
                users.save(user);
            }
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        User user = users.findByVerificationToken(tokenValue)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (user.getTokenExpiry().isBefore(Instant.now()))
            throw new BadRequestException("Verification token expired");

        user.setEmailVerified(true);
        user.setActive(true);
        user.setVerificationToken(null); // Clear the token after use
        user.setTokenExpiry(null);
        user.setUpdatedAt(Instant.now());
        users.save(user);
    }

    @Transactional
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new BadRequestException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(newPassword));
        users.save(user);
    }

    @Transactional
    public void initiatePasswordReset(String email) {
        User user = users.findByEmail(email).orElse(null);
        if (user == null) return; // do not reveal existence
        String tokenValue = UUID.randomUUID().toString();
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(tokenValue);
        token.setUserId(user.getId());
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plusSeconds(3600));
        // save
        // injected repository will be added via field (see patch)
        passwordResetRepo.save(token);
        try { emailService.sendPasswordResetEmail(user.getEmail(), tokenValue); }
        catch (Exception e) { log.error("Failed to send password reset to {}: {}", user.getEmail(), e.getMessage()); }
    }

    @Transactional
    public void completePasswordReset(String tokenValue, String newPassword) {
        PasswordResetToken token = passwordResetRepo.findByToken(tokenValue)
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));
        if (token.getExpiresAt().isBefore(Instant.now())) throw new BadRequestException("Reset token expired");
        User user = users.findById(token.getUserId()).orElseThrow(() -> new NotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        users.save(user);
        passwordResetRepo.delete(token);
    }

    public UserContextResponse getContext(String userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<Subscription> subs = subscriptions.findAllByUserId(userId);
        Subscription sub = subs == null || subs.isEmpty() ? null : subs.stream()
                .max(Comparator.comparing(s -> s.getCurrentPeriodEnd() == null
                        ? Instant.EPOCH : s.getCurrentPeriodEnd()))
                .orElse(null);

        PlanType effectivePlan = sub != null ? sub.getEffectivePlan() : user.getPlan();
        if (effectivePlan != user.getPlan()) {
            user.syncPlan(effectivePlan);
            users.save(user);
        }

        return UserContextResponse.from(user, sub, planConfig.getLimits(effectivePlan));
    }

    @Transactional
    public AuthResponse refresh(String token) {
        try {
            String userId = jwtService.extractUserId(token);
            User user = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
            return buildAuthResponse(user);
        } catch (Exception e) {
            throw new BadRequestException("Invalid token");
        }
    }

    @Transactional
    public void logout(String userId) {
        // If refresh tokens or session store exist, revoke here. Currently stateless JWTs, so logout is client-side.
        log.info("Logout requested for user={}", userId);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        return new AuthResponse(
                jwtService.generate(user.getId(), user.getUsername()),
                user.getId(), user.getUsername(), user.getEmail(), user.getPlan());
    }

    private void createFreeSubscription(String userId) {
        List<Subscription> existing = subscriptions.findAllByUserId(userId);
        if (existing != null && !existing.isEmpty()) return;
        Subscription sub = new Subscription();
        sub.setUserId(userId);
        sub.setPlanType(PlanType.FREE);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setCurrentPeriodStart(Instant.now());
        sub.setCurrentPeriodEnd(Instant.now().plus(36500, ChronoUnit.DAYS));
        sub.setCreatedAt(Instant.now());
        sub.setUpdatedAt(Instant.now());
        subscriptions.save(sub);
    }

    @Transactional
    public void updateUsername(String userId, String username) {
        if (username == null || username.isBlank()) throw new BadRequestException("username is required");
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        user.setUsername(username);
        user.setUpdatedAt(Instant.now());
        users.save(user);
    }

    @Transactional
    public void initiateEmailChange(String userId, String newEmail) {
        if (newEmail == null || newEmail.isBlank()) throw new BadRequestException("email is required");
        if (users.existsByEmail(newEmail)) throw new BadRequestException("Email already in use");
        // send verification to new email with token that when confirmed will swap emails
        String token = UUID.randomUUID().toString();
        EmailVerificationToken ev = new EmailVerificationToken();
        ev.setToken(token);
        ev.setUserId(userId);
        ev.setCreatedAt(Instant.now());
        ev.setExpiresAt(Instant.now().plusSeconds(86400));
        ev.setNewEmail(newEmail);
        tokenRepo.save(ev);
        try { emailService.sendEmailChangeVerification(newEmail, token); }
        catch (Exception e) { log.error("Failed to send email change verification to {}: {}", newEmail, e.getMessage()); }
    }

    @Async
    public void initVaultAsync(String vaultId) {
        try { vaultStorage.initializeVault(vaultId); }
        catch (Exception e) { log.error("Vault init failed for {}: {}", vaultId, e.getMessage()); }
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email already verified");
        }

        // Generate new token
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setTokenExpiry(Instant.now().plus(24, ChronoUnit.HOURS));
        user.setUpdatedAt(Instant.now());
        users.save(user);

        sendVerificationEmail(user);
    }

    private String generateUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        return base;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION — SubscriptionService
// ─────────────────────────────────────────────────────────────────────────────
