import {observable, action, runInAction, computed} from "mobx";
import { uniqueId } from "lodash";
import { FormStore } from "hbp-quickfire";

import console from "../Services/Logger";
import API from "../Services/API";

import historyStore from "./HistoryStore";
import PaneStore from "./PaneStore";
import browseStore from "./BrowseStore";
import authStore from "./AuthStore";
import statusStore from "./StatusStore";
import routerStore from "./RouterStore";
import { matchPath } from "react-router-dom";

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

  @action flush(){
    this.cache = new Map();
    this.promises = new Map();
  }
}

class Instance {
  @observable instanceId = null;
  @observable data = null;
  @observable form = null;
  @observable cancelChangesPending = null;
  @observable fetchError = null;
  @observable hasFetchError = false;
  @observable saveError = null;
  @observable hasSaveError = false;
  @observable isSaving = false;
  @observable hasChanged = false;
  @observable isFetching = false;
  @observable isFetched = false;
  @observable highlight = null;
  @observable path = "";
  @observable fieldsToSetAsNull = [];

  constructor(instanceId, path="") {
    this.instanceId = instanceId;
    this.path = path?path:"";
  }

  @action setFieldAsNull(id) {
    !this.fieldsToSetAsNull.includes(id) && this.fieldsToSetAsNull.push(id);
    this.hasChanged = true;
  }

  @computed
  get promotedFields() {
    if (this.isFetched && !this.fetchError && this.data && this.data.fields && this.data.ui_info && this.data.ui_info.promotedFields) {
      return this.data.ui_info.promotedFields
        .filter(name => this.data.fields[name]);
    }
    return [];
  }

  @computed
  get promotedFieldsWithMarkdown() {
    if (this.isFetched && !this.fetchError && this.data && this.data.fields && this.data.ui_info && this.data.ui_info.promotedFields) {
      let promotedFields = this.data.ui_info.promotedFields
        .filter(name => this.data.fields[name]);
      return promotedFields.filter(field =>
        this.data.fields[field]["markdown"] === true
      );
    }
    return [];
  }

  @computed
  get nonPromotedFields() {
    if (this.isFetched && !this.fetchError && this.data && this.data.fields) {
      return Object.keys(this.data.fields)
        .filter(key => {
          return !this.data.ui_info || !this.data.ui_info.promotedFields || !this.data.ui_info.promotedFields.includes(key);
        });
    }
    return [];
  }

  @computed
  get metadata() {
    if (this.isFetched && !this.fetchError && this.data && this.data.metadata) {
      let metadata = this.data.metadata;
      return Object.keys(metadata).map(key => {
        if(key == "lastUpdateAt" || key == "createdAt") {
          let d = new Date(metadata[key]["value"]);
          metadata[key]["value"] = d.toLocaleString();
        }
        return metadata[key];
      });
    }
    return [];
  }
}

class InstanceStore {
  @observable databaseScope = null;
  @observable instances = new Map();
  @observable openedInstances = new Map();
  @observable comparedInstanceId = null;
  @observable comparedWithReleasedVersionInstance = null;
  @observable globalReadMode = true;
  @observable isCreatingNewInstance = false;
  @observable instanceCreationError = null;
  @observable showSaveBar = false;
  @observable instanceToDelete = null;
  @observable isDeletingInstance = false;
  @observable deleteInstanceError = null;

  @observable showCreateModal = false;

  optionsCache = new OptionsCache();

  generatedKeys = new WeakMap();

  constructor(databaseScope=null) {
    this.databaseScope = databaseScope?databaseScope:null;
    if(localStorage.getItem("openedTabs")){
      let storedOpenedTabs = JSON.parse(localStorage.getItem("openedTabs"));
      authStore.reloginPromise.then(()=>{
        this.restoreOpenedTabs(storedOpenedTabs);
      });
    }
  }

