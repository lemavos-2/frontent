package tech.lemnova.continuum.application.parser;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("EntityParser")
class EntityParserTest {

    private EntityParser parser;

    @BeforeEach
    void setUp() {
        parser = new EntityParser();
    }

    @Test
    @DisplayName("parseEntities: extracts [[Title]] references from content")
    void parseEntities_extractsTitles() {
        String content = "This note mentions [[AI]] and [[Machine Learning]]";
        List<String> entities = parser.parseEntities(content);

        assertThat(entities).hasSize(2);
        assertThat(entities).containsExactly("AI", "Machine Learning");
    }

    @Test
    @DisplayName("parseEntities: returns empty list for content without references")
    void parseEntities_noReferences() {
        String content = "This is plain text with no entity references";
        List<String> entities = parser.parseEntities(content);

        assertThat(entities).isEmpty();
    }

    @Test
    @DisplayName("parseEntities: returns empty list for null content")
    void parseEntities_nullContent() {
        List<String> entities = parser.parseEntities(null);

        assertThat(entities).isEmpty();
    }

    @Test
    @DisplayName("parseEntities: trims whitespace from titles")
    void parseEntities_trimsWhitespace() {
        String content = "Check out [[ AI ]] and [[  Python  ]]";
        List<String> entities = parser.parseEntities(content);

        assertThat(entities).containsExactly("AI", "Python");
    }

    @Test
    @DisplayName("parseEntities: handles multiple references to same entity")
    void parseEntities_duplicateReferences() {
        String content = "[[AI]] is discussed here, and [[AI]] is mentioned again";
        List<String> entities = parser.parseEntities(content);

        assertThat(entities).hasSize(2);
        assertThat(entities).containsExactly("AI", "AI");
    }
}
