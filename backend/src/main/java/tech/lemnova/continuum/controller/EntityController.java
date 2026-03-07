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
}
