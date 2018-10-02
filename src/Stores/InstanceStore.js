import {observable, action, runInAction, computed} from "mobx";
import { uniqueId } from "lodash";
import console from "../Services/Logger";
import API from "../Services/API";
import { FormStore } from "hbp-quickfire";
import PaneStore from "./PaneStore";

const nodeTypeMapping = {
  "Dataset":"http://hbp.eu/minds#Dataset",
  "Specimen group":"http://hbp.eu/minds#SpecimenGroup",
  "Subject":"http://hbp.eu/minds#ExperimentSubject",
  "Activity":"http://hbp.eu/minds#Activity",
  "Person":"http://hbp.eu/minds#Person",
  "PLA Component":"http://hbp.eu/minds#PLAComponent",
  "Publication":"http://hbp.eu/minds#Publication",
  "File Association":"http://hbp.eu/minds#FileAssociation",
  "DOI":"http://hbp.eu/minds#DatasetDOI",
  "Method":"http://hbp.eu/minds#ExperimentMethod",
  "Reference space":"http://hbp.eu/minds#ReferenceSpace",
  "Parcellation Region":"http://hbp.eu/minds#ParcellationRegion",
  "Parcellation Atlas":"http://hbp.eu/minds#ParcellationAtlas",
  "Embargo Status":"http://hbp.eu/minds#EmbargoStatus",
  "Approval":"http://hbp.eu/minds#EthicsApproval",
  "Protocol":"http://hbp.eu/minds#ExperimentProtocol",
  "Preparation":"http://hbp.eu/minds#Preparation",
  "Authority":"http://hbp.eu/minds#EthicsAuthority",
  "Format":"http://hbp.eu/minds#Format",
  "License Type":"http://hbp.eu/minds#LicenseInformation",
  "Sample":"http://hbp.eu/minds#ExperimentSample",
  "File":"http://hbp.eu/minds#File"
};

class InstanceStore {
  @observable instances = new Map();
  @observable openedInstances = new Map();
  @observable optionsCache = new Map();
  @observable comparedInstanceId = null;
  @observable globalReadMode = true;
  @observable isCreatingNewInstance = false;
  @observable instanceCreationError = null;
  @observable showSaveBar = false;

  generatedKeys = new WeakMap();

  get nodeTypeMapping(){
    return nodeTypeMapping;
  }

  /**
   * Opened instances are shown in their own tab in the UI
   * We keep track in that store of which instances are opened
   */
  @action openInstance(instanceId, viewMode = "view", readMode = true){
    this.setReadMode(readMode);
    if(this.openedInstances.has(instanceId)){
      this.openedInstances.get(instanceId).viewMode = viewMode;
    } else {
      this.openedInstances.set(instanceId, {
        currentInstancePath: [],
        viewMode: viewMode,
        paneStore: new PaneStore()
      });
      this.getInstance(instanceId);
      this.setCurrentInstanceId(instanceId, instanceId, 0);
    }
  }

  @action setInstanceViewMode(instanceId, mode){
    this.openedInstances.get(instanceId).viewMode = mode;
  }

  @action closeInstance(instanceId){
    this.openedInstances.delete(instanceId);
  }

  @action
  getInstance(instanceId, forceFetch = false){
    if (!this.instances.has(instanceId) || forceFetch) {
      this.fetchInstanceData(instanceId);
    }
    return this.instances.get(instanceId);
  }

  @computed
  get hasUnsavedChanges(){
    return Array.from(this.instances.entries()).filter(([, instance]) => instance.hasChanged).length > 0;
  }

  @action
  async createNewInstance(path, name=""){
    this.isCreatingNewInstance = path;
    try{
      const { data } = await API.axios.post(API.endpoints.instanceData(path), {"http:%nexus-slash%%nexus-slash%schema.org%nexus-slash%name":name});
      this.isCreatingNewInstance = false;
      return data.id;
    } catch(e){
      this.isCreatingNewInstance = false;
      this.instanceCreationError = e.message;
    }
  }

