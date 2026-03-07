package tech.lemnova.continuum.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"vault_id", "title"}))
public class Entity {

    @Id
    private String id;
    private String vaultId;
    private String title;
    private String description;
    private Instant createdAt;
}

// ─────────────────────────────────────────────────────────────────────────────
// [V11-ARCH] NoteReference: POJO puro — sem @Document.
// Guardada em _refs/refs.json no vault B2.
// ─────────────────────────────────────────────────────────────────────────────
