import {observable, action, runInAction, computed} from "mobx";
import console from "../Services/Logger";
import API from "../Services/API";
import { FormStore } from "hbp-spark";

export default class InstanceStore {
  @observable instances = new Map();
  @observable mainInstanceId = null;
  @observable currentInstancePath = [];
  @observable optionsCache = new Map();
  @observable highlightedInstance = null;

  constructor(history, instanceId){
    this.history = history;
    this.mainInstanceId = instanceId;
    this.fetchInstanceData(this.mainInstanceId);
    this.setCurrentInstanceId(this.mainInstanceId, 0);
  }

  get mainInstance(){
    return this.getInstance(this.mainInstanceId);
  }

  getInstance(instanceId){
    if (this.instances.has(instanceId)) {
      return this.instances.get(instanceId);
    }
    return this.fetchInstanceData(instanceId);
  }

  @computed get currentInstanceId(){
    return this.currentInstancePath[this.currentInstancePath.length-1];
  }

  @action
  highlightInstance(fieldLabel, instanceId) {
    this.highlightedInstance = {
      fieldLabel: fieldLabel,
      instanceId: instanceId
    };
  }

  @action
  unhighlightInstance(fieldLabel, instanceId) {
    if (this.isInstanceHighlighted(fieldLabel, instanceId)) {
      this.highlightedInstance = null;
    }
  }

  isInstanceHighlighted(fieldLabel, instanceId){
    if (this.highlightedInstance === null) {
      return false;
    }
    return this.highlightedInstance.fieldLabel === fieldLabel && this.highlightedInstance.instanceId === instanceId;
  }

  @action
  async fetchInstanceData(instanceId) {
    let instance = null;
    if(this.instances.has(instanceId)) {
      instance = this.instances.get(instanceId);
      if (instance.isFetching) {
        return instance;
      }
      instance.confirmCancel = false;
      instance.isFetching = true;
      instance.isSaving = false;
      instance.isFetched = false;
      instance.fetchError = null;
      instance.hasFetchError = false;
      instance.saveError = null;
      instance.hasSaveError = false;
    } else {
      const [, , , , shortId] = instanceId.split("/");
      this.instances.set(instanceId, {
        data: null,
        form: null,
        confirmCancel: null,
        fetchError: null,
        hasFetchError: false,
        saveError: null,
        hasSaveError: false,
        isSaving: false,
        hasChanged: false,
        isFetching: true,
        isFetched: false,
        isNew: !shortId
      });
      instance = this.instances.get(instanceId);
    }

    try {
      console.debug("fetch instance " + instanceId + ".");
      const { data } = await API.axios.get(API.endpoints.instanceData(instanceId));

      runInAction(async () => {
        const fieldsWithOptions = new Map();
        try {
          for(let fieldKey in data.fields){
            const optionsUrl = data.fields[fieldKey].optionsUrl;
            if(optionsUrl){
              delete data.fields[fieldKey].optionsUrl;
              fieldsWithOptions.set(fieldKey, optionsUrl);
              if(!this.optionsCache.has(optionsUrl)){
                this.optionsCache.set(optionsUrl, []);
                try {
                  const { data } = await API.axios.get(window.rootPath+optionsUrl);
                  this.optionsCache.set(optionsUrl, (data && data.data)?data.data:[]);
                } catch (e) {
                  const label = data.fields[fieldKey].label?data.fields[fieldKey].label.toLowerCase():fieldKey;
                  const [,, organization, domain, schema, version] = optionsUrl.replace(/\/(.*)\/?$/, "$1").split("/");
                  const path = (organization && domain && schema && version)?` "${organization}/${domain}/${schema}/${version}"`:"";
                  const message = e.message?e.message:e;
                  throw `Error while retrieving the list of ${label}${path} (${message})`;
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

        Object.keys(this.instances.get(instanceId).form.getField()).forEach(fieldKey => {
          if(fieldsWithOptions.has(fieldKey)){
            let field = this.instances.get(instanceId).form.getField(fieldKey);
            field.options = this.optionsCache.get(fieldsWithOptions.get(fieldKey));
            field.injectValue();
          }
        });

        instance.hasChanged = false;
        instance.isFetching = false;
        instance.isFetched = true;

        this.memorizeInstanceInitialValues(instanceId);

        if (!instance.isNew) {
          instance.form.toggleReadMode(true);
        }
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
  setCurrentInstanceId(id, level){
    this.currentInstancePath.splice(level, this.currentInstancePath.length-level, id);
    this.instances.forEach((instance) => {
      if (instance.isFetched) {
        if(!instance.form.readMode && !instance.hasChanged){
          instance.form.toggleReadMode(true);
        }
      }
    });
  }

  @action
  toggleReadMode(id, level, readMode){
    this.currentInstancePath.splice(level, this.currentInstancePath.length-level, id);
    this.instances.forEach((instance, instanceId) => {
      if (instance.isFetched) {
        if(instanceId === id && instance.form.readMode !== readMode){
          instance.form.toggleReadMode(readMode);
        } else if(instanceId !== id && !instance.form.readMode && !instance.hasChanged){
          instance.form.toggleReadMode(true);
        }
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
    const instance = this.instances.get(instanceId);
    instance.confirmCancel = true;
  }

  @action
  confirmCancelInstanceChanges(instanceId){
    const instance = this.instances.get(instanceId);
    instance.form.injectValues(instance.initialValues);
    instance.hasChanged = false;
    instance.confirmCancel = false;
  }

  @action
  abortCancelInstanceChange(instanceId){
    const instance = this.instances.get(instanceId);
    instance.confirmCancel = false;
  }

  @action
  async saveInstance(instanceId){
    const instance = this.instances.get(instanceId);
    instance.confirmCancel = false;
    instance.hasSaveError = false;
    instance.isSaving = true;
    if (instance.isNew) {
      try {
        const { data } = await API.axios.post(API.endpoints.instanceData(instanceId), instance.form.getValues());
        runInAction(() => {
          instance.hasChanged = false;
          instance.saveError = null;
          instance.hasSaveError = false;
          instance.isSaving = false;
          instance.isNew = false;
          console.debug("successfully created", data);
          // TODO:
          // - read new id,
          // - add the new id to instance data,
          // - replace instance in insances map with the new id,
          // - change mainInstanceId with the new id if instanceId eq mainInstanceId;
          const newId = data.id?data.id:data["@id"]?data["@id"].replace(/^.*\/v0\/data\//, ""):null;
          if (instanceId === this.mainInstanceId) {
            this.history.replace(newId?`/instance/${newId}`:`/nodetype/${instanceId}`);
          }
        });
      } catch (e) {
        const message = e.message?e.message:e;
        instance.saveError = `Error while creating instance "${instanceId}" (${message})`;
        instance.hasSaveError = true;
        instance.isSaving = false;
      }
    } else {
      try {
        const { data } = await API.axios.put(API.endpoints.instanceData(instanceId), instance.form.getValues());
        runInAction(() => {
          instance.hasChanged = false;
          instance.saveError = null;
          instance.hasSaveError = false;
          instance.isSaving = false;
          console.debug("successfully saved", data);
        });
      } catch (e) {
        const message = e.message?e.message:e;
        instance.saveError = `Error while saving instance "${instanceId}" (${message})`;
        instance.hasSaveError = true;
        instance.isSaving = false;
      }
    }
  }

  @action
  cancelSaveInstance(instanceId){
    const instance = this.instances.get(instanceId);
    instance.saveError = null;
    instance.hasSaveError = false;
  }

}