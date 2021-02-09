package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.user.UserProfile;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class UserClient{

    private final ServiceCall kg;

    public UserClient(ServiceCall kg) {
        this.kg = kg;
    }

    private static class UserFromKG extends KGCoreResult<UserProfile>{}

    public UserProfile getUserProfile() {
        String relativeUrl = "users/me";
        UserFromKG response = kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(UserFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

    private static class UserPictureMap extends HashMap<String, String> {}

    public Map<String, String> getUserPictures(List<String> userIds){
        String relativeUrl = "users/pictures";
        return kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(userIds)).retrieve().bodyToMono(UserPictureMap.class).block();
    }

}
