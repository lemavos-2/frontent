package tech.lemnova.continuum.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;

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