  @action
  async createNewInstanceAsOption(field, name){
    try{
      const newInstanceId = await this.createNewInstance(field.instancesPath, name);
      field.options.push({
        [field.mappingValue]: newInstanceId,
        [field.mappingLabel]: name
      });
      field.addValue(field.options[field.options.length-1]);
      return newInstanceId;
    } catch(e){
      return false;
    }
  }

  @action
  setInstanceHighlight(instanceId, provenence) {
    if (this.instances.has(instanceId)) {
      this.instances.get(instanceId).highlight = provenence;
    }
  }

  @action
  setComparedInstance(instanceId){
    this.comparedInstanceId = instanceId;
  }

  getGeneratedKey(from, namespace){
    if(!this.generatedKeys.has(from)){
      this.generatedKeys.set(from, uniqueId(namespace));
    }
    return this.generatedKeys.get(from);
  }

  checkLinkedInstances(instance, check) {
    const fields = instance.form.getField();
    return Object.values(fields).some(field => {
      return field.isLink && field.value.some(option => {
        if (option.id) {
          const linkedInstance = this.instances.get(option.id);
          if (linkedInstance && typeof check === "function") {
            return check(option.id, linkedInstance);
          }
        }
        return false;
      });
    });
  }

  doesInstanceHaveLinkedInstancesInUnsavedState = (instance) => {
    return this.checkLinkedInstances(instance, (id, linkedInstance) => linkedInstance && linkedInstance.isFetched && linkedInstance.hasChanged);
  }

  @action
  async fetchInstanceData(instanceId) {
    let instance = null;
    if(this.instances.has(instanceId)) {
      instance = this.instances.get(instanceId);
      if (instance.isFetching) {
        return instance;
      }
      instance.cancelChangesPending = false;
      instance.isFetching = true;
      instance.isSaving = false;
      instance.isFetched = false;
      instance.fetchError = null;
      instance.hasFetchError = false;
      instance.saveError = null;
      instance.hasSaveError = false;
    } else {
      const [organization, domain, schema, version, ] = instanceId.split("/");
      this.instances.set(instanceId, {
        data: null,
        form: null,
        cancelChangesPending: null,
        fetchError: null,
        hasFetchError: false,
        saveError: null,
        hasSaveError: false,
        isSaving: false,
        hasChanged: false,
        isFetching: true,
        isFetched: false,
        highlight: null,
        path: (organization && domain && schema && version)?`${organization}/${domain}/${schema}/${version}`:""
      });
      instance = this.instances.get(instanceId);
    }

    try {
      let path = instanceId;
      console.debug("fetch instance " + path + ".");

      const { data } = await API.axios.get(API.endpoints.instanceData(path));

      runInAction(async () => {
        const fieldsWithOptions = new Map();
        try {
          for(let fieldKey in data.fields){
            const instancesPath = data.fields[fieldKey].instancesPath;
            if(instancesPath){
              fieldsWithOptions.set(fieldKey, instancesPath);
              if(!this.optionsCache.has(instancesPath)){
                this.optionsCache.set(instancesPath, []);
                try {
                  const { data } = await API.axios.get(API.endpoints.instances(instancesPath));
                  this.optionsCache.set(instancesPath, (data && data.data)? data.data: []);
                } catch (e) {
                  const label = data.fields[fieldKey].label?data.fields[fieldKey].label.toLowerCase():fieldKey;
                  const message = e.message?e.message:e;
                  this.optionsCache.delete(instancesPath);
                  throw `Error while retrieving the list of ${label}${instancesPath} (${message})`;
                }
              }
            }
          }
        } catch (e) {
          instance.fetchError = e.message?e.message:e;
          instance.hasFetchError = true;
          instance.isFetched = false;
          instance.isFetching = false;
        }

        instance.data = data;
        instance.form = new FormStore(data);

        const fields = instance.form.getField();
        Object.entries(fields).forEach(([fieldKey, field]) => {
          if(fieldsWithOptions.has(fieldKey)){
            field.options = this.optionsCache.get(fieldsWithOptions.get(fieldKey));
            field.injectValue();
          }
        });

        instance.isFetching = false;
        instance.isFetched = true;

        this.memorizeInstanceInitialValues(instanceId);

        instance.form.toggleReadMode(this.globalReadMode);
      });
    } catch (e) {
      const message = e.message?e.message:e;
      instance.fetchError = `Error while retrieving instance "${instanceId}" (${message})`;
      instance.hasFetchError = true;
      instance.isFetched = false;
      instance.isFetching = false;
    }
    return instance;
  }

