package tech.lemnova.continuum.controller.dto.note;

import tech.lemnova.continuum.domain.note.NoteIndex;
import java.time.Instant;

public record NoteResponse(
    String id, String userId, String folderId, String title, String content,
    Instant createdAt, Instant updatedAt
) {
    public static NoteResponse from(NoteIndex index, String content) {
        return new NoteResponse(
            index.getId(), index.getUserId(), index.getFolderId(),
            index.getTitle(), content, index.getCreatedAt(), index.getUpdatedAt());
    }
}

// ─────────────────────────────────────────────────────────────────────────────
