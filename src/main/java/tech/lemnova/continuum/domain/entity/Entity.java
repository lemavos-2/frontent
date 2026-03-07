package tech.lemnova.continuum.domain.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Entity {

    private String id;
    private String userId;
    private String name;
    private String description;
    private String icon;    // ex: "👩"
    private String color;   // ex: "#ec4899"
    @JsonProperty("entityType")
    private EntityType type;
    private List<String> tags;
    private TrackingConfig tracking;
    private Instant archivedAt; // null = ativo
    private Map<String, Object> metadata = new HashMap<>();
    private Instant createdAt;
    private Instant updatedAt;

    @JsonIgnore
    public boolean isActive()     { return archivedAt == null; }
    @JsonIgnore
    public boolean isTrackable()  { return tracking != null && tracking.isEnabled(); }

    public void archive() {
        this.archivedAt = Instant.now();
        this.updatedAt  = Instant.now();
    }

    public void restore() {
        this.archivedAt = null;
        this.updatedAt  = Instant.now();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// [V11-ARCH] NoteReference: POJO puro — sem @Document.
// Guardada em _refs/refs.json no vault B2.
// ─────────────────────────────────────────────────────────────────────────────