  memorizeInstanceInitialValues(instanceId){
    const instance = this.instances.get(instanceId);
    instance.initialValues = instance.form.getValues();
  }

  @action
  setCurrentInstanceId(mainInstanceId, currentInstanceId, level){
    let currentInstancePath = this.openedInstances.get(mainInstanceId).currentInstancePath;
    currentInstancePath.splice(level, currentInstancePath.length-level, currentInstanceId);
  }

  getCurrentInstanceId(instanceId){
    let currentInstancePath = this.openedInstances.get(instanceId).currentInstancePath;
    return currentInstancePath[currentInstancePath.length-1];
  }

  @action
  setReadMode(readMode){
    this.globalReadMode = readMode;
    this.instances.forEach((instance) => {
      if (instance.isFetched) {
        instance.form.toggleReadMode(readMode);
      }
    });
  }

  @action
  instanceHasChanged(instanceId){
    const instance = this.instances.get(instanceId);
    if(!instance.hasChanged){
      instance.hasChanged = true;
    }
  }

  @action
  cancelInstanceChanges(instanceId){
    this.instances.get(instanceId).cancelChangesPending = true;
  }

  @action
  confirmCancelInstanceChanges(instanceId){
    const instance = this.instances.get(instanceId);
    instance.form.injectValues(instance.initialValues);
    instance.hasChanged = false;
    instance.cancelChangesPending = false;
    instance.saveError = null;
    instance.hasSaveError = false;
  }

  @action
  abortCancelInstanceChange(instanceId){
    this.instances.get(instanceId).cancelChangesPending = false;
  }

  @action
  async saveInstance(instanceId){
    const instance = this.instances.get(instanceId);
    instance.cancelChangesPending = false;
    instance.hasSaveError = false;
    instance.isSaving = true;

    try {
      const payload = instance.form.getValues();
      const { data } = await API.axios.put(API.endpoints.instanceData(instanceId), payload);
      runInAction(() => {
        instance.hasChanged = false;
        instance.saveError = null;
        instance.hasSaveError = false;
        instance.isSaving = false;
        console.debug("successfully saved", data);
        const options = this.optionsCache.get(instance.path);
        if (options) {
          const option = options.find(o => o.id === instanceId);
          if (option) {
            if (instance.data.ui_info && instance.data.ui_info.labelField) {
              const keyFieldName = instance.data.ui_info.labelField.replace(/\//g, "%nexus-slash%");
              if (payload && payload[keyFieldName]) {
                option.label = payload[keyFieldName];
              }
            }
          }
        }
      });
    } catch (e) {
      const message = e.message?e.message:e;
      instance.saveError = `Error while saving instance "${instanceId}" (${message})`;
      instance.hasSaveError = true;
      instance.isSaving = false;
    }
  }

  @action
  cancelSaveInstance(instanceId){
    const instance = this.instances.get(instanceId);
    instance.saveError = null;
    instance.hasSaveError = false;
  }

  @action
  toggleSavebarDisplay(state){
    this.showSaveBar = state !== undefined? !!state: !this.showSaveBar;
  }
}

export default new InstanceStore();