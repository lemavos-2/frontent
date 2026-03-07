package tech.lemnova.continuum.infra.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.lemnova.continuum.domain.NoteEntity;
import tech.lemnova.continuum.domain.NoteEntityId;
import java.util.List;

public interface NoteEntityRepository extends JpaRepository<NoteEntity, NoteEntityId> {
    List<NoteEntity> findByNoteId(String noteId);
    List<NoteEntity> findByEntityId(String entityId);
}