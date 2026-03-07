package tech.lemnova.continuum.domain.stripe;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stripe_event_log")
public class StripeEventLog {

    @Id
    private String id;

    @Indexed(unique = true)
    private String eventId;

    private String eventType;
    private String subscriptionId;
    private String customerId;
    private Instant processedAt = Instant.now();
}
