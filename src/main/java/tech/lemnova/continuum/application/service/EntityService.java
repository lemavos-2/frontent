package tech.lemnova.continuum.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tech.lemnova.continuum.application.exception.NotFoundException;
import tech.lemnova.continuum.application.exception.PlanLimitException;
import tech.lemnova.continuum.controller.dto.entity.EntityCreateRequest;
import tech.lemnova.continuum.controller.dto.entity.EntityUpdateRequest;
import tech.lemnova.continuum.domain.entity.Entity;
import tech.lemnova.continuum.domain.entity.EntityType;
import tech.lemnova.continuum.domain.plan.PlanConfiguration;
import tech.lemnova.continuum.domain.user.User;
import tech.lemnova.continuum.domain.user.UserRepository;
import tech.lemnova.continuum.infra.vault.VaultDataService;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EntityService {

    private static final Logger log = LoggerFactory.getLogger(EntityService.class);

    private final UserRepository userRepo;
    private final VaultDataService vaultData;
    private final PlanConfiguration planConfig;

    public EntityService(UserRepository userRepo,
                         VaultDataService vaultData,
                         PlanConfiguration planConfig) {
        this.userRepo   = userRepo;
        this.vaultData  = vaultData;
        this.planConfig = planConfig;
    }

    public Entity create(String userId, EntityCreateRequest req) {
        User user = getUser(userId);
        validateEntityLimit(user);
        if (req.type() == EntityType.HABIT) validateHabitLimit(user);

        Entity entity = new Entity();
        entity.setId("ent_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        entity.setUserId(userId);
        entity.setName(req.name().trim());
        entity.setDescription(req.description());
        entity.setType(req.type());
        entity.setIcon(req.icon());
        entity.setColor(req.color());
        entity.setTags(req.tags());
        entity.setTracking(req.tracking());
        entity.setMetadata(req.metadata() != null ? req.metadata() : new HashMap<>());
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        List<Entity> entities = vaultData.readEntities(user.getVaultId());
        entities.add(entity);
        vaultData.writeEntities(user.getVaultId(), entities);

        user.incrementEntityCount();
        if (req.type() == EntityType.HABIT) user.incrementHabitCount();
        userRepo.save(user);

        log.info("Entity created: {} type={} user={}", entity.getId(), entity.getType(), userId);
        return entity;
    }

    public List<Entity> list(String userId) {
        return getEntitiesFor(userId).stream()
                .filter(Entity::isActive).collect(Collectors.toList());
    }

    public List<Entity> listByType(String userId, EntityType type) {
        return getEntitiesFor(userId).stream()
                .filter(e -> e.isActive() && e.getType() == type).collect(Collectors.toList());
    }

    public List<Entity> search(String userId, String query, EntityType type) {
        if (query == null || query.isBlank()) {
            return type != null ? listByType(userId, type) : list(userId);
        }
        String q = query.trim().toLowerCase();
        return getEntitiesFor(userId).stream()
                .filter(e -> e.isActive()
                        && (type == null || e.getType() == type)
                        && e.getName().toLowerCase().contains(q))
                .collect(Collectors.toList());
    }

    public Entity get(String userId, String entityId) {
        return getEntitiesFor(userId).stream()
                .filter(e -> e.getId().equals(entityId) && e.isActive())
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Entity not found: " + entityId));
    }

    public Entity update(String userId, String entityId, EntityUpdateRequest req) {
        User user = getUser(userId);
        List<Entity> entities = vaultData.readEntities(user.getVaultId());
        Entity entity = entities.stream()
                .filter(e -> e.getId().equals(entityId) && e.getUserId().equals(userId) && e.isActive())
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Entity not found: " + entityId));

        if (req.name() != null)        entity.setName(req.name().trim());
        if (req.description() != null) entity.setDescription(req.description());
        if (req.icon() != null)        entity.setIcon(req.icon());
        if (req.color() != null)       entity.setColor(req.color());
        if (req.tags() != null)        entity.setTags(req.tags());
        if (req.tracking() != null)    entity.setTracking(req.tracking());
        if (req.metadata() != null)    entity.setMetadata(req.metadata());
        entity.setUpdatedAt(Instant.now());

        vaultData.writeEntities(user.getVaultId(), entities);
        return entity;
    }

    public void archive(String userId, String entityId) {
        User user = getUser(userId);
        List<Entity> entities = vaultData.readEntities(user.getVaultId());
        Entity entity = entities.stream()
                .filter(e -> e.getId().equals(entityId) && e.getUserId().equals(userId) && e.isActive())
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Entity not found: " + entityId));

        entity.archive();
        vaultData.writeEntities(user.getVaultId(), entities);

        user.decrementEntityCount();
        if (entity.getType() == EntityType.HABIT) user.decrementHabitCount();
        userRepo.save(user);
    }

    public Entity restore(String userId, String entityId) {
        User user = getUser(userId);
        validateEntityLimit(user);
        List<Entity> entities = vaultData.readEntities(user.getVaultId());
        Entity entity = entities.stream()
                .filter(e -> e.getId().equals(entityId) && e.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Entity not found: " + entityId));

        entity.restore();
        vaultData.writeEntities(user.getVaultId(), entities);

        user.incrementEntityCount();
        if (entity.getType() == EntityType.HABIT) user.incrementHabitCount();
        userRepo.save(user);
        return entity;
    }

    public void deletePermanent(String userId, String entityId) {
        User user = getUser(userId);
        List<Entity> entities = vaultData.readEntities(user.getVaultId());
        Entity entity = entities.stream()
                .filter(e -> e.getId().equals(entityId) && e.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Entity not found: " + entityId));

        // remove entity
        entities.removeIf(e -> e.getId().equals(entityId));
        vaultData.writeEntities(user.getVaultId(), entities);

        // remove references to this entity from refs
        var refs = vaultData.readRefs(user.getVaultId());
        refs.removeIf(r -> r.getEntityId().equals(entityId));
        vaultData.writeRefs(user.getVaultId(), refs);

        // remove tracking events for this entity
        var events = vaultData.readTrackingEvents(user.getVaultId());
        events.removeIf(ev -> ev.getEntityId().equals(entityId));
        vaultData.writeTrackingEvents(user.getVaultId(), events);

        // update counters
        user.decrementEntityCount();
        if (entity.getType() == EntityType.HABIT) user.decrementHabitCount();
        userRepo.save(user);
    }

    public List<Entity> listArchived(String userId) {
        return getEntitiesFor(userId).stream()
                .filter(e -> !e.isActive()).collect(Collectors.toList());
    }

    public java.util.Map<String, Integer> mentionCounts(String userId, java.util.List<String> ids) {
        User user = getUser(userId);
        var refs = vaultData.readRefs(user.getVaultId());
        java.util.Map<String, Integer> counts = new java.util.HashMap<>();
        for (String id : ids) counts.put(id, 0);
        for (var r : refs) {
            String eid = r.getEntityId();
            if (eid == null) continue;
            if (counts.containsKey(eid)) counts.put(eid, counts.get(eid) + 1);
        }
        return counts;
    }

    // ── private ───────────────────────────────────────────────────────────────

    private List<Entity> getEntitiesFor(String userId) {
        User user = getUser(userId);
        return vaultData.readEntities(user.getVaultId()).stream()
                .filter(e -> e.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    private User getUser(String userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }

    private void validateEntityLimit(User user) {
        if (!planConfig.canCreateEntity(user.getPlan(), user.getEntityCount()))
            throw new PlanLimitException("Entity limit reached for plan " + user.getPlan()
                    + " (" + user.getEntityCount() + "/" + planConfig.getLimits(user.getPlan()).maxEntities() + ").");
    }

    private void validateHabitLimit(User user) {
        if (!planConfig.canCreateHabit(user.getPlan(), user.getHabitCount()))
            throw new PlanLimitException("Habit limit reached for plan " + user.getPlan()
                    + " (" + user.getHabitCount() + "/" + planConfig.getLimits(user.getPlan()).maxHabits() + ").");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION — FolderService [ARCH-7][V11-ARCH]
// Pastas persistidas em _folders/folders.json no vault B2.
// ─────────────────────────────────────────────────────────────────────────────
