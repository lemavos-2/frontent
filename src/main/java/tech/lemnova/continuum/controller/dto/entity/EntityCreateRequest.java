package tech.lemnova.continuum.controller.dto.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import tech.lemnova.continuum.domain.entity.EntityType;
import tech.lemnova.continuum.domain.entity.TrackingConfig;

import java.util.List;
import java.util.Map;

public record EntityCreateRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 500) String description,
    @NotNull EntityType type,
    String icon,
    String color,
    List<String> tags,
    TrackingConfig tracking,
    Map<String, Object> metadata
) {}

// ─────────────────────────────────────────────────────────────────────────────
