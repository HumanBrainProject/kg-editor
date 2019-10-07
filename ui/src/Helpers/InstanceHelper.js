export const normalizeInstanceData = (data, transformField) => {
  const instance = {id: null, types: [], primaryType: {name: "", color: "", label: ""}, workspace: "", name: "", fields: [], promotedFields: [], alternatives: [], metadata: {}};
  if (!data) {
    return instance;
  }
  if (data.id) {
    instance.id = data.id;
  }
  if (data.type instanceof Array) {
    instance.types = data.type.map((type, index) => ({
      name: type,
      label: (data.typeLabels instanceof Array && data.typeLabels.length > index)?data.typeLabels[index]:"",
      color: (data.typeColors instanceof Array && data.typeColors.length > index)?data.typeColors[index]:""
    }));
    if (instance.types.length) {
      instance.primaryType = instance.types[0];
    }
  }
  if (data.workspace) {
    instance.workspace = data.workspace;
  }
  if (data.name) {
    instance.name = data.name;
  }
  if (data.promotedFields instanceof Array) {
    instance.promotedFields = data.promotedFields;
  }
  if (typeof data.fields === "object") {
    for(let fieldKey in data.fields) {
      const field = data.fields[fieldKey];
      typeof transformField === "function"  && transformField(field);
      if(field.type === "InputText"){
        field.type = "KgInputText";
      } else if(field.type === "TextArea"){
        field.type = "KgTextArea";
      } else if(field.type === "DropdownSelect" || field.type === "DynamicDropdown"  || field.type === "KgTable"){
        if(field.type === "DropdownSelect") {
          field.type = "DynamicDropdown";
        }
        field.optionsUrl = field.instancesPath;
        field.instanceType = instance.types.length?instance.types[0].name:null;
        field.isLink = true;
        field.mappingLabel = "name";
        field.mappingValue = "id";
        field.mappingReturn = ["id"];
        field.closeDropdownAfterInteraction = true;
      }
    }
    instance.fields = data.fields;
  }
  if (data.alternatives instanceof Array) {
    instance.alternatives = [];
  }
  if (typeof data.metadata === "object") {
    const metadata = data.metadata;
    instance.metadata = Object.keys(metadata).map(key => {
      if(key == "lastUpdateAt" || key == "createdAt") {
        const d = new Date(metadata[key].value);
        metadata[key].value = d.toLocaleString();
      }
      return metadata[key];
    });
  }
  return instance;
};