package tech.lemnova.continuum.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tech.lemnova.continuum.controller.dto.entity.EntityCreateRequest;
import tech.lemnova.continuum.controller.dto.entity.EntityUpdateRequest;
import tech.lemnova.continuum.domain.entity.Entity;
import tech.lemnova.continuum.domain.NoteEntity;
import tech.lemnova.continuum.domain.note.Note;
import tech.lemnova.continuum.infra.persistence.EntityRepository;
import tech.lemnova.continuum.infra.persistence.NoteRepository;
import tech.lemnova.continuum.infra.persistence.NoteEntityRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class EntityServiceTest {

    @Mock EntityRepository entityRepo;
    @Mock NoteRepository noteRepo;
    @Mock NoteEntityRepository noteEntityRepo;

    EntityService entityService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        entityService = new EntityService(entityRepo, noteRepo, noteEntityRepo);
    }

    @Test
    @DisplayName("create: saves entity with title and description")
    void create_savesEntity() {
        String vaultId = "vault1";
        EntityCreateRequest req = new EntityCreateRequest("AI", "Artificial Intelligence");
        
        Entity savedEntity = new Entity();
        savedEntity.setId("e1");
        savedEntity.setVaultId(vaultId);
        savedEntity.setTitle("AI");
        savedEntity.setDescription("Artificial Intelligence");
        savedEntity.setCreatedAt(Instant.now());

        when(entityRepo.save(any(Entity.class))).thenReturn(savedEntity);

        Entity result = entityService.create(vaultId, req);
        
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("e1");
        assertThat(result.getTitle()).isEqualTo("AI");
    }

    @Test
    @DisplayName("getEntity: retrieves entity by vault and id")
    void getEntity_returnEntity() {
        String vaultId = "vault1";
        String entityId = "e1";
        
        Entity entity = new Entity();
        entity.setId(entityId);
        entity.setVaultId(vaultId);
        entity.setTitle("AI");

        when(entityRepo.findById(entityId)).thenReturn(Optional.of(entity));

        Entity result = entityService.getEntity(vaultId, entityId);
        
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("AI");
    }

    @Test
    @DisplayName("getNotesForEntity: retrieves all notes linked to entity")
    void getNotesForEntity_returnsNotes() {
        String vaultId = "vault1";
        String entityId = "e1";
        
        Entity entity = new Entity();
        entity.setId(entityId);
        entity.setVaultId(vaultId);

        NoteEntity ne1 = new NoteEntity();
        ne1.setNoteId("n1");
        ne1.setEntityId(entityId);

        Note note1 = new Note();
        note1.setId("n1");
        note1.setVaultId(vaultId);
        note1.setTitle("Note 1");

        when(entityRepo.findById(entityId)).thenReturn(Optional.of(entity));
        when(noteEntityRepo.findByEntityId(entityId)).thenReturn(List.of(ne1));
        when(noteRepo.findAllById(List.of("n1"))).thenReturn(List.of(note1));

        List<Note> result = entityService.getNotesForEntity(vaultId, entityId);
        
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Note 1");
    }

    @Test
    @DisplayName("update: updates entity title and description")
    void update_updatesEntity() {
        String vaultId = "vault1";
        String entityId = "e1";
        EntityUpdateRequest req = new EntityUpdateRequest("Updated Title", "Updated Description");
        
        Entity entity = new Entity();
        entity.setId(entityId);
        entity.setVaultId(vaultId);
        entity.setTitle("Old Title");

        when(entityRepo.findById(entityId)).thenReturn(Optional.of(entity));
        when(entityRepo.save(any(Entity.class))).thenAnswer(i -> i.getArgument(0));

        Entity result = entityService.update(vaultId, entityId, req);
        
        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
    }

    @Test
    @DisplayName("delete: removes entity and its relationships")
    void delete_removesEntity() {
        String vaultId = "vault1";
        String entityId = "e1";
        
        Entity entity = new Entity();
        entity.setId(entityId);
        entity.setVaultId(vaultId);

        when(entityRepo.findById(entityId)).thenReturn(Optional.of(entity));
        when(noteEntityRepo.findByEntityId(entityId)).thenReturn(List.of());

        entityService.delete(vaultId, entityId);
        
        verify(entityRepo, times(1)).delete(entity);
    }
}
