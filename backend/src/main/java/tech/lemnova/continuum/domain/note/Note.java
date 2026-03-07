package tech.lemnova.continuum.domain.note;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Note {

    @Id
    private String id;
    private String vaultId;
    private String folderId;
    private String title;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
}