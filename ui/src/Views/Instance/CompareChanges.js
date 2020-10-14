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
import { observer } from "mobx-react";
import CompareFieldsChanges from "./CompareFieldsChanges";
import instancesStore, {createInstanceStore} from "../../Stores/InstancesStore";

const styles = {
  container: {
    padding: "12px 15px"
  }
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
    const instance = instancesStore.instances.get(instanceId);
    const data = instance.clone;
    savedInstance.initializeData(data, true, false);
  }

  render(){
    const { classes, instanceId, onClose } = this.props;
    const instance = instancesStore.instances.get(instanceId);
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
          leftInstanceStore={instancesStore}
          rightInstanceStore={instancesStore}
          leftChildrenIds={savedInstance.childrenIds}
          rightChildrenIds={instance.childrenIds}
          onClose={onClose}
        />
      </div>
    );
  }
}

export default CompareChanges;