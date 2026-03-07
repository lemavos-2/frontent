package tech.lemnova.continuum.application.parser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import tech.lemnova.continuum.domain.connection.NoteReference;
import tech.lemnova.continuum.domain.entity.Entity;
import tech.lemnova.continuum.domain.entity.EntityType;
import tech.lemnova.continuum.infra.vault.VaultDataService;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MentionParser {

    private static final Logger log = LoggerFactory.getLogger(MentionParser.class);

    private static final Pattern MENTION_PATTERN =
            Pattern.compile("\\{([a-z]+):([^}\\s]+)\\}", Pattern.CASE_INSENSITIVE);

    private final VaultDataService vaultData;

    public MentionParser(VaultDataService vaultData) {
        this.vaultData = vaultData;
    }

    /**
     * Extrai e valida todas as menções de {@code content}.
     * Retorna NoteReferences válidas, deduplicas por entityId (1 por nota).
     */
    public List<NoteReference> parse(String vaultId, String userId, String noteId,
                                     String content, Instant timestamp) {
        List<NoteReference> refs = new ArrayList<>();
        if (content == null || content.isBlank()) return refs;

        List<Entity> entities = vaultData.readEntities(vaultId);
        Map<String, Entity> entityMap = new HashMap<>();
        for (Entity e : entities) entityMap.put(e.getId(), e);

        LocalDate date = timestamp.atZone(ZoneId.systemDefault()).toLocalDate();
        Matcher m = MENTION_PATTERN.matcher(content);

        // [BUG-3 FIX] Deduplicação: 1 NoteReference por entidade por nota.
        Map<String, NoteReference> seen = new LinkedHashMap<>();

        while (m.find()) {
            String declaredTypeStr = m.group(1).toLowerCase();
            String entityId     = m.group(2);

            if (seen.containsKey(entityId)) continue;

            Entity entity = entityMap.get(entityId);
            if (entity == null || !entity.getUserId().equals(userId)) {
                log.warn("[MentionParser] Entity {} not found or not owned by user {} — skipping", entityId, userId);
                continue;
            }

            EntityType declaredType;
            try {
                declaredType = EntityType.valueOf(declaredTypeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("[MentionParser] Invalid entity type '{}' for entity {} — skipping", declaredTypeStr, entityId);
                continue;
            }

            if (!declaredType.equals(entity.getType())) {
                log.warn("[MentionParser] Type mismatch for entity {}: declared='{}', real='{}' — skipping",
                        entityId, declaredType, entity.getType());
                continue;
            }

            if (!entity.isActive()) {
                log.debug("[MentionParser] Entity {} is archived — skipping mention", entityId);
                continue;
            }

            int ctxStart = Math.max(0, m.start() - 75);
            int ctxEnd   = Math.min(content.length(), m.end() + 75);
            String context = content.substring(ctxStart, ctxEnd).strip();

            NoteReference ref = new NoteReference();
            ref.setId(UUID.randomUUID().toString().replace("-", ""));
            ref.setUserId(userId);
            ref.setNoteId(noteId);
            ref.setEntityId(entityId);
            ref.setEntityType(entity.getType());
            ref.setEntityName(entity.getName());
            ref.setDate(date);
            ref.setContext(context);
            ref.setCreatedAt(Instant.now());
            ref.setUpdatedAt(Instant.now());
            ref.setArchivedAt(null);

            seen.put(entityId, ref);
        }

        refs.addAll(seen.values());
        return refs;
    }

    public List<String> extractEntityIds(String content) {
        List<String> ids = new ArrayList<>();
        if (content == null || content.isBlank()) return ids;
        Matcher m = MENTION_PATTERN.matcher(content);
        while (m.find()) {
            String id = m.group(2);
            if (!ids.contains(id)) ids.add(id);
        }
        return ids;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION — EntityIndexService [ARCH-2]
// Reconstrói entity_index.json no vault B2 a partir dos refs do vault.
// [V11-ARCH]: lê refs via VaultDataService.
// ─────────────────────────────────────────────────────────────────────────────
