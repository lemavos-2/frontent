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
// [V11-ARCH]: lê refs via VaultDataService.
// ─────────────────────────────────────────────────────────────────────────────
