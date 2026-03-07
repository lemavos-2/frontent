package tech.lemnova.continuum.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tech.lemnova.continuum.application.parser.EntityParser;
import tech.lemnova.continuum.domain.note.Note;
import tech.lemnova.continuum.domain.NoteEntity;
import tech.lemnova.continuum.domain.entity.Entity;
import tech.lemnova.continuum.infra.persistence.NoteRepository;
import tech.lemnova.continuum.infra.persistence.EntityRepository;
import tech.lemnova.continuum.infra.persistence.NoteEntityRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class NoteServiceUnitTest {

    @Mock NoteRepository noteRepo;
    @Mock EntityRepository entityRepo;
    @Mock NoteEntityRepository noteEntityRepo;
    @Mock EntityParser entityParser;

    NoteService noteService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        noteService = new NoteService(noteRepo, entityRepo, noteEntityRepo, entityParser);
    }

    @Test
    void create_savesNoteWithContent() {
        String vaultId = "vault1";
        Note savedNote = new Note();
        savedNote.setId("n1");
        savedNote.setVaultId(vaultId);
        savedNote.setTitle("Test");
        savedNote.setContent("Test content");
        savedNote.setCreatedAt(Instant.now());

        when(noteRepo.save(any(Note.class))).thenReturn(savedNote);
        when(entityParser.parseEntities(anyString())).thenReturn(List.of());

        var result = noteService.create(vaultId, new tech.lemnova.continuum.controller.dto.note.NoteCreateRequest("Test content", null));
        
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("n1");
        assertThat(result.content()).isEqualTo("Test content");
    }

    @Test
    void get_returnsNoteForValidVaultAndId() {
        String vaultId = "vault1";
        String noteId = "n1";
        Note note = new Note();
        note.setId(noteId);
        note.setVaultId(vaultId);
        note.setTitle("Test");
        note.setContent("Content");

        when(noteRepo.findById(noteId)).thenReturn(Optional.of(note));

        var result = noteService.get(vaultId, noteId);
        
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(noteId);
    }

    @Test
    void list_returnsAllNotesForVault() {
        String vaultId = "vault1";
        Note note1 = new Note();
        note1.setId("n1");
        note1.setVaultId(vaultId);
        
        Note note2 = new Note();
        note2.setId("n2");
        note2.setVaultId(vaultId);

        when(noteRepo.findByVaultId(vaultId)).thenReturn(List.of(note1, note2));

        var result = noteService.list(vaultId);
        
        assertThat(result).hasSize(2);
    }
}
