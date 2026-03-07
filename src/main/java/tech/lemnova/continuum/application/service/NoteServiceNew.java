package tech.lemnova.continuum.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.lemnova.continuum.application.exception.NotFoundException;
import tech.lemnova.continuum.application.parser.EntityParser;
import tech.lemnova.continuum.controller.dto.note.NoteCreateRequest;
import tech.lemnova.continuum.controller.dto.note.NoteResponse;
import tech.lemnova.continuum.controller.dto.note.NoteUpdateRequest;
import tech.lemnova.continuum.domain.note.Note;
import tech.lemnova.continuum.domain.entity.Entity;
import tech.lemnova.continuum.domain.NoteEntity;
import tech.lemnova.continuum.infra.persistence.NoteRepository;
import tech.lemnova.continuum.infra.persistence.EntityRepository;
import tech.lemnova.continuum.infra.persistence.NoteEntityRepository;

import java.time.Instant;
import java.util.*;

@Service
public class NoteService {

    private static final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final NoteRepository noteRepo;
    private final EntityRepository entityRepo;
    private final NoteEntityRepository noteEntityRepo;
    private final EntityParser entityParser;

    public NoteService(NoteRepository noteRepo,
                       EntityRepository entityRepo,
                       NoteEntityRepository noteEntityRepo,
                       EntityParser entityParser) {
        this.noteRepo = noteRepo;
        this.entityRepo = entityRepo;
        this.noteEntityRepo = noteEntityRepo;
        this.entityParser = entityParser;
    }

    @Transactional
    public NoteResponse create(String vaultId, NoteCreateRequest req) {
        String noteId = UUID.randomUUID().toString().replace("-", "");
        String content = req.content() != null ? req.content() : "";

        Note note = new Note();
        note.setId(noteId);
        note.setVaultId(vaultId);
        note.setFolderId(req.folderId());
        note.setTitle(extractTitle(content));
        note.setContent(content);
        note.setCreatedAt(Instant.now());
        note.setUpdatedAt(Instant.now());

        noteRepo.save(note);

        processEntities(vaultId, noteId, content);

        return NoteResponse.from(note);
    }

    @Transactional
    public NoteResponse update(String vaultId, String noteId, NoteUpdateRequest req) {
        Note note = noteRepo.findById(noteId)
                .filter(n -> n.getVaultId().equals(vaultId))
                .orElseThrow(() -> new NotFoundException("Note not found: " + noteId));

        String content = req.content() != null ? req.content() : "";
        note.setTitle(extractTitle(content));
        note.setContent(content);
        note.setUpdatedAt(Instant.now());

        noteRepo.save(note);

        processEntities(vaultId, noteId, content);

        return NoteResponse.from(note);
    }

    public NoteResponse get(String vaultId, String noteId) {
        Note note = noteRepo.findById(noteId)
                .filter(n -> n.getVaultId().equals(vaultId))
                .orElseThrow(() -> new NotFoundException("Note not found: " + noteId));
        return NoteResponse.from(note);
    }

    public List<Note> list(String vaultId) {
        return noteRepo.findByVaultId(vaultId);
    }

    private void processEntities(String vaultId, String noteId, String content) {
        List<String> entityTitles = entityParser.parseEntities(content);
        Set<String> uniqueTitles = new HashSet<>(entityTitles);

        // Remove stale relationships
        List<NoteEntity> existing = noteEntityRepo.findByNoteId(noteId);
        noteEntityRepo.deleteAll(existing);

        // Create entities if not exist, link
        int position = 0;
        for (String title : uniqueTitles) {
            Entity entity = entityRepo.findByVaultIdAndTitle(vaultId, title)
                    .orElseGet(() -> {
                        Entity newEntity = new Entity();
                        newEntity.setId(UUID.randomUUID().toString().replace("-", ""));
                        newEntity.setVaultId(vaultId);
                        newEntity.setTitle(title);
                        newEntity.setCreatedAt(Instant.now());
                        return entityRepo.save(newEntity);
                    });

            NoteEntity noteEntity = new NoteEntity();
            noteEntity.setNoteId(noteId);
            noteEntity.setEntityId(entity.getId());
            noteEntity.setPosition(position++);
            noteEntityRepo.save(noteEntity);
        }
    }

    private String extractTitle(String content) {
        if (content == null || content.isBlank()) return "Untitled";
        String[] lines = content.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                return trimmed.length() > 80 ? trimmed.substring(0, 80) : trimmed;
            }
        }
        return "Untitled";
    }
}