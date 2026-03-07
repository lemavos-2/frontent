package tech.lemnova.continuum.application.parser;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class EntityParser {

    private static final Pattern ENTITY_PATTERN = Pattern.compile("\\[\\[([^\\]]+)\\]\\]");

    /**
     * Parses entity references from note content.
     * Returns list of entity titles found in [[Title]] format.
     */
    public List<String> parseEntities(String content) {
        List<String> entities = new ArrayList<>();
        if (content == null || content.isBlank()) return entities;

        Matcher matcher = ENTITY_PATTERN.matcher(content);
        while (matcher.find()) {
            String title = matcher.group(1).trim();
            if (!title.isEmpty()) {
                entities.add(title);
            }
        }
        return entities;
    }
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
