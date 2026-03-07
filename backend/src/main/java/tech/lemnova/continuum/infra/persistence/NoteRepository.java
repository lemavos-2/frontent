package tech.lemnova.continuum.infra.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.lemnova.continuum.domain.note.Note;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findByVaultId(String vaultId);
}