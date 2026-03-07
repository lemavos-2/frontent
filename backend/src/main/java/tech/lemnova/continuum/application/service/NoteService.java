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

    @Transactional
    public void archive(String userId, String noteId) {
        User user = getUser(userId);
        List<NoteIndex> allIndexes = vaultData.readNoteIndex(user.getVaultId());

        NoteIndex index = allIndexes.stream()
                .filter(n -> n.getId().equals(noteId) && n.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Note not found: " + noteId));

        index.setArchivedAt(Instant.now());
        index.setUpdatedAt(Instant.now());
        vaultData.writeNoteIndex(user.getVaultId(), allIndexes);

        // Remove refs desta nota
        List<NoteReference> refs = vaultData.readRefs(user.getVaultId());
        refs.removeIf(r -> r.getNoteId().equals(noteId));
        vaultData.writeRefs(user.getVaultId(), refs);

        user.decrementNoteCount();
        userRepo.save(user);

        entityIndexService.rebuildIndex(user.getVaultId());
    }

    public NoteResponse get(String vaultId, String noteId) {
        Note note = noteRepo.findById(noteId)
                .filter(n -> n.getVaultId().equals(vaultId))
                .orElseThrow(() -> new NotFoundException("Note not found: " + noteId));
        return NoteResponse.from(note);
    }

    public List<Note> list(String vaultId) {
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
                .collect(Collectors.toList());
    }

    public List<NoteIndex> listRecent(String userId) {
        User user = getUser(userId);
        return vaultData.readNoteIndex(user.getVaultId()).stream()
                .filter(n -> n.getUserId().equals(userId) && n.getArchivedAt() == null)
                .sorted(Comparator.comparing(NoteIndex::getUpdatedAt, Comparator.reverseOrder()))
                .limit(7)
                .collect(Collectors.toList());
    }

    public List<NoteSearchResult> search(String userId, String query) {
        User user = getUser(userId);
        String lowerQuery = query.toLowerCase();
        return vaultData.readNoteIndex(user.getVaultId()).stream()
                .filter(n -> n.getUserId().equals(userId) && n.getArchivedAt() == null)
                .filter(n -> {
                    try {
                        String content = vault.loadNote(user.getVaultId(), n.getId()).orElse("");
                        return content.toLowerCase().contains(lowerQuery) ||
                               (n.getTitle() != null && n.getTitle().toLowerCase().contains(lowerQuery));
                    } catch (Exception e) {
                        log.warn("Failed to load note {} for search: {}", n.getId(), e.getMessage());
                        return false;
                    }
                })
                .map(n -> {
                    String preview = generatePreview(user.getVaultId(), n.getId(), lowerQuery);
                    return new NoteSearchResult(n, preview);
                })
                .sorted(Comparator.comparing(NoteIndex::getUpdatedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    private String generatePreview(String vaultId, String noteId, String query) {
        try {
            String content = vault.loadNote(vaultId, noteId).orElse("");
            if (content.isEmpty()) return "";

            // Find the first occurrence of the query
            int index = content.toLowerCase().indexOf(query);
            if (index == -1) return content.substring(0, Math.min(100, content.length()));

            // Get context around the match
            int start = Math.max(0, index - 50);
            int end = Math.min(content.length(), index + query.length() + 50);
            String snippet = content.substring(start, end);

            // Add ellipsis if truncated
            if (start > 0) snippet = "..." + snippet;
            if (end < content.length()) snippet = snippet + "...";

            return snippet.replaceAll("\\s+", " ").trim();
        } catch (Exception e) {
            log.warn("Failed to generate preview for note {}: {}", noteId, e.getMessage());
            return "";
        }
    }

    public List<NoteIndex> listSince(String userId, int days) {
        User user = getUser(userId);
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return vaultData.readNoteIndex(user.getVaultId()).stream()
                .filter(n -> n.getUserId().equals(userId)
                        && n.getArchivedAt() == null
                        && n.getUpdatedAt() != null
                        && n.getUpdatedAt().isAfter(since))
                .sorted(Comparator.comparing(NoteIndex::getUpdatedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    public void moveToFolder(String userId, String noteId, String targetFolderId) {
        User user = getUser(userId);
        List<NoteIndex> allIndexes = vaultData.readNoteIndex(user.getVaultId());
        allIndexes.stream()
                .filter(n -> n.getId().equals(noteId) && n.getUserId().equals(userId))
                .findFirst()
                .ifPresent(n -> {
                    n.setFolderId(targetFolderId);
                    n.setUpdatedAt(Instant.now());
                });
        vaultData.writeNoteIndex(user.getVaultId(), allIndexes);
    }

    // ── private ───────────────────────────────────────────────────────────────

    private NoteIndex findActiveIndex(String vaultId, String userId, String noteId) {
        return vaultData.readNoteIndex(vaultId).stream()
                .filter(n -> n.getId().equals(noteId)
                        && n.getUserId().equals(userId)
                        && n.getArchivedAt() == null)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Note not found: " + noteId));
    }

    private User getUser(String userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }

    private String extractTitle(String content) {
        if (content == null || content.isBlank()) return "Untitled";
        String first = content.strip().lines().findFirst().orElse("").strip();
        first = first.replaceAll("^#{1,6}\\s*", "");
        return first.isBlank() ? "Untitled" : (first.length() > 80 ? first.substring(0, 80) : first);
    }

    /**
     * Agrupa as operações assíncronas de I/O num único método.
     * Sequência:
     *   1. Salva .md no B2
     *   2. Substitui refs desta nota no refs.json do vault
     *   3. Reconstrói entity_index.json
     */
    @Async
    public void saveContentAndRefsAsync(String vaultId, String userId,
                                        String noteId, String content, Instant timestamp) {
        try {
            vault.saveNote(vaultId, noteId, content);
        } catch (Exception e) {
            log.error("[NoteService] Async vault save failed for note {}: {}", noteId, e.getMessage());
        }

        try {
            List<NoteReference> allRefs = vaultData.readRefs(vaultId);
            // Remove refs antigas desta nota
            allRefs.removeIf(r -> r.getNoteId().equals(noteId));
            // Parseia e adiciona as novas (1 por entidade — deduplicado no parser)
            List<NoteReference> newRefs = mentionParser.parse(vaultId, userId, noteId, content, timestamp);
            allRefs.addAll(newRefs);
            vaultData.writeRefs(vaultId, allRefs);

            entityIndexService.rebuildIndex(vaultId);
        } catch (Exception e) {
            log.error("[NoteService] Async ref extraction failed for note {}: {}", noteId, e.getMessage());
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION — EntityService [ARCH-4][V11-ARCH]
// Entidades persistidas em _entities/entities.json no vault B2.
// ─────────────────────────────────────────────────────────────────────────────
