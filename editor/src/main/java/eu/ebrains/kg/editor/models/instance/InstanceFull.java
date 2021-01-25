package eu.ebrains.kg.editor.models.instance;

import eu.ebrains.kg.editor.models.commons.Permissions;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;

import java.util.List;
import java.util.Map;

public class InstanceFull {
    protected String id;
    protected String workspace;
    protected List<SimpleType> types;
    protected String name;
    protected List<StructureOfField> fields;
    protected Permissions permissions;
    protected Map<String, List<Alternative>> alternatives;
    protected String labelField;
//    protected
//
//    promotedFields: Option[List[String]],
//    labelField: Option[String],
//    fields: Map[String, Field],
//    user: Option[String],
//    error: Option[CoreDataError]

}
