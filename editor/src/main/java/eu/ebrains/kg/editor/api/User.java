package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.controllers.IdController;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.user.UserProfile;
import eu.ebrains.kg.editor.models.user.Space;
import eu.ebrains.kg.editor.services.UserClient;
import eu.ebrains.kg.editor.services.SpaceClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RequestMapping("/user")
@RestController
public class User {

    private final IdController idController;
    private final UserClient userClient;
    private final SpaceClient spaceClient;

    public User(IdController idController, UserClient userClient, SpaceClient spaceClient) {
        this.idController = idController;
        this.userClient = userClient;
        this.spaceClient = spaceClient;
    }

    private static boolean isUserRelevantSpace(Space w){
        return (w.getClientSpace() == null || !w.getClientSpace()) && (w.getInternalSpace() == null || !w.getInternalSpace());
    }

    @GetMapping
    public KGCoreResult<UserProfile> getUserProfile() {
        UserProfile userProfile = this.userClient.getUserProfile();
        if(userProfile!=null) {
            UUID uuid = idController.simplifyFullyQualifiedId(userProfile.getId());
            if(uuid!=null) {
                userProfile.setId(uuid.toString());
            }
            List<Space> spaces = spaceClient.getSpaces();
            if (spaces != null) {
                userProfile.setSpaces(spaces.stream().filter(User::isUserRelevantSpace).collect(Collectors.toList()));
            }
            Map<?, ?> userPictures = userClient.getUserPictures(Collections.singletonList(userProfile.getId()));
            if (userPictures != null && userPictures.get(userProfile.getId()) != null) {
                userProfile.setPicture(userPictures.get(userProfile.getId()).toString());
            }
            return new KGCoreResult<UserProfile>().setData(userProfile);
        }
        return null;
    }

    //FIXME this endpoint does not work properly yet (already with the old service).
//    @PutMapping(value = "/picture", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
//    public void saveUserPicture(@RequestBody String payload) {
//        System.out.println(payload);
//    }

}
