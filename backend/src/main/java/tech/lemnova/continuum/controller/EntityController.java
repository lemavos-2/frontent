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

    @GetMapping("/{id}")
    public ResponseEntity<Entity> getEntity(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id) {
        return ResponseEntity.ok(entityService.getEntity(user.getVaultId(), id));
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<Note>> getNotesForEntity(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id) {
        return ResponseEntity.ok(entityService.getNotesForEntity(user.getVaultId(), id));
    }

    @GetMapping("/{id}/connections")
    public ResponseEntity<List<Entity>> getConnections(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id) {
        return ResponseEntity.ok(entityService.getConnections(user.getVaultId(), id));
    }
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
