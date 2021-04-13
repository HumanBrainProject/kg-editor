package eu.ebrains.kg.editor.models.user;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import eu.ebrains.kg.editor.models.commons.UserSummary;
import org.springframework.util.CollectionUtils;

import java.util.List;

public class UserProfile extends UserSummary {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public UserProfile(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) List<String> kgId,
            @JsonProperty(SchemaFieldsConstants.ALTERNATENAME) String kgUserName,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName,
            @JsonProperty(SchemaFieldsConstants.GIVEN_NAME) String kgGivenName,
            @JsonProperty(SchemaFieldsConstants.FAMILY_NAME) String kgFamilyName,
            @JsonProperty(SchemaFieldsConstants.EMAIL) String kgEmail){
        super(!CollectionUtils.isEmpty(kgId) ? kgId.get(0) : null, kgUserName, kgName);
        this.givenName = kgGivenName;
        this.familyName = kgFamilyName;
        this.email = kgEmail;
    }

    private final String givenName;
    private final String familyName;
    private final String email;
    private Boolean isCurator;
    private List<Space> spaces;

    public String getGivenName() {
        return givenName;
    }

    public String getFamilyName() {
        return familyName;
    }

    public String getEmail() {
        return email;
    }

    public Boolean getCurator() {
        return isCurator;
    }

    public void setCurator(Boolean curator) {
        isCurator = curator;
    }

    public List<Space> getSpaces() {
        return spaces;
    }

    public void setSpaces(List<Space> spaces) {
        this.spaces = spaces;
    }
}
