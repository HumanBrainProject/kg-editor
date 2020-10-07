/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import injectStyles from "react-jss";
import { entries, toJS } from "mobx";
import { observer } from "mobx-react";
import { FormStore } from "hbp-quickfire";
import CompareFieldsChanges from "./CompareFieldsChanges";
import instanceStore, {createInstanceStore} from "../../Stores/InstanceStore";

const styles = {
  container: {
    padding: "12px 15px"
  }
};

const cloneInstanceData = instance => {
  const fields = entries(instance.form.structure.fields).reduce((acc, [name, f]) => {
    const field = FormStore.typesMapping[f.type].properties
      .filter(prop => !["customErrorMessages", "validationOptions", "customValidationFunctions", "value"].includes(prop))
      .reduce((acc2, prop) => {
        let value = toJS(f[prop]);
        if (typeof value !== "function") {
          if (Array.isArray(value)) {
            value = value.map(v => toJS(v));
          } else if (typeof value === "object") {
            value = {...value};
          }
          //window.console.log(name, f.type, prop, value);
          acc2[prop] = value;
        }
        return acc2;
      }, {});
    //window.console.log(name, f.type, "value", instance.initialValues[name]);
    field.value = instance.initialValues[name];
    acc[name] = field;
    return acc;
  }, {});
  return {
    id: instance.id,
    name: instance.name,
    types: instance.types.map(t => ({...t})),
    primaryType: {...instance.primaryType},
    workspace: instance.workspace,
    fields: fields,
    labelField: instance.labelField,
    promotedFields: [...instance.promotedFields],
    alternatives: {...instance.alternatives},
    metadata: {...instance.metadata},
    permissions: {...instance.permissions}
  };
};

@injectStyles(styles)
@observer
class CompareChanges extends React.Component{
  constructor(props){
    super(props);
    this.savedInstanceStore = createInstanceStore();
  }

  componentDidMount() {
    this.setInstance();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.instanceId !== this.props.instanceId) {
      this.setInstance();
    }
  }

  setInstance = () => {
    const { instanceId } = this.props;
    this.savedInstanceStore.flush();
    const savedInstance = this.savedInstanceStore.createInstanceOrGet(instanceId);
    const instance = instanceStore.instances.get(instanceId);
    const data = cloneInstanceData(instance);
    //window.console.log(data);
    savedInstance.initializeData(data, true, false);
  }

  render(){
    const { classes, instanceId, onClose } = this.props;
    const instance = instanceStore.instances.get(instanceId);
    const savedInstance = this.savedInstanceStore.instances.get(instanceId);
    if (!instance || !savedInstance) {
      return null;
    }

    return(
      <div className={classes.container}>
        <CompareFieldsChanges
          instanceId={instanceId}
          leftInstance={savedInstance}
          rightInstance={instance}
          leftInstanceStore={instanceStore}
          rightInstanceStore={instanceStore}
          leftChildrenIds={savedInstance.childrenIds}
          rightChildrenIds={instance.childrenIds}
          onClose={onClose}
        />
      </div>
    );
  }
}

export default CompareChanges;