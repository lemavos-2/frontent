package tech.lemnova.continuum.infra.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.lemnova.continuum.domain.entity.Entity;
import java.util.Optional;

public interface EntityRepository extends JpaRepository<Entity, String> {
    Optional<Entity> findByVaultIdAndTitle(String vaultId, String title);
}