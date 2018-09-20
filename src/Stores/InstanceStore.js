import {observable, action, runInAction} from "mobx";
import { find, remove, uniqueId } from "lodash";
import console from "../Services/Logger";
import API from "../Services/API";
import { FormStore } from "hbp-quickfire";
import routerStore from "./RouterStore";

const nodeTypeMapping = {
  "Dataset":"Dataset",
  "Specimen group":"SpecimenGroup",
  "Subject":"ExperimentSubject",
  "Activity":"Activity",
  "Person":"Person",
  "PLA Component":"PLAComponent",
  "Publication":"Publication",
  "File Association":"FileAssociation",
  "DOI":"DatasetDOI",
  "Method":"ExperimentMethod",
  "Reference space":"ReferenceSpace",
  "Parcellation Region":"ParcellationRegion",
  "Parcellation Atlas":"ParcellationAtlas",
  "Embargo Status":"EmbargoStatus",
  "Approval":"EthicsApproval",
  "Protocol":"ExperimentProtocol",
  "Preparation":"Preparation",
  "Authority":"EthicsAuthority",
  "Format":"Format",
  "License Type":"LicenseInformation",
  "Sample":"ExperimentSample",
  "File":"File"
};

class InstanceStore {
  @observable instances = new Map();
  @observable openedInstances = new Map();
  @observable optionsCache = new Map();
  @observable comparedInstanceId = null;

  generatedKeys = new WeakMap();

  get nodeTypeMapping(){
    return nodeTypeMapping;
  }

  @action openInstance(instanceId){
    this.openedInstances.set(instanceId, {
      currentInstancePath: [],
      viewMode: "edit",
      readOnlyMode: false
    });
    this.getInstance(instanceId);
    this.setCurrentInstanceId(instanceId, instanceId, 0);
  }

  @action setInstanceViewMode(instanceId, mode){
    this.openedInstances.get(instanceId).viewMode = mode;
  }

  @action closeInstance(instanceId){
    this.openedInstances.delete(instanceId);
  }

  @action
  getInstance(instanceId, forceFetch = false){
    if (this.instances.has(instanceId) && !forceFetch) {
      return this.instances.get(instanceId);
    }
    return this.fetchInstanceData(instanceId);
  }

  @action
  setInstanceHighlight(instanceId, provenence) {
    if (this.instances.has(instanceId)) {
      this.instances.get(instanceId).highlight = provenence;
    }
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

  doesInstanceHaveLinkedInstancesInNewState(instance) {
    return this.checkLinkedInstances(instance, (id, linkedInstance) => linkedInstance && linkedInstance.isNew);
  }

  @action
  async fetchInstanceData(instanceId) {
    let instance = null;
    if(this.instances.has(instanceId)) {
      instance = this.instances.get(instanceId);
      if (instance.isFetching) {
        return instance;
      }
      instance.cancelRequest = false;
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
        cancelRequest: null,
        fetchError: null,
        hasFetchError: false,
        saveError: null,
        hasSaveError: false,
        isSaving: false,
        hasChanged: false,
        isFetching: true,
        isFetched: false,
        highlight: null,
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

        const fields = instance.form.getField();
        Object.entries(fields).forEach(([fieldKey, field]) => {
          if(fieldsWithOptions.has(fieldKey)){
            field.options = this.optionsCache.get(fieldsWithOptions.get(fieldKey));
            field.injectValue();
          }
        });

        instance.hasChanged = instance.isNew && instanceId !== this.mainInstanceId;
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
  setCurrentInstanceId(mainInstanceId, currentInstanceId, level){
    let currentInstancePath = this.openedInstances.get(mainInstanceId).currentInstancePath;
    currentInstancePath.splice(level, currentInstancePath.length-level, currentInstanceId);
    this.instances.forEach((instance) => {
      if (instance.isFetched) {
        if(!instance.form.readMode && !instance.hasChanged){
          instance.form.toggleReadMode(true);
        }
      }
    });
  }

  getCurrentInstanceId(instanceId){
    let currentInstancePath = this.openedInstances.get(instanceId).currentInstancePath;
    return currentInstancePath[currentInstancePath.length-1];
  }

  @action
  toggleReadMode(mainInstanceId, targetInstanceId, level, readMode){
    let currentInstancePath = this.openedInstances.get(mainInstanceId).currentInstancePath;
    currentInstancePath.splice(level, currentInstancePath.length-level, targetInstanceId);
    this.instances.forEach((instance, instanceId) => {
      if (instance.isFetched) {
        if(instanceId === targetInstanceId && instance.form.readMode !== readMode){
          instance.form.toggleReadMode(readMode);
        } else if(instanceId !== targetInstanceId && !instance.form.readMode && !instance.hasChanged){
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
  requestCancelInstanceChanges(instanceId){
    const instance = this.instances.get(instanceId);
    instance.cancelRequest = true;
  }

  @action
  confirmCancelInstanceChanges(instanceId){
    const instance = this.instances.get(instanceId);
    if (instance.isNew) {
      const options = this.optionsCache.get(instance.path);
      const optionToDelete = find(options, o => o.id === instanceId);
      remove(options, optionToDelete);
      this.instances.forEach(instance => {
        if(instance.isFetched){
          const fields = instance.form.getField();
          Object.values(fields).forEach(field => {
            if (field.isLink) {
              field.removeValue(optionToDelete);
            }
          });
        }
      });
      const level = this.currentInstancePath.findIndex(id => id === instanceId);
      if (level !== -1) {
        this.currentInstancePath.splice(level, this.currentInstancePath.length-level);
      }
      instance.hasChanged = false;
      instance.cancelRequest = false;
      instance.saveError = null;
      instance.hasSaveError = false;
      this.instances.delete(instanceId);
    } else {
      instance.form.injectValues(instance.initialValues);
      instance.hasChanged = false;
      instance.cancelRequest = false;
      instance.saveError = null;
      instance.hasSaveError = false;
    }
  }

  @action
  abortCancelInstanceChange(instanceId){
    const instance = this.instances.get(instanceId);
    instance.cancelRequest = false;
  }

  @action
  async saveInstance(instanceId){
    const instance = this.instances.get(instanceId);
    instance.cancelRequest = false;
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
            routerStore.history.replace(newId?`/instance/${newId}`:`/nodetype/${instance.path}`);
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

  @action
  setComparedInstance(instanceId){
    this.comparedInstanceId = instanceId;
  }

}

export default new InstanceStore();