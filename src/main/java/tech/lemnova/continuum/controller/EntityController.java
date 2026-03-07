package tech.lemnova.continuum.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tech.lemnova.continuum.application.service.EntityService;
import tech.lemnova.continuum.controller.dto.entity.EntityCreateRequest;
import tech.lemnova.continuum.controller.dto.entity.EntityUpdateRequest;
import tech.lemnova.continuum.domain.entity.Entity;
import tech.lemnova.continuum.domain.entity.EntityType;
import tech.lemnova.continuum.infra.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/entities")
public class EntityController {

    private final EntityService entityService;

    public EntityController(EntityService entityService) { this.entityService = entityService; }

    @PostMapping
    public ResponseEntity<Entity> create(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody EntityCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(entityService.create(user.getUserId(), req));
    }

    @GetMapping("/mentions")
    public ResponseEntity<java.util.Map<String, Integer>> mentions(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam String ids) {
        java.util.List<String> list = java.util.Arrays.stream(ids.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
        return ResponseEntity.ok(entityService.mentionCounts(user.getUserId(), list));
    }

    @GetMapping
    public ResponseEntity<List<Entity>> list(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) EntityType type) {
        if (type != null) return ResponseEntity.ok(entityService.listByType(user.getUserId(), type));
        return ResponseEntity.ok(entityService.list(user.getUserId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Entity>> search(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) EntityType type) {
        List<Entity> results = entityService.search(user.getUserId(), q, type);
        if (results.size() > 10) results = results.subList(0, 10);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/archived")
    public ResponseEntity<List<Entity>> listArchived(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(entityService.listArchived(user.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entity> get(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable String id) {
        return ResponseEntity.ok(entityService.get(user.getUserId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Entity> update(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id,
            @RequestBody EntityUpdateRequest req) {
        return ResponseEntity.ok(entityService.update(user.getUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archive(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable String id) {
        entityService.archive(user.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> deletePermanent(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable String id) {
        entityService.deletePermanent(user.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Entity> restore(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable String id) {
        return ResponseEntity.ok(entityService.restore(user.getUserId(), id));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
