package tech.lemnova.continuum.domain.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import tech.lemnova.continuum.domain.plan.PlanType;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed
    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String role = "USER";
    private Boolean active = false;
    private String googleId;

    @Indexed(unique = true, sparse = true)
    private String stripeCustomerId;

    @Indexed(unique = true)
    private String vaultId;

    private PlanType plan = PlanType.FREE;

    private int entityCount = 0;
    private int noteCount   = 0;
    private int habitCount  = 0;

    private Instant createdAt;
    private Instant updatedAt;

    public void syncPlan(PlanType newPlan) {
        this.plan = newPlan;
        this.updatedAt = Instant.now();
    }

    public void incrementEntityCount() {
        this.entityCount++;
        this.updatedAt = Instant.now();
    }

    public void decrementEntityCount() {
        this.entityCount = Math.max(0, this.entityCount - 1);
        this.updatedAt = Instant.now();
    }

    public void incrementNoteCount() {
        this.noteCount++;
        this.updatedAt = Instant.now();
    }

    public void decrementNoteCount() {
        this.noteCount = Math.max(0, this.noteCount - 1);
        this.updatedAt = Instant.now();
    }

    public void incrementHabitCount() {
        this.habitCount++;
        this.updatedAt = Instant.now();
    }

    public void decrementHabitCount() {
        this.habitCount = Math.max(0, this.habitCount - 1);
        this.updatedAt = Instant.now();
    }
}