  @action flush(){
    this.instances = new Map();
    this.isCreatingNewInstance = false;
    this.instanceCreationError = null;
    this.showSaveBar = false;
    this.instanceToDelete = null;
    this.isDeletingInstance = false;
    this.deleteInstanceError = null;
    this.optionsCache.flush();
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
    if (browseStore.isFetched.lists) {
      const list = browseStore.getListById(path);
      if (list) {
        const labelField = list && list.uiSpec && list.uiSpec.labelField;
        if (!name || (name && labelField)) {
          this.isCreatingNewInstance = path;
          try{
            const payload = {};
            if (labelField) {
              payload[labelField] = name;
            }
            const { data } = await API.axios.post(API.endpoints.instanceData(path, this.databaseScope), payload);
            this.isCreatingNewInstance = false;
            return data.data.id;
          } catch(e){
            this.isCreatingNewInstance = false;
            this.instanceCreationError = e.message;
          }
        } else {
          this.isCreatingNewInstance = false;
          this.instanceCreationError = `Error: labelField is not defined for ${path} type!`;
        }
      } else {
        // Should never happen: UI should ensure to propose only available types
        this.isCreatingNewInstance = false;
        this.instanceCreationError = `Error: type ${path} is not available!`;
      }
    } else {
      // Should never happen: UI should ensure we the list has been fetch before calling createNewInstance
      this.isCreatingNewInstance = false;
      this.instanceCreationError = "Error: instances types are not available!";
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
    const labelField = instanceToCopy.data && instanceToCopy.data.ui_info && instanceToCopy.data.ui_info.labelField;
    if(labelField) {
      values[labelField] = (values[labelField]?(values[labelField] + " "):"") + "(Copy)";
    }
    this.isCreatingNewInstance = path;
    try{
      const { data } = await API.axios.post(API.endpoints.instanceData(path, this.databaseScope), values);
      this.isCreatingNewInstance = false;
      return data.data.id;
    } catch(e){
      this.isCreatingNewInstance = false;
      this.instanceCreationError = e.message;
    }
  }

  @action
  async deleteInstance(instanceId){
    if (instanceId) {
      this.instanceToDelete = instanceId;
      this.isDeletingInstance = true;
      this.deleteInstanceError = null;
      try{
        await API.axios.delete(API.endpoints.instanceData(instanceId, this.databaseScope));
        runInAction(() => {
          this.instanceToDelete = null;
          this.isDeletingInstance = false;
          let nextLocation = null;
          if(matchPath(routerStore.history.location.pathname, {path:"/instance/:mode/:id*", exact:"true"})){
            if(matchPath(routerStore.history.location.pathname, {path:`/instance/:mode/${instanceId}`, exact:"true"})){
              if(this.openedInstances.size > 1){
                let openedInstances = Array.from(this.openedInstances.keys());
                let currentInstanceIndex = openedInstances.indexOf(instanceId);
                let newInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex-1]: openedInstances[currentInstanceIndex+1];

                let openedInstance = this.openedInstances.get(newInstanceId);
                nextLocation = `/instance/${openedInstance.viewMode}/${newInstanceId}`;
              } else {
                nextLocation = "/browse";
              }
            }
          }
          browseStore.refreshFilter();
          this.closeInstance(instanceId);
          this.flush();
          if (nextLocation) {
            routerStore.history.push(nextLocation);
          }
        });
      } catch(e){
        runInAction(() => {
          const message = e.message?e.message:e;
          this.deleteInstanceError = `Failed to delete instance "${instanceId}" (${message})`;
          this.isDeletingInstance = false;
        });
      }
    }
  }

  @action
  async retryDeleteInstance() {
    return await this.deleteInstance(this.instanceToDelete);
  }

