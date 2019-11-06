import {observable, action, runInAction, computed, toJS} from "mobx";
import { uniqueId, find, debounce } from "lodash";
import { FormStore } from "hbp-quickfire";
import API from "../Services/API";

import { normalizeInstanceData } from "../Helpers/InstanceHelper";
import historyStore from "./HistoryStore";
import PaneStore from "./PaneStore";
import browseStore from "./BrowseStore";
import authStore from "./AuthStore";
import statusStore from "./StatusStore";
import routerStore from "./RouterStore";
import { matchPath } from "react-router-dom";

class Instance {
  @observable id = null;
  @observable types = [];
  @observable isNew = false;
  @observable name = "";
  @observable fields = {};
  @observable alternatives = {};
  @observable promotedFields = [];
  @observable primaryType = {name: "", color: "", label: ""};
  @observable workspace = "";
  @observable metadata = {};
  @observable permissions = {};
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
  @observable fieldsToSetAsNull = [];
  @observable fieldErrorsMap = new Map();

  constructor(id, instanceStore) {
    this.id = id;
    this.instanceStore = instanceStore;
  }

  @computed
  get hasFieldErrors() {
    return this.fieldErrors.length;
  }

  @computed
  get fieldErrors() {
    return Array.from(this.fieldErrorsMap.values());
  }

  @action setFieldError(field) {
    this.fieldErrorsMap.set(field.path.substr(1), field);
  }

  memorizeInstanceInitialValues() {
    this.initialValues = this.form.getValues();
  }

  @action setFieldAsNull(id) {
    !this.fieldsToSetAsNull.includes(id) && this.fieldsToSetAsNull.push(id);
    this.hasChanged = true;
  }

  @computed
  get labelField() { //TODO: or not
    return (this.isFetched && this.data && this.data.ui_info)?this.data.ui_info.labelField:null;
  }

  @computed
  get promotedFieldsWithMarkdown() {
    return this.promotedFields.filter(name => this.fields[name].markdown);
  }

  @computed
  get nonPromotedFields() {
    if (this.isFetched && !this.fetchError && this.fields) {
      return Object.keys(this.fields).filter(key => !this.promotedFields.includes(key));
    }
    return [];
  }

  @computed
  get linkedIds() {
    let linkKeys = [];
    if(this.isFetched && !this.fetchError && this.fields){
      linkKeys = Object.keys(this.fields).filter(fieldKey => {
        return this.form.getField(fieldKey).isLink && this.form.getField(fieldKey).getValue().length > 0;
      });
    }

    let ids = [];
    linkKeys.map(fieldKey => {
      let fieldObj = this.form.getField(fieldKey);
      if(fieldObj.isLink && fieldObj.value.length > 0){
        fieldObj.value.map(value => {
          ids.push(value[fieldObj.mappingValue]);
        });
      }
    });

    let allIds = [this.id];
    ids.forEach(i=> {
      if(this.instanceStore.instances.has(i)) {
        const inst = this.instanceStore.instances.get(i);
        allIds = [...allIds, ...inst.linkedIds];
      }
    });
    return Array.from(new Set(allIds));
  }

  @computed
  get isReadMode() {
    return !this.isFetched || (this.form && this.form.readMode);
  }

  @action
  setReadMode(readMode){
    if (this.isFetched) {
      this.form.toggleReadMode(!!readMode);
    }
  }

  @computed
  get readModeFormStore() {
    const formStore = new FormStore(toJS(this.form.structure));
    formStore.toggleReadMode(true);
    return formStore;
  }

  @action
  fetch(forceFetch=false) {
    if(!this.isFetching && (!this.isFetched || this.fetchError || forceFetch)) {
      this.instanceStore.fetchInstance(this);
    }
  }

  @action
  initializeData(data, readMode=false, isNew=false) {
    const normalizedData =  normalizeInstanceData(data);
    this.workspace = normalizedData.workspace;
    this.types = normalizedData.types;
    this.name = normalizedData.name;
    this.isNew = isNew;
    this.fields = normalizedData.fields;
    this.primaryType = normalizedData.primaryType;
    this.promotedFields = normalizedData.promotedFields;
    this.alternatives = normalizedData.alternatives;
    this.metadata = normalizedData.metadata;
    this.permissions = normalizedData.permissions;
    this.form = new FormStore(normalizedData);
    this.fetchError = null;
    this.hasFetchError = false;
    this.isFetching = false;
    this.isFetched = true;
    this.memorizeInstanceInitialValues();
    this.form.toggleReadMode(readMode);
  }

