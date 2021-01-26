package eu.ebrains.kg.editor.controllers;

import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.commons.UserSummary;
import eu.ebrains.kg.editor.models.instance.*;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;
import eu.ebrains.kg.editor.models.workspace.StructureOfType;
import eu.ebrains.kg.editor.services.UserClient;
import eu.ebrains.kg.editor.services.WorkspaceClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.HttpClientErrorException;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class InstanceController {
    private final WorkspaceClient workspaceClient;
    private final IdController idController;
    private final UserClient userClient;

    public InstanceController(WorkspaceClient workspaceClient, IdController idController, UserClient userClient) {
        this.workspaceClient = workspaceClient;
        this.idController = idController;
        this.userClient = userClient;
    }

    public InstanceFull enrichInstance(ResultWithOriginalMap<InstanceFull> instanceWithMap){
        InstanceFull instance = idController.simplifyId(instanceWithMap.getResult());
        Map<String, KGCoreResult<StructureOfType>> typesByName = getTypesByName(instance);
        enrichTypesAndFields(instance, instanceWithMap.getOriginalMap(), typesByName);
        enrichAlternatives(instance);
        return instance;
    }

    public List<ResultWithOriginalMap<InstanceFull>> enrichInstances(List<ResultWithOriginalMap<InstanceFull>> instancesWithMap) {
//        List<ResultWithOriginalMap<InstanceFull>> instancesWithResult = instancesWithMap.stream().map(instanceWithMap -> {
//            InstanceFull instanceFull = idController.simplifyId(instanceWithMap.getResult());
//            return new ResultWithOriginalMap<>(instanceWithMap.getOriginalMap(), instanceFull);
//        }).collect(Collectors.toList());
//        Map<String, KGCoreResult<StructureOfType>> typesByName = getTypesByName((InstanceLabel) instancesWithResult);
//        instancesWithResult.forEach(instanceWithResult -> {
//            Map<String, KGCoreResult<StructureOfType>> filteredTypes = getFilteredTypes(typesByName, instanceWithResult.getResult());
//            enrichTypesAndFields(instanceWithResult.getResult(), instanceWithResult.getOriginalMap(), filteredTypes);
//        });
//        return instancesWithResult;
        return null;
    }

    private Map<String, KGCoreResult<StructureOfType>> getFilteredTypes(Map<String, KGCoreResult<StructureOfType>> typesByName, InstanceLabel instance) {
      Map<String, KGCoreResult<StructureOfType>> result = new HashMap<>();
      instance.getTypes().forEach(t -> result.put(t.getName(), typesByName.get(t.getName())));
      return result;
    }

    private void enrichSimpleType(SimpleType t, Map<String, KGCoreResult<StructureOfType>> typesByName){
        KGCoreResult<StructureOfType> structureOfTypeKGCoreResult = typesByName.get(t.getName());
        if (structureOfTypeKGCoreResult != null && structureOfTypeKGCoreResult.getData() != null) {
            t.setColor(structureOfTypeKGCoreResult.getData().getColor());
            t.setLabel(structureOfTypeKGCoreResult.getData().getLabel());
        }
    }

    private void simplifyIdsOfLinks(StructureOfField field, Map<?, ?> originalMap){
        Object fromMap = originalMap.get(field.getFullyQualifiedName());
        if (fromMap instanceof Collection) {
            field.setValue(((Collection<?>) fromMap).stream().map(idController::simplifyIdIfObjectIsAMap));
        } else if (fromMap != null) {
            field.setValue(idController.simplifyIdIfObjectIsAMap(fromMap));
        }
    }

    /**
     * The editor UI expects a combined payload. This is why we recombine information of the instance with type information
     */
    private void enrichTypesAndFields(InstanceFull instance, Map<?, ?> originalMap, Map<String, KGCoreResult<StructureOfType>> typesByName){
        if (typesByName != null) {
            // Fill the type information
            instance.getTypes().forEach(t -> enrichSimpleType(t, typesByName));

            // Define the fields with the structure of the type and the values of the instance
            List<StructureOfField> fields = typesByName.values().stream().map(KGCoreResult::getData).
                    filter(Objects::nonNull).map(t -> t.getFields().values()).
                    flatMap(Collection::stream).distinct().collect(Collectors.toList());
            fields.forEach(f -> simplifyIdsOfLinks(f, originalMap));
            instance.setFields(fields);

            //Define special fields such as promoted and label
            instance.setPromotedFields(typesByName.values().stream().map(KGCoreResult::getData)
                    .filter(Objects::nonNull).map(StructureOfType::getPromotedFields).
                            flatMap(Collection::stream).distinct().collect(Collectors.toList()));
            instance.setLabelField(typesByName.values().stream().map(KGCoreResult::getData)
                    .filter(Objects::nonNull).map(StructureOfType::getLabelField).findFirst().orElse(null));
        }
    }

    private Map<String, KGCoreResult<StructureOfType>> getTypesByName(InstanceLabel instance) {
        List<String> involvedTypes = instance.getTypes().stream().map(SimpleType::getName).collect(Collectors.toList());
        return workspaceClient.getTypesByName(involvedTypes, true);
    }

    private Map<String, KGCoreResult<StructureOfType>> getTypesByName(List<InstanceLabel> instances) {
        Stream<SimpleType> simpleTypeStream = instances.stream().map(InstanceLabel::getTypes).flatMap(Collection::stream);
        List<String> involvedTypes = simpleTypeStream.map(SimpleType::getName).collect(Collectors.toList()).stream().distinct().collect(Collectors.toList());
        return  workspaceClient.getTypesByName(involvedTypes, true);
    }

    /**
     * Normalize users of alternatives and add pictures
     */
    private void enrichAlternatives(InstanceFull instance){
        Stream<UserSummary> allUsers = instance.getAlternatives().values().stream().flatMap(Collection::stream)
                .map(Alternative::getUsers).flatMap(Collection::stream);
        List<String> userIds = allUsers.map(u -> {
            UserSummary userSummary = idController.simplifyId(u);
            return userSummary.getId();
        }).filter(Objects::nonNull).distinct().collect(Collectors.toList());

        instance.getAlternatives().values().stream().forEach(value -> value.forEach(v -> idController.simplifyIdIfObjectIsAMap(v.getValue())));

        /* TODO there's a lot of replication of big payloads here since we're keeping the picture in every sub element.
         *  Can't we just provide an additional map at the root level which is then looked up by the UI?
         */
        Map<String, String> userPictures = userClient.getUserPictures(userIds);
        instance.getAlternatives().values().stream().flatMap(Collection::stream)
                .map(Alternative::getUsers).flatMap(Collection::stream).forEach(u ->
                u.setPicture(userPictures.get(u.getId()))
        );
    }


    public KGCoreResult.Single normalizeInstance(String id, KGCoreResult.Single instance) {
        List<String> typesToRetrieve = (List<String>) instance.getData().get("@type");
        if(CollectionUtils.isEmpty(typesToRetrieve)) {
           throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while extracting the types! Please try again!");
        }
        Map<String, KGCoreResult<StructureOfType>> typesByName = workspaceClient.getTypesByName(typesToRetrieve, true);
        if(CollectionUtils.isEmpty(typesByName)) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while processing the types! Please try again!");
        }
        return null;

    }
}
