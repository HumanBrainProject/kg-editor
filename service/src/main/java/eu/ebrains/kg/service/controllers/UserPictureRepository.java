package eu.ebrains.kg.service.controllers;

import eu.ebrains.kg.service.services.ServiceCall;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.Collections;
import java.util.Map;

@Component
public class UserPictureRepository {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final ServiceCall kg;

    public UserPictureRepository(ServiceCall kg) {
        this.kg = kg;
    }

    @Cacheable(value="userPicture")
    public String fetchUserPicture(String userId){
        logger.info(String.format("Fetching user %s picture from endpoint - no cache available", userId));
        String relativeUrl = "users/pictures";
        Map<String, String> usersPictures = kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(Collections.singletonList(userId))).retrieve().bodyToMono(Map.class).block();
        return usersPictures!=null ? usersPictures.get(userId) : null;
    }
}