  @action
  errorInstance(e) {
    const message = e.message?e.message:e;
    const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
    if(e.response && e.response.status === 404){
      this.fetchError = "This instance can not be found - it either could have been removed or it is not accessible by your user account.";
    }
    else {
      this.fetchError = `Error while retrieving instance "${this.id}" (${message}) ${errorMessage}`;
    }
    this.hasFetchError = true;
    this.isFetched = false;
    this.isFetching = false;
  }

  @action
  async save() {
    const types = this.types.map(({name}) => name);
    historyStore.updateInstanceHistory(this.id, types, "edited");

    this.cancelChangesPending = false;
    this.hasSaveError = false;
    this.isSaving = true;

    const payload = this.form.getValues();
    if (this.fieldsToSetAsNull.length > 0) {
      this.fieldsToSetAsNull.forEach(key=> payload[key] = null);
    }

    try {
      const { data } = await API.axios.put(API.endpoints.instanceData(this.id, this.instanceStore.databaseScope), payload);
      runInAction(() => {
        this.hasChanged = false;
        this.saveError = null;
        this.hasSaveError = false;
        this.isSaving = false;
        this.fieldsToSetAsNull = [];
        this.data = data.data;
      });

      this.fetch(true);
    } catch (e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
        this.saveError = `Error while saving instance "${this.id}" (${message}) ${errorMessage}`;
        this.hasSaveError = true;
        this.isSaving = false;
      });
    } finally {
      statusStore.flush();
    }
  }

  @action
  cancelSave(){
    this.saveError = null;
    this.hasSaveError = false;
  }

  @action
  cancelChanges(){
    this.form && this.form.injectValues(this.initialValues);
    this.hasChanged = false;
    this.cancelChangesPending = false;
    this.saveError = null;
    this.hasSaveError = false;
    this.fieldsToSetAsNull = [];
  }

}

class InstanceStore {
  @observable databaseScope = null;
  @observable instances = new Map();
  @observable openedInstances = new Map();
  @observable comparedInstanceId = null;
  @observable comparedWithReleasedVersionInstance = null;
  @observable previewInstance = null;
  @observable globalReadMode = true;
  @observable instanceIdAvailability = {
    resolvedId: null,
    instanceId: null,
    isAvailable: false,
    isChecking: false,
    error: null
  };
  @observable instanceCreationError = null;
  @observable isCreatingNewInstance = false;
  @observable instanceCreationError = null;
  @observable showSaveBar = false;
  @observable instanceToDelete = null;
  @observable isDeletingInstance = false;
  @observable deleteInstanceError = null;

  instancesQueue = new Map();
  queueThreshold = 1000;
  queueTimeout = 250;


  generatedKeys = new WeakMap();

  constructor(databaseScope=null) {
    this.databaseScope = databaseScope?databaseScope:null;
    if(localStorage.getItem("openedTabs")){
      let storedOpenedTabs = JSON.parse(localStorage.getItem("openedTabs"));
      if (authStore.isFullyAuthenticated) {
        this.restoreOpenedTabs(storedOpenedTabs);
      }
    }
  }

  fetchInstance(instance){
    if(!this.instancesQueue.has(instance.id)){
      this.instancesQueue.set(instance.id, instance);
      this.processQueue();
    }
  }

  @action
  processQueue(){
    if(this.instancesQueue.size <= 0){
      this._debouncedFetchQueue.cancel();
    } else if(this.instancesQueue.size < this.queueThreshold){
      this._debouncedFetchQueue();
    } else if(!this.isFetchingQueue){
      this._debouncedFetchQueue.cancel();
      this.fetchQueue();
    }
  }

  _debouncedFetchQueue = debounce(()=>{this.fetchQueue();}, this.queueTimeout);

