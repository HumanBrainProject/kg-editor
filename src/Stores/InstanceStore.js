import {observable, action, runInAction, computed} from "mobx";
import console from "../Services/Logger";
import API from "../Services/API";
import { FormStore } from "hbp-quickfire";

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
      const [organization, domain, schema, version, shortId] = instanceId.split("/");
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
        isNew: !shortId || shortId.indexOf("___NEW___") === 0,
        path: (organization && domain && schema && version)?`${organization}/${domain}/${schema}/${version}`:""
      });
      instance = this.instances.get(instanceId);
    }

    try {
      let path = instanceId;
      if (instance.isNew) {
        path = instance.path;
        console.debug("fetch an instance template of type " + path + ".");
      } else {
        console.debug("fetch instance " + path + ".");
      }
      const { data } = await API.axios.get(API.endpoints.instanceData(path));

      runInAction(async () => {
        const fieldsWithOptions = new Map();
        try {
          for(let fieldKey in data.fields){
            const instancesPath = data.fields[fieldKey].instancesPath
            ;
            if(instancesPath){
              fieldsWithOptions.set(fieldKey, instancesPath);
              if(!this.optionsCache.has(instancesPath)){
                this.optionsCache.set(instancesPath, []);
                try {
                  const { data } = await API.axios.get(API.endpoints.instances(instancesPath));
                  this.optionsCache.set(instancesPath, (data && data.data)?data.data:[]);
                } catch (e) {
                  const label = data.fields[fieldKey].label?data.fields[fieldKey].label.toLowerCase():fieldKey;
                  const message = e.message?e.message:e;
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

        if (instance.isNew && data && data.fields && data.ui_info && data.ui_info.labelField) {
          const keyFieldName = data.ui_info.labelField.replace(/\//g, "%nexus-slash%");
          if (data.fields[keyFieldName]) {
            const options = this.optionsCache.get(path);
            if (options) {
              const option = options.find(o => o.id === instanceId);
              if (option) {
                data.fields[keyFieldName].value = option.label;
              }
            }
          }
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

        instance.hasChanged = instance.isNew;
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
        const payload = instance.form.getValues();
        const { data } = await API.axios.post(API.endpoints.instanceData(instance.path), payload);
        runInAction(() => {
          instance.hasChanged = false;
          instance.saveError = null;
          instance.hasSaveError = false;
          instance.isSaving = false;
          instance.isNew = false;
          console.debug("successfully created", data);
          const newId = data.id?data.id:data["@id"]?data["@id"].replace(/^.*\/v0\/data\//, ""):null;
          this.instances.set(newId, instance);
          this.instances.delete(instanceId);
          const idx = this.currentInstancePath.findIndex(e => e === instanceId);
          if (idx > -1) {
            this.currentInstancePath[idx] = newId;
          }
          if (instanceId === this.mainInstanceId) {
            this.mainInstanceId = newId;
            this.history.replace(newId?`/instance/${newId}`:`/nodetype/${instance.path}`);
          } else {
            const options = this.optionsCache.get(instance.path);
            if (options) {
              const option = options.find(o => o.id === instanceId);
              if (option) {
                option.id = newId;
                if (instance.data.ui_info && instance.data.ui_info.labelField) {
                  const keyFieldName = instance.data.ui_info.labelField.replace(/\//g, "%nexus-slash%");
                  if (payload && payload[keyFieldName]) {
                    option.label = payload[keyFieldName];
                  }
                }
              }
            }
          }
        });
      } catch (e) {
        const message = e.message?e.message:e;
        instance.saveError = `Error while creating instance of type "${instance.path}" (${message})`;
        instance.hasSaveError = true;
        instance.isSaving = false;
      }
    } else {
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
  }

  @action
  cancelSaveInstance(instanceId){
    const instance = this.instances.get(instanceId);
    instance.saveError = null;
    instance.hasSaveError = false;
  }

}