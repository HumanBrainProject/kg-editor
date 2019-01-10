import {observable, action, runInAction, computed} from "mobx";
import { uniqueId } from "lodash";
import { FormStore } from "hbp-quickfire";

import console from "../Services/Logger";
import API from "../Services/API";

import historyStore from "./HistoryStore";
import PaneStore from "./PaneStore";
import authStore from "./AuthStore";
import statusStore from "./StatusStore";

class OptionsCache{
  @observable cache = new Map();
  @observable promises = new Map();

  get(path){
    if(this.cache.has(path)){
      return Promise.resolve(this.cache.get(path));
    } else if(this.promises.has(path)){
      return this.promises.get(path);
    } else {
      let promise = this.fetch(path);
      this.promises.set(path, promise);
      return this.promises.get(path);
    }
  }

  async fetch(path){
    try {
      const { data } = await API.axios.get(API.endpoints.instances(path));
      this.cache.set(path, (data && data.data)? data.data: []);
      return this.cache.get(path);
    } catch (e) {
      const message = e.message?e.message:e;
      this.cache.delete(path);
      throw `Error while retrieving the list of ${path} (${message})`;
    }
  }
}

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
  @observable comparedInstanceId = null;
  @observable globalReadMode = true;
  @observable isCreatingNewInstance = false;
  @observable instanceCreationError = null;
  @observable showSaveBar = false;

  @observable showCreateModal = false;

  optionsCache = new OptionsCache();

  generatedKeys = new WeakMap();

  constructor(){
    if(localStorage.getItem("openedTabs")){
      let storedOpenedTabs = JSON.parse(localStorage.getItem("openedTabs"));
      authStore.reloginPromise.then(()=>{
        this.restoreOpenedTabs(storedOpenedTabs);
      });
    }
  }

  get nodeTypeMapping(){
    return nodeTypeMapping;
  }

  get reverseNodeTypeMapping(){
    return Object.entries(nodeTypeMapping).reduce((result, [label, type]) => {
      result[type] = label;
      return result;
    }, {});
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
    historyStore.updateInstanceHistory(instanceId, "viewed");
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
        const instanceData = data.data?data.data:{fields: {}};

        instance.data = instanceData;
        instance.form = new FormStore(instanceData);
        const fields = instance.form.getField();

        let optionsPromises = [];

        Object.entries(fields).forEach(([, field]) => {
          let path = field.instancesPath;
          if(path){
            optionsPromises.push(this.optionsCache.get(path).then(
              (options) => {
                field.updateOptions(options);
              }
            ));
          }
        });

        Promise.all(optionsPromises).then(() => {
          instance.isFetching = false;
          instance.isFetched = true;
          this.memorizeInstanceInitialValues(instanceId);
          instance.form.toggleReadMode(this.globalReadMode);
        });
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
    historyStore.updateInstanceHistory(instanceId, "edited");
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
        //We assume the options are already in cache :)
        const options = this.optionsCache.cache.get(instance.path);
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
    } finally {
      statusStore.flush();
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