  @action
  async fetchQueue(){
    if(this.isFetchingQueue){
      return;
    }
    this.isFetchingQueue = true;
    let toProcess = Array.from(this.instancesQueue.keys()).splice(0, this.queueThreshold);
    toProcess.forEach(identifier => {
      if(this.instances.has(identifier)) {
        const instance = this.instances.get(identifier);
        instance.cancelChangesPending = false;
        instance.isFetching = true;
        instance.isSaving = false;
        instance.isFetched = false;
        instance.fetchError = null;
        instance.hasFetchError = false;
        instance.saveError = null;
        instance.hasSaveError = false;
        instance.fieldErrorsMap = new Map();
      }
    });
    try{
      let response = await API.axios.post(API.endpoints.instancesList(this.databaseScope), toProcess);
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            const data = find(response.data.data, item => item.id === instance.id);
            if(data){
              instance.initializeData(data, this.globalReadMode, false);
              if(this.openedInstances.has(instance.id)){
                const types = instance.types.map(({name}) => name);
                historyStore.updateInstanceHistory(instance.id, types, "viewed");
              }
            } else {
              const message = "This instance can not be found - it either could have been removed or it is not accessible by your user account.";
              instance.errorInstance(message);
              instance.isFetching = false;
              instance.isFetched = false;
            }
            this.instancesQueue.delete(identifier);
          }
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    } catch(e){
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            instance.errorInstance(e);
            instance.isFetching = false;
            instance.isFetched = false;
            this.instancesQueue.delete(identifier);
          }
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    }
  }

  @action flush(){
    this.instances = new Map();
    this.resetInstanceIdAvailability();
    this.isCreatingNewInstance = false;
    this.instanceCreationError = null;
    this.showSaveBar = false;
    this.instanceToDelete = null;
    this.isDeletingInstance = false;
    this.deleteInstanceError = null;
  }

  /**
   * Opened instances are shown in their own tab in the UI
   * We keep track in that store of which instances are opened
   */
  @action openInstance(instanceId, viewMode = "view", readMode = true){
    this.togglePreviewInstance();
    this.setReadMode(readMode);
    if(this.openedInstances.has(instanceId)){
      const instance = this.instances.get(instanceId);
      if (instance && instance.isFetched && !instance.fetchError) {
        const types = instance.types.map(({name}) => name);
        historyStore.updateInstanceHistory(instance.id, types, "viewed");
      }
      this.openedInstances.get(instanceId).viewMode = viewMode;
      this.syncStoredOpenedTabs();
    } else {
      this.openedInstances.set(instanceId, {
        currentInstancePath: [],
        viewMode: viewMode,
        paneStore: new PaneStore()
      });
      if(viewMode === "create") {
        this.checkInstanceIdAvailability(instanceId);
      } else {
        const instance = this.createInstanceOrGet(instanceId);
        if(instance.isFetched && !instance.fetchError) {
          const types = instance.types.map(({name}) => name);
          historyStore.updateInstanceHistory(instance.id, types, "viewed");
        } else {
          instance.fetch();
        }
      }
      this.setCurrentInstanceId(instanceId, instanceId, 0);
      this.syncStoredOpenedTabs();
    }
  }

  @action
  setInstanceViewMode(instanceId, mode){
    this.openedInstances.get(instanceId).viewMode = mode;
  }

  @action
  closeInstance(instanceId){
    this.openedInstances.delete(instanceId);
    this.syncStoredOpenedTabs();
  }

  @action
  removeUnusedInstances(instanceId, instancesToBeDeleted) {
    const instancesToBeKept = this.getOpenedInstancesExceptCurrent(instanceId);
    instancesToBeDeleted.forEach(i => {
      const instance = this.instances.get(i);
      if(!instance.isFetching && !instancesToBeKept.includes(i)) {
        this.instances.delete(i);
      }
    });
  }

  getOpenedInstancesExceptCurrent(instanceId) {
    let result = [];
    Array.from(this.openedInstances.keys()).forEach(id => {
      if (id !== instanceId) {
        const instance = this.instances.get(id);
        const instancesToBeKept = instance.linkedIds;
        result = [...result, ...instancesToBeKept];
      }
    });
    return Array.from(new Set(result));
  }

  @action
  removeAllInstances() {
    this.closeAllInstances();
    this.instances.clear();
  }

  @action
  closeAllInstances(){
    this.openedInstances.clear();
    this.syncStoredOpenedTabs();
  }

  syncStoredOpenedTabs(){
    localStorage.setItem("openedTabs", JSON.stringify([...this.openedInstances].map(([id, infos])=>[id, infos.viewMode])));
  }

  @action
  restoreOpenedTabs(storedOpenedTabs){
    storedOpenedTabs.forEach(([id, viewMode]) => {
      this.openInstance(id, viewMode, viewMode !== "edit" && viewMode !== "create");
    });
  }

  @action
  flushOpenedTabs(){
    localStorage.removeItem("openedTabs");
  }

  @action
  createInstanceOrGet(instanceId){
    if (!this.instances.has(instanceId)) {
      const instance = new Instance(instanceId, this);
      this.instances.set(instanceId, instance);
      return instance;
    }
    return this.instances.get(instanceId);
  }

  @computed
  get hasUnsavedChanges(){
    return Array.from(this.instances.entries()).filter(([, instance]) => instance.hasChanged).length > 0;
  }

  @action
  resetInstanceIdAvailability() {
    this.instanceIdAvailability.resolvedId = null;
    this.instanceIdAvailability.instanceId = null;
    this.instanceIdAvailability.isChecking = false;
    this.instanceIdAvailability.error = null;
    this.instanceIdAvailability.isAvailable = false;
  }

  @action
  async checkInstanceIdAvailability(instanceId){
    if (!this.instanceIdAvailability.instanceId || instanceId === this.instanceIdAvailability.instanceId) {
      this.instanceIdAvailability.instanceId = instanceId,
      this.instanceIdAvailability.isChecking = true;
      this.instanceIdAvailability.error = null;
      this.instanceIdAvailability.isAvailable = false;
      try{
        const { data } = await API.axios.get(API.endpoints.resolvedId(instanceId));
        runInAction(() => {
          this.instanceIdAvailability.resolvedId = data && data.data ? data.data.uuid:null;
          this.instanceIdAvailability.isAvailable = true;
          this.instanceIdAvailability.isChecking = false;
        });
      } catch(e){
        runInAction(() => {
          const message = e.message?e.message:e;
          const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
          this.instanceIdAvailability.error = `Failed to check instance "${instanceId}" (${message}) ${errorMessage}`;
          this.instanceIdAvailability.isChecking = false;
          this.instanceIdAvailability.isAvailable = false;
        });
      }
    }
  }

  @action
  createNewInstance(type, id, name=""){
    const instanceType = {name: type.name, label: type.label, color: type.color};
    const fields = toJS(type.fields);
    const data = {
      workspace: authStore.currentWorkspace,
      id: id,
      types: [instanceType],
      name: name,
      fields: toJS(fields),
      primaryType: instanceType,
      promotedFields: toJS(type.promotedFields),
      alternatives: {},
      metadata: {},
      permissions: {}
    };
    const instance  = new Instance(id, this);
    instance.initializeData(data, this.globalReadMode, true);
    this.instances.set(id, instance);
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
    let instanceToCopy = this.instances.get(fromInstanceId);
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
      runInAction(() => {
        this.isCreatingNewInstance = false;
      });
      return data.data.id;
    } catch(e){
      runInAction(() => {
        this.isCreatingNewInstance = false;
        this.instanceCreationError = e.message;
      });
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
          const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
          this.deleteInstanceError = `Failed to delete instance "${instanceId}" (${message}) ${errorMessage}`;
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

  doesInstanceHaveLinkedInstancesInUnsavedState = instance => {
    return this.checkLinkedInstances(instance, (id, linkedInstance) => linkedInstance && linkedInstance.isFetched && linkedInstance.hasChanged);
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
    this.instances.forEach(instance => instance.setReadMode(readMode));
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
    this.instances.get(instanceId).cancelChanges();
  }

  @action
  abortCancelInstanceChange(instanceId){
    this.instances.get(instanceId).cancelChangesPending = false;
  }

  @action
  toggleSavebarDisplay(state){
    this.showSaveBar = state !== undefined? !!state: !this.showSaveBar;
  }

  @action
  togglePreviewInstance(instanceId, instanceName, options) {
    if (!instanceId || (this.previewInstance && this.previewInstance.id === instanceId)) {
      this.previewInstance = null;
    } else {
      this.previewInstance = {id: instanceId, name: instanceName, options: options};
    }
  }

}

export const createInstanceStore = (databaseScope=null) => {
  return new InstanceStore(databaseScope);
};

export default new InstanceStore();
