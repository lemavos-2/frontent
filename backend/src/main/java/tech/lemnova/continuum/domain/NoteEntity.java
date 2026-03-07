package tech.lemnova.continuum.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(NoteEntityId.class)
public class NoteEntity {

    @Id
    private String noteId;
    @Id
    private String entityId;
    private Integer position;
}