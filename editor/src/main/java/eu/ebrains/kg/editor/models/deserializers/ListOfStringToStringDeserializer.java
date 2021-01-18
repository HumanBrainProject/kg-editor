package eu.ebrains.kg.editor.models.deserializers;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import org.springframework.util.CollectionUtils;

import java.io.IOException;
import java.util.List;

public class ListOfStringToStringDeserializer extends JsonDeserializer<String> {

    @Override
    public String deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) {
        try {
            List<String> ids = jsonParser.readValueAs(List.class);
            if (!CollectionUtils.isEmpty(ids)) {
                return ids.get(0);
            }
            return null;
        } catch (IOException e) {
            return null;
        }
    }
}
