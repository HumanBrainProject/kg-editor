package eu.ebrains.kg.editor.models.deserializers;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import eu.ebrains.kg.editor.models.Permissions;

import java.util.List;

public class PermissionDeserializer extends JsonDeserializer<Permissions> {

    @Override
    public Permissions deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) {
        try {
            List<String> permissions = jsonParser.readValueAs(List.class);
            Permissions p = new Permissions();
            p.setCanCreate(permissions.contains("CREATE"));
            p.setCanInviteForReview(permissions.contains("INVITE_FOR_REVIEW"));
            p.setCanDelete(permissions.contains("DELETE"));
            p.setCanInviteForSuggestion(permissions.contains("INVITE_FOR_SUGGESTION"));
            p.setCanRead(permissions.contains("READ"));
            p.setCanSuggest(permissions.contains("SUGGEST"));
            p.setCanWrite(permissions.contains("WRITE"));
            p.setCanRelease(permissions.contains("RELEASE"));
            return p;
        } catch (Exception e) { //TODO: Change to a specific exception
            return null;
        }
    }
}
