package tech.lemnova.continuum.controller.dto.note;

import tech.lemnova.continuum.domain.note.Note;
import java.time.Instant;

public record NoteResponse(
    String id, String vaultId, String folderId, String title, String content,
    Instant createdAt, Instant updatedAt
) {
    public static NoteResponse from(Note note) {
        return new NoteResponse(
            note.getId(), note.getVaultId(), note.getFolderId(),
            note.getTitle(), note.getContent(), note.getCreatedAt(), note.getUpdatedAt());
    }
}

// ─────────────────────────────────────────────────────────────────────────────
