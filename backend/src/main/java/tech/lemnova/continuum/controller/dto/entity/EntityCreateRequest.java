package tech.lemnova.continuum.controller.dto.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EntityCreateRequest(
    @NotBlank @Size(min = 1, max = 255) String title,
    @Size(max = 1000) String description
) {}

// ─────────────────────────────────────────────────────────────────────────────
