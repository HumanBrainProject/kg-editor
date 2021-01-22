package eu.ebrains.kg.editor.models.deserializers;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import eu.ebrains.kg.editor.models.StructureOfType;

import java.io.IOException;

public class StructureOfTypeDeserializer extends JsonDeserializer<StructureOfType> {

    @Override
    public StructureOfType deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
        StructureOfType result = new StructureOfType();

        return result;
    }
}
