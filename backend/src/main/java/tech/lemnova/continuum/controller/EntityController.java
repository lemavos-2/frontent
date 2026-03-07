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
import tech.lemnova.continuum.domain.note.Note;
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
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(entityService.create(user.getVaultId(), req));
    }

    @GetMapping
    public ResponseEntity<List<Entity>> list(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(entityService.listByVault(user.getVaultId()));
    }

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

    @PutMapping("/{id}")
    public ResponseEntity<Entity> update(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id,
            @Valid @RequestBody EntityUpdateRequest req) {
        return ResponseEntity.ok(entityService.update(user.getVaultId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id) {
        entityService.delete(user.getVaultId(), id);
        return ResponseEntity.noContent().build();
    }
}
