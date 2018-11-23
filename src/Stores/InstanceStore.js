import {observable, action, runInAction, computed} from "mobx";
import { uniqueId } from "lodash";
import { FormStore } from "hbp-quickfire";

import console from "../Services/Logger";
import API from "../Services/API";
import { retrieveLastInstances, updateLastInstances} from "../Services/LastInstancesHelper";

import PaneStore from "./PaneStore";
import authStore from "./AuthStore";

const nodeTypeMapping = {
  "Dataset":"https://schema.hbp.eu/minds/Dataset",
  "Specimen group":"https://schema.hbp.eu/minds/Specimengroup",
  "Subject":"https://schema.hbp.eu/minds/Subject",
  "Activity":"https://schema.hbp.eu/minds/Activity",
  "Person":"https://schema.hbp.eu/minds/Person",
  "PLA Component":"https://schema.hbp.eu/minds/Placomponent",
  "Publication":"https://schema.hbp.eu/minds/Publication",
  "File Association":"https://schema.hbp.eu/minds/FileAssociation",
  "DOI":"https://schema.hbp.eu/minds/DatasetDOI",
  "Method":"https://schema.hbp.eu/minds/Method",
  "Reference space":"https://schema.hbp.eu/minds/Referencespace",
  "Parcellation Region":"https://schema.hbp.eu/minds/Parcellationregion",
  "Parcellation Atlas":"https://schema.hbp.eu/minds/Parcellationatlas",
  "Embargo Status":"https://schema.hbp.eu/minds/Embargostatus",
  "Approval":"https://schema.hbp.eu/minds/Approval",
  "Protocol":"https://schema.hbp.eu/minds/Protocol",
  "Preparation":"https://schema.hbp.eu/minds/Preparation",
  "Authority":"https://schema.hbp.eu/minds/Authority",
  "Format":"https://schema.hbp.eu/minds/Format",
  "License Type":"https://schema.hbp.eu/minds/Licensetype",
  "Sample":"https://schema.hbp.eu/minds/ExperimentSample",
  "File":"https://schema.hbp.eu/minds/File",
  "Software agent":"https://schema.hbp.eu/minds/Softwareagent",
  "Age category":"https://schema.hbp.eu/minds/Agecategory",
  "Sex":"https://schema.hbp.eu/minds/Sex",
  "Species":"https://schema.hbp.eu/minds/Species",
  "Role":"https://schema.hbp.eu/minds/Role"
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
  @observable lastViewedInstances = {};
  @observable lastEditedInstances = {};

  @observable showCreateModal = false;

  generatedKeys = new WeakMap();

  constructor(){
    if(localStorage.getItem("openedTabs")){
      let storedOpenedTabs = JSON.parse(localStorage.getItem("openedTabs"));
      authStore.reloginPromise.then(()=>{
        this.restoreOpenedTabs(storedOpenedTabs);
      });
    }
    this.lastViewedInstances = retrieveLastInstances("lastViewedInstances");
    this.lastEditedInstances = retrieveLastInstances("lastEditedInstances");
  }

  get nodeTypeMapping(){
    return nodeTypeMapping;
  }


  getPromotedFields(instance) {
    if (instance && instance.data && instance.data.fields && instance.data.ui_info && instance.data.ui_info.promotedFields) {
      return instance.data.ui_info.promotedFields
        .filter(name => instance.data.fields[name]);
    }
    return [];
  }

  getNonPromotedFields(instance) {
    if (instance && instance.data && instance.data.fields) {
      return Object.keys(instance.data.fields)
        .filter(key => {
          return !instance.data.ui_info || !instance.data.ui_info.promotedFields || !instance.data.ui_info.promotedFields.includes(key);
        });
    }
    return [];
  }

  /**
   * Opened instances are shown in their own tab in the UI
   * We keep track in that store of which instances are opened
   */
  @action openInstance(instanceId, viewMode = "view", readMode = true){
    this.setReadMode(readMode);
    this.lastViewedInstances = updateLastInstances("lastViewedInstances", instanceId);
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
      this.syncStoredOpenedTabs();
    }
  }

  @action
  getLastViewedInstances(max=10, nodeType) {
    if (typeof nodeType !== "string") {
      return this.lastViewedInstances
        .map(instance => instance.id)
        .slice(0, isNaN(Number(max))?0:Number(max));
    }
    nodeType = nodeType.toLowerCase();
    return this.lastViewedInstances
      .filter(instance => instance.type === nodeType)
      .map(instance => instance.id)
      .slice(0, isNaN(Number(max))?0:Number(max));
  }

  @action
  getLastEditedInstances(max=10, nodeType) {
    if (typeof nodeType !== "string") {
      return this.lastEditedInstances
        .map(instance => instance.id)
        .slice(0, isNaN(Number(max))?0:Number(max));
    }
    nodeType = nodeType.toLowerCase();
    return this.lastEditedInstances
      .filter(instance => instance.type === nodeType)
      .map(instance => instance.id)
      .slice(0, isNaN(Number(max))?0:Number(max));
  }

  @action setInstanceViewMode(instanceId, mode){
    this.openedInstances.get(instanceId).viewMode = mode;
  }

  @action closeInstance(instanceId){
    this.openedInstances.delete(instanceId);
    this.syncStoredOpenedTabs();
  }

  syncStoredOpenedTabs(){
    localStorage.setItem("openedTabs", JSON.stringify([...this.openedInstances].map(([id, infos])=>[id, infos.viewMode])));
  }

  @action
  restoreOpenedTabs(storedOpenedTabs){
    storedOpenedTabs.forEach(([id, viewMode]) => {
      this.openInstance(id, viewMode, viewMode !== "edit");
    });
  }

  @action
  flushOpenedTabs(){
    localStorage.removeItem("openedTabs");
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
      const { data } = await API.axios.post(API.endpoints.instanceData(path), {"http://schema.org/name":name});
      this.isCreatingNewInstance = false;
      return data.data.id;
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
  async duplicateInstance(fromInstanceId){
    let instanceToCopy = this.getInstance(fromInstanceId);
    let path = instanceToCopy.path;
    let values = JSON.parse(JSON.stringify(instanceToCopy.initialValues));
    delete values.id;
    if(values["http://schema.org/name"]){
      values["http://schema.org/name"] = values["http://schema.org/name"]+" (Copy)";
    }
    this.isCreatingNewInstance = path;
    try{
      const { data } = await API.axios.post(API.endpoints.instanceData(path), values);
      this.isCreatingNewInstance = false;
      return data.data.id;
    } catch(e){
      this.isCreatingNewInstance = false;
      this.instanceCreationError = e.message;
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
        const instanceData = data.data?data.data:{fields: {}};
        try {
          for(let fieldKey in instanceData.fields){
            const instancesPath = instanceData.fields[fieldKey].instancesPath;
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

        instance.data = instanceData;
        instance.form = new FormStore(instanceData);

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
    this.lastEditedInstances = updateLastInstances("lastEditedInstances", instanceId);
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
              const keyFieldName = instance.data.ui_info.labelField;
              if (payload && payload[keyFieldName]) {
                option.name = payload[keyFieldName];
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

  @action
  toggleShowCreateModal(state){
    this.showCreateModal = state !== undefined? !!state: !this.showCreateModal;
  }
}

export default new InstanceStore();