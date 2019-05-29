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
      const promise = this.fetch(path);
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
  @observable path = "";
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
  @observable fieldsToSetAsNull = [];

  constructor(instanceId, instanceStore) {
    this.instanceId = instanceId;
    const [organization, domain, schema, version, ] = instanceId.split("/");
    this.path = (organization && domain && schema && version)?`${organization}/${domain}/${schema}/${version}`:"";
    this.instanceStore = instanceStore;
  }

  memorizeInstanceInitialValues() {
    this.initialValues = this.form.getValues();
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

  @computed
  get isReadMode() {
    return !this.isFetched || (this.form && this.form.readMode);
  }

  @computed
  get nodeType() {
    const [ , , schema, , ] = this.instanceId?this.instanceId.split("/"):[ null, null, null, null, null];
    return this.isFetched && this.data && this.data.fields && this.data.fields.id && this.data.fields.id.value && this.data.fields.id.value.path || schema;
  }

  @action
  setReadMode(readMode){
    if (this.isFetched) {
      this.form.toggleReadMode(!!readMode);
    }
  }

  normalizeData(data) {
    if (!data) {
      return {fields: [], alternatives: []};
    }
    for(let fieldKey in data.fields) {
      let field = data.fields[fieldKey];
      if(field.type === "InputText"){
        field.type = "KgInputText";
      } else if(field.type === "TextArea"){
        field.type = "KgTextArea";
      } else if(field.type === "DropdownSelect"){
        field.type = "KgDropdownSelect";
      }
    }

    return data;
  }

  @action
  async fetch(forceFetch=false) {
    if (this.isFetching || (this.isFetched && !this.fetchError && !forceFetch)) {
      return;
    }
    this.cancelChangesPending = false;
    this.isFetching = true;
    this.isSaving = false;
    this.isFetched = false;
    this.fetchError = null;
    this.hasFetchError = false;
    this.saveError = null;
    this.hasSaveError = false;

    console.debug("fetch instance " + this.instanceId + ".");
    try {
      const { data } = await API.axios.get(API.endpoints.instanceData(this.instanceId, this.instanceStore.databaseScope));
      const normalizedData = this.normalizeData((data && data.data)?data.data:{fields: [], alternatives: []});
      runInAction(async () => {
        this.data = normalizedData;
        this.form = new FormStore(normalizedData);
        const fields = this.form.getField();

        const optionsPromises = [];
        Object.entries(fields).forEach(([, field]) => {
          const path = field.instancesPath;
          if (path) {
            optionsPromises.push(this.instanceStore.optionsCache.get(path).then(
              options => {
                field.updateOptions(options);
              }
            ));
          }
        });

        Promise.all(optionsPromises)
          .then(() => {
            runInAction(() => {
              this.isFetching = false;
              this.isFetched = true;
              this.memorizeInstanceInitialValues();
              this.form.toggleReadMode(this.instanceStore.globalReadMode);
            });
          })
          .catch(e => {
            runInAction(() => {
              const message = e.message?e.message:e;
              this.fetchError = `Error while retrieving instance "${this.instanceId}" (${message})`;
              this.hasFetchError = true;
              this.isFetched = false;
              this.isFetching = false;
            });
          });
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        this.fetchError = `Error while retrieving instance "${this.instanceId}" (${message})`;
        this.hasFetchError = true;
        this.isFetched = false;
        this.isFetching = false;
      });
    }
  }

  @action
  async save() {

    historyStore.updateInstanceHistory(this.instanceId, "edited");

    this.cancelChangesPending = false;
    this.hasSaveError = false;
    this.isSaving = true;

    const payload = this.form.getValues();
    if (this.fieldsToSetAsNull.length > 0) {
      this.fieldsToSetAsNull.forEach(key=> payload[key] = null);
    }

    try {
      const data = API.axios.put(API.endpoints.instanceData(this.instanceId, this.instanceStore.databaseScope), payload);
      runInAction(() => {
        this.hasChanged = false;
        this.saveError = null;
        this.hasSaveError = false;
        this.isSaving = false;
        this.fieldsToSetAsNull = [];
        console.debug("successfully saved", data);
      });
      //We assume the options are already in cache :)
      let option = null;
      const keyFieldName = (this.data && this.data.fields && this.data.ui_info && this.data.ui_info.labelField)?this.data.ui_info.labelField:null;
      if (keyFieldName) {
        const options = this.instanceStore.optionsCache.cache.get(this.path);
        if (options) {
          option = options.find(o => o.id === this.instanceId);
          // user saved value
          if (option && payload) {
            option.name = payload[keyFieldName];
          }
        }
      }
      // Because of alternatives fetch again the data
      // let's give time (1s) to the servers to refresh their state
      setTimeout(async () => {
        await this.fetch(true);
        runInAction(() => {
          if (keyFieldName && option && !this.fetchError && this.data && this.data.fields && this.data.fields[keyFieldName]) {
            // value retrieved from server
            option.name = this.data.fields[keyFieldName].value;
          }
        });
      }, 1000);
    } catch (e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        this.saveError = `Error while saving instance "${this.instanceId}" (${message})`;
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
  @observable instancesForPreview = new Map();
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
    if (!readMode && viewMode === "edit" && !browseStore.isFetched.lists && !browseStore.isFetching.lists) {
      browseStore.fetchLists();
    }
    historyStore.updateInstanceHistory(instanceId, "viewed");
    if(this.openedInstances.has(instanceId)){
      this.openedInstances.get(instanceId).viewMode = viewMode;
    } else {
      this.openedInstances.set(instanceId, {
        currentInstancePath: [],
        viewMode: viewMode,
        paneStore: new PaneStore()
      });
      const instance = this.getInstance(instanceId);
      instance.fetch();
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
  getInstance(instanceId){
    if (!this.instances.has(instanceId)) {
      const instance = new Instance(instanceId, this);
      this.instances.set(instanceId, instance);
      return instance;
    }
    return this.instances.get(instanceId);
  }

  hasInstanceForPreview(instanceId){
    return this.instancesForPreview.has(instanceId);
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
  async fetchInstanceForPreview(instanceId) {
    let instance = this.initInstance(instanceId, true);

    try {
      let path = instanceId;

      const { data } = await API.axios.get(API.endpoints.instanceData(path, this.databaseScope));

      runInAction(async () => {
        const instanceData = data.data?data.data:{fields: {}, alternatives: []};

        instance.data = instanceData;

        instance.form = this.constructFormStore(instanceData);
        const fields = instance.form.getField();

        let idsList = [] ;
        Object.values(instanceData.fields).forEach(value=>{
          if(value.instancesPath && value.value.length > 0) {
            value.value.forEach(v => idsList.push(v.id));
          }
        });

        const result = idsList.length > 0 ? await API.axios.post(API.endpoints.listedInstances(), idsList):null;
        runInAction(async () => {
          if(result) {
            const res = result.data.data.reduce((acc, current) => {
              if(!acc[current.schema]) {
                acc[current.schema] = [];
              }
              acc[current.schema].push(current);
              return acc;
            },{});

            Object.entries(fields).forEach(([, field]) => {
              let path = field.instancesPath;
              if(path){
                Object.keys(res).forEach(key => {
                  if(key == path) {
                    field.updateOptions(res[key]);
                  }
                });
              }
            });
          }

          instance.isFetching = false;
          instance.isFetched = true;
          this.memorizeInstanceInitialValues(instanceId, true);
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

  @action
  initInstance(instanceId, preview=false) {
    let instance = null;
    let instances = preview ? this.instancesForPreview:this.instances;
    if(instances.has(instanceId)) {
      instance = instances.get(instanceId);
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
      instances.set(instanceId, instance);
      instance.isFetching = true;
    }
    return instance;
  }

  memorizeInstanceInitialValues(instanceId, preview=false){
    const instance = preview ? this.instancesForPreview.get(instanceId):this.instances.get(instanceId);
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
    this.instances.forEach(instance => instance.setReadMode(readMode));
  }

  @action
  instanceHasChanged(instanceId){
    const instance = this.getInstance(instanceId);
    if(!instance.hasChanged){
      instance.hasChanged = true;
    }
  }

  @action
  cancelInstanceChanges(instanceId){
    this.getInstance(instanceId).cancelChangesPending = true;
  }

  @action
  confirmCancelInstanceChanges(instanceId){
    this.getInstance(instanceId).cancelChanges();
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
  toggleShowCreateModal(state){
    this.showCreateModal = state !== undefined? !!state: !this.showCreateModal;
  }
}

export const createInstanceStore = (databaseScope=null) => {
  return new InstanceStore(databaseScope);
};

export default new InstanceStore();
