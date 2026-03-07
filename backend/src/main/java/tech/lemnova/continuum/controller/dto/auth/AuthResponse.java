package tech.lemnova.continuum.controller.dto.auth;

import tech.lemnova.continuum.domain.plan.PlanType;

public record AuthResponse(
    String token,
    String userId,
    String username,
    String email,
    PlanType plan
) {}
