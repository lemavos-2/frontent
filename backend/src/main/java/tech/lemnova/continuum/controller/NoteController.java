package tech.lemnova.continuum.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tech.lemnova.continuum.application.service.NoteService;
import tech.lemnova.continuum.controller.dto.note.NoteCreateRequest;
import tech.lemnova.continuum.controller.dto.note.NoteResponse;
import tech.lemnova.continuum.controller.dto.note.NoteUpdateRequest;
import tech.lemnova.continuum.domain.note.Note;
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
        return ResponseEntity.status(HttpStatus.CREATED).body(noteService.create(user.getVaultId(), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> get(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id) {
        return ResponseEntity.ok(noteService.get(user.getVaultId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> update(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String id,
            @RequestBody NoteUpdateRequest req) {
        return ResponseEntity.ok(noteService.update(user.getVaultId(), id, req));
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> list(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.list(user.getVaultId()).stream().map(NoteResponse::from).toList());
    }
}
