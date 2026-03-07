package tech.lemnova.continuum.controller.dto.entity;

import tech.lemnova.continuum.domain.entity.TrackingConfig;
import java.util.List;
import java.util.Map;

public record EntityUpdateRequest(
    String name, String description, String icon, String color,
    List<String> tags, TrackingConfig tracking, Map<String, Object> metadata
) {}

// ─────────────────────────────────────────────────────────────────────────────
