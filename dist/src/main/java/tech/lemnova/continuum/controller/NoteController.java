package tech.lemnova.continuum.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tech.lemnova.continuum.application.service.NoteService;
import tech.lemnova.continuum.controller.dto.note.NoteCreateRequest;
import tech.lemnova.continuum.controller.dto.note.NoteResponse;
import tech.lemnova.continuum.controller.dto.note.NoteUpdateRequest;
import tech.lemnova.continuum.domain.note.NoteIndex;
import tech.lemnova.continuum.infra.security.CustomUserDetails;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) { this.noteService = noteService; }

    @PostMapping
    public ResponseEntity<NoteResponse> create(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody NoteCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noteService.create(user.getUserId(), req));
    }

    @GetMapping
    public ResponseEntity<List<NoteIndex>> list(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) String folderId,
            @RequestParam(required = false) Boolean rootOnly,
            @RequestParam(required = false) Integer days) {
        if (Boolean.TRUE.equals(rootOnly)) return ResponseEntity.ok(noteService.listInRoot(user.getUserId()));
        if (days != null && days > 0)      return ResponseEntity.ok(noteService.listSince(user.getUserId(), days));
        return ResponseEntity.ok(noteService.list(user.getUserId(), folderId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<NoteIndex>> recent(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.listRecent(user.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> get(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id) {
        return ResponseEntity.ok(noteService.get(user.getUserId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> update(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id,
            @RequestBody NoteUpdateRequest req) {
        return ResponseEntity.ok(noteService.update(user.getUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archive(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id) {
        noteService.archive(user.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/move")
    public ResponseEntity<Void> move(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        noteService.moveToFolder(user.getUserId(), id, body.get("folderId"));
        return ResponseEntity.noContent().build();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
