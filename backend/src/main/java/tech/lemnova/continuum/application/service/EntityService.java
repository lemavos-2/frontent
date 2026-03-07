package tech.lemnova.continuum.application.service;

import org.springframework.stereotype.Service;
import tech.lemnova.continuum.application.exception.NotFoundException;
import tech.lemnova.continuum.controller.dto.entity.EntityCreateRequest;
import tech.lemnova.continuum.controller.dto.entity.EntityUpdateRequest;
import tech.lemnova.continuum.domain.entity.Entity;
import tech.lemnova.continuum.domain.note.Note;
import tech.lemnova.continuum.domain.NoteEntity;
import tech.lemnova.continuum.infra.persistence.EntityRepository;
import tech.lemnova.continuum.infra.persistence.NoteRepository;
import tech.lemnova.continuum.infra.persistence.NoteEntityRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
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

    public Entity create(String vaultId, EntityCreateRequest req) {
        Entity entity = new Entity();
        entity.setId(UUID.randomUUID().toString().replace("-", ""));
        entity.setVaultId(vaultId);
        entity.setTitle(req.title().trim());
        entity.setDescription(req.description());
        entity.setCreatedAt(Instant.now());
        return entityRepo.save(entity);
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

    public Entity update(String vaultId, String entityId, EntityUpdateRequest req) {
        Entity entity = getEntity(vaultId, entityId);
        if (req.title() != null && !req.title().isBlank()) {
            entity.setTitle(req.title().trim());
        }
        if (req.description() != null) {
            entity.setDescription(req.description());
        }
        return entityRepo.save(entity);
    }

    public void delete(String vaultId, String entityId) {
        Entity entity = getEntity(vaultId, entityId);
        noteEntityRepo.deleteAll(noteEntityRepo.findByEntityId(entityId));
        entityRepo.delete(entity);
    }

    public List<Entity> listByVault(String vaultId) {
        return entityRepo.findAll().stream()
                .filter(e -> e.getVaultId().equals(vaultId))
                .collect(Collectors.toList());
    }
}
