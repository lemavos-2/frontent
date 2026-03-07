package tech.lemnova.continuum.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tech.lemnova.continuum.application.parser.MentionParser;
import tech.lemnova.continuum.application.service.EntityIndexService;
import tech.lemnova.continuum.domain.note.NoteIndex;
import tech.lemnova.continuum.domain.user.User;
import tech.lemnova.continuum.domain.user.UserRepository;
import tech.lemnova.continuum.domain.plan.PlanConfiguration;
import tech.lemnova.continuum.domain.plan.PlanType;
import tech.lemnova.continuum.infra.vault.VaultStorageService;
import tech.lemnova.continuum.infra.vault.VaultDataService;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class NoteServiceUnitTest {

    @Mock UserRepository userRepo;
    @Mock VaultStorageService vaultStorage;
    @Mock VaultDataService vaultData;
    @Mock PlanConfiguration planConfig;
    @Mock MentionParser mentionParser;
    @Mock EntityIndexService entityIndexService;

    NoteService noteService;

    User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        noteService = new NoteService(userRepo, vaultStorage, vaultData, planConfig, mentionParser, entityIndexService);

        user = new User();
        user.setId("u1");
        user.setVaultId("vault1");
        user.setPlan(PlanType.FREE);
        user.setNoteCount(0);

        when(userRepo.findById("u1")).thenReturn(Optional.of(user));
        when(vaultData.readNoteIndex("vault1")).thenReturn(List.of());
        when(planConfig.canCreateNote(any(), anyInt())).thenReturn(true);
    }

    @Test
    void listNotes_returnsEmptyList_whenVaultEmpty() {
        // list(userId, folderId) — null folderId = sem filtro de pasta
        var result = noteService.list("u1", null);
        assertThat(result).isEmpty();
    }

    @Test
    void listNotes_returnsOnlyActiveNotes() {
        NoteIndex active   = new NoteIndex();
        active.setId("n1");
        active.setUserId("u1");
        active.setTitle("Active");

        NoteIndex archived = new NoteIndex();
        archived.setId("n2");
        archived.setUserId("u1");
        archived.setTitle("Old");
        archived.setArchivedAt(java.time.Instant.now().minusSeconds(3600));

        when(vaultData.readNoteIndex("vault1")).thenReturn(List.of(active, archived));

        // list filtra apenas notas ativas (archivedAt == null)
        var result = noteService.list("u1", null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("n1");
    }
}
