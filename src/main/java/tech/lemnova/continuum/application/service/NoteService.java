package tech.lemnova.continuum.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.lemnova.continuum.application.exception.NotFoundException;
import tech.lemnova.continuum.application.exception.PlanLimitException;
import tech.lemnova.continuum.application.parser.MentionParser;
import tech.lemnova.continuum.controller.dto.note.NoteCreateRequest;
import tech.lemnova.continuum.controller.dto.note.NoteResponse;
import tech.lemnova.continuum.controller.dto.note.NoteUpdateRequest;
import tech.lemnova.continuum.domain.connection.NoteReference;
import tech.lemnova.continuum.domain.note.NoteSearchResult;
import tech.lemnova.continuum.domain.plan.PlanConfiguration;
import tech.lemnova.continuum.domain.user.User;
import tech.lemnova.continuum.domain.user.UserRepository;
import tech.lemnova.continuum.infra.vault.VaultDataService;
import tech.lemnova.continuum.infra.vault.VaultStorageService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private static final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final UserRepository userRepo;
    private final VaultStorageService vault;
    private final VaultDataService vaultData;
    private final PlanConfiguration planConfig;
    private final MentionParser mentionParser;
    private final EntityIndexService entityIndexService;

    public NoteService(UserRepository userRepo,
                       VaultStorageService vault,
                       VaultDataService vaultData,
                       PlanConfiguration planConfig,
                       MentionParser mentionParser,
                       EntityIndexService entityIndexService) {
        this.userRepo           = userRepo;
        this.vault              = vault;
        this.vaultData          = vaultData;
        this.planConfig         = planConfig;
        this.mentionParser      = mentionParser;
        this.entityIndexService = entityIndexService;
    }

    @Transactional
    public NoteResponse create(String userId, NoteCreateRequest req) {
        User user = getUser(userId);
        if (!planConfig.canCreateNote(user.getPlan(), user.getNoteCount()))
            throw new PlanLimitException("Note limit reached for plan " + user.getPlan()
                    + " (" + user.getNoteCount() + "/" + planConfig.getLimits(user.getPlan()).maxNotes() + ").");

        String noteId  = UUID.randomUUID().toString().replace("-", "");
        String content = req.content() != null ? req.content() : "";

        NoteIndex index = new NoteIndex();
        index.setId(noteId);
        index.setUserId(userId);
        index.setFolderId(req.folderId());
        index.setTitle(extractTitle(content));
        index.setCreatedAt(Instant.now());
        index.setUpdatedAt(Instant.now());

        // Persiste o NoteIndex no vault (lista de índices)
        List<NoteIndex> allIndexes = vaultData.readNoteIndex(user.getVaultId());
        allIndexes.add(index);
        vaultData.writeNoteIndex(user.getVaultId(), allIndexes);

        // Incrementa contador no MongoDB para validação rápida de limites
        user.incrementNoteCount();
        userRepo.save(user);

        saveContentAndRefsAsync(user.getVaultId(), userId, noteId, content, index.getCreatedAt());

        return NoteResponse.from(index, content);
    }

    /**
     * [BUG-1] CORRIGIDO: só o NoteIndex da nota editada é atualizado.
     * Carrega a lista, substitui apenas o registro alvo, salva de volta.
     */
    @Transactional
    public NoteResponse update(String userId, String noteId, NoteUpdateRequest req) {
        User user = getUser(userId);
        List<NoteIndex> allIndexes = vaultData.readNoteIndex(user.getVaultId());

        NoteIndex index = allIndexes.stream()
                .filter(n -> n.getId().equals(noteId) && n.getUserId().equals(userId)
                        && n.getArchivedAt() == null)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Note not found: " + noteId));

        String content = req.content() != null ? req.content() : "";
        index.setTitle(extractTitle(content));
        index.setUpdatedAt(Instant.now());

        vaultData.writeNoteIndex(user.getVaultId(), allIndexes);

        saveContentAndRefsAsync(user.getVaultId(), userId, noteId, content, index.getUpdatedAt());

        return NoteResponse.from(index, content);
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

    public NoteResponse get(String userId, String noteId) {
        User user = getUser(userId);
        NoteIndex index = findActiveIndex(user.getVaultId(), userId, noteId);
        String content = vault.loadNote(user.getVaultId(), noteId).orElse("");
        return NoteResponse.from(index, content);
    }

    public List<NoteIndex> list(String userId, String folderId) {
        User user = getUser(userId);
        return vaultData.readNoteIndex(user.getVaultId()).stream()
                .filter(n -> n.getUserId().equals(userId) && n.getArchivedAt() == null)
                .filter(n -> folderId == null
                        ? true
                        : folderId.equals(n.getFolderId()))
                .sorted(Comparator.comparing(NoteIndex::getCreatedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    public List<NoteIndex> listInRoot(String userId) {
        User user = getUser(userId);
        return vaultData.readNoteIndex(user.getVaultId()).stream()
                .filter(n -> n.getUserId().equals(userId)
                        && n.getArchivedAt() == null && n.getFolderId() == null)
                .sorted(Comparator.comparing(NoteIndex::getCreatedAt, Comparator.reverseOrder()))
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
