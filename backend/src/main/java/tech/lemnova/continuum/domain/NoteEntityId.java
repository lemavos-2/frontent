package tech.lemnova.continuum.domain;

import java.io.Serializable;
import java.util.Objects;

public class NoteEntityId implements Serializable {

    private String noteId;
    private String entityId;

    // Default constructor
    public NoteEntityId() {}

    public NoteEntityId(String noteId, String entityId) {
        this.noteId = noteId;
        this.entityId = entityId;
    }

    // Getters and setters
    public String getNoteId() { return noteId; }
    public void setNoteId(String noteId) { this.noteId = noteId; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NoteEntityId that = (NoteEntityId) o;
        return Objects.equals(noteId, that.noteId) && Objects.equals(entityId, that.entityId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(noteId, entityId);
    }
}