  @action
  cancelDeleteInstance() {
    this.instanceToDelete = null;
    this.deleteInstanceError = null;
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

  @action
  setComparedWithReleasedVersionInstance(instanceId){
    this.comparedWithReleasedVersionInstance = instanceId;
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
      const path = (organization && domain && schema && version)?`${organization}/${domain}/${schema}/${version}`:"";
      instance = new Instance(instanceId, path);
      this.instances.set(instanceId, instance);
      instance.isFetching = true;
    }

    try {
      let path = instanceId;
      console.debug("fetch instance " + path + ".");

      const { data } = await API.axios.get(API.endpoints.instanceData(path, this.databaseScope));

      runInAction(async () => {
        const instanceData = data.data?data.data:{fields: {}, alternatives: []};

        instance.data = instanceData;
        /*
        instanceData.alternatives["http://schema.org/name"] = [
          {
            value: "Alternative 2",
            userIds: "12345"
          },
          {
            value: "Alternative 3",
            userIds: ["2468", "9876"]
          },
          {
            value: "Alternative 4",
            userIds: "8642"
          }
        ];
        instanceData.alternatives["http://schema.org/description"] = [
          {
            value: "This is an second alternative description.",
            userIds: ["8642", "9876"]
          },
          {
            value: "This is an third alternative description.",
            userIds: "2468"
          },
          {
            value: "This is an fourth alternative description.",
            userIds: "12345"
          }
        ];
        instanceData.alternatives["http://schema.org/description"] = [
          {
            value: "This is an second alternative description.",
            userIds: ["8642", "9876"]
          },
          {
            value: "This is an third alternative description.",
            userIds: "2468"
          },
          {
            value: "This is an fourth alternative description.",
            userIds: "12345"
          }
        ];
        instanceData.alternatives["https://schema.hbp.eu/minds/contributors"] = [
          {
            value: [
              {
                id: "minds/core/person/v1.0.0/36d56617-e253-4b9c-94cc-f74a869c2411"
              },
              {
                id: "minds/core/person/v1.0.0/949aa9a5-ae01-4de3-847a-74b65543a2e3"
              },
              {
                id: "minds/core/person/v1.0.0/a79d7b48-8a57-433c-a9d6-50372bbc9ad2"
              },
              {
                id: "minds/core/person/v1.0.0/4283f0b4-2fef-4a80-a9de-bd2d512161cb"
              }
            ],
            userIds: "12345"
          },
          {
            value: [
              {
                id: "minds/core/person/v1.0.0/4283f0b4-2fef-4a80-a9de-bd2d512161cb"
              },
              {
                id: "minds/core/person/v1.0.0/36d56617-e253-4b9c-94cc-f74a869c2411"
              },
              {
                id: "minds/core/person/v1.0.0/949aa9a5-ae01-4de3-847a-74b65543a2e3"
              }
            ],
            userIds: ["2468", "8642"]
          }
        ];
        */
        for(let fieldKey in instanceData.fields){
          let field = instanceData.fields[fieldKey];
          if(field.type === "InputText"){
            field.type = "KgInputText";
          } else if(field.type === "TextArea"){
            field.type = "KgTextArea";
          } else if(field.type === "DropdownSelect"){
            field.type = "KgDropdownSelect";
          }
        }
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
      runInAction(() => {
        const message = e.message?e.message:e;
        instance.fetchError = `Error while retrieving instance "${instanceId}" (${message})`;
        instance.hasFetchError = true;
        instance.isFetched = false;
        instance.isFetching = false;
      });
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
    instance.fieldsToSetAsNull = [];
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
      if (instance.fieldsToSetAsNull.length > 0) {
        instance.fieldsToSetAsNull.forEach(key => payload[key] = null);
      }
      const { data } = await API.axios.put(API.endpoints.instanceData(instanceId, this.databaseScope), payload);
      runInAction(() => {
        instance.hasChanged = false;
        instance.fieldsToSetAsNull = [];
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
        // To refresh alternatives
        this.getInstance(instanceId, true);
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        instance.saveError = `Error while saving instance "${instanceId}" (${message})`;
        instance.hasSaveError = true;
        instance.isSaving = false;
      });
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

export const createInstanceStore = (databaseScope=null) => {
  return new InstanceStore(databaseScope);
};

export default new InstanceStore();
