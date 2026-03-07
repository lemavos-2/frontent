package tech.lemnova.continuum.application.service;

import org.springframework.stereotype.Service;
import tech.lemnova.continuum.application.exception.NotFoundException;
import tech.lemnova.continuum.domain.entity.Entity;
import tech.lemnova.continuum.domain.note.Note;
import tech.lemnova.continuum.infra.persistence.EntityRepository;
import tech.lemnova.continuum.infra.persistence.NoteRepository;
import tech.lemnova.continuum.infra.persistence.NoteEntityRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntityService {

    private final EntityRepository entityRepo;
    private final NoteRepository noteRepo;
    private final NoteEntityRepository noteEntityRepo;

    public EntityService(EntityRepository entityRepo,
                         NoteRepository noteRepo,
                         NoteEntityRepository noteEntityRepo) {
        this.entityRepo = entityRepo;
        this.noteRepo = noteRepo;
        this.noteEntityRepo = noteEntityRepo;
    }

    public Entity getEntity(String vaultId, String entityId) {
        return entityRepo.findById(entityId)
                .filter(e -> e.getVaultId().equals(vaultId))
                .orElseThrow(() -> new NotFoundException("Entity not found: " + entityId));
    }

    public List<Note> getNotesForEntity(String vaultId, String entityId) {
        getEntity(vaultId, entityId); // validate
        List<String> noteIds = noteEntityRepo.findByEntityId(entityId)
                .stream().map(NoteEntity::getNoteId).collect(Collectors.toList());
        return noteRepo.findAllById(noteIds).stream()
                .filter(n -> n.getVaultId().equals(vaultId))
                .collect(Collectors.toList());
    }

    public List<Entity> getConnections(String vaultId, String entityId) {
        getEntity(vaultId, entityId); // validate
        List<String> noteIds = noteEntityRepo.findByEntityId(entityId)
                .stream().map(NoteEntity::getNoteId).collect(Collectors.toList());
        List<String> coEntityIds = noteEntityRepo.findAll().stream()
                .filter(ne -> noteIds.contains(ne.getNoteId()) && !ne.getEntityId().equals(entityId))
                .map(NoteEntity::getEntityId)
                .distinct()
                .collect(Collectors.toList());
        return entityRepo.findAllById(coEntityIds).stream()
                .filter(e -> e.getVaultId().equals(vaultId))
                .collect(Collectors.toList());
    }
}
