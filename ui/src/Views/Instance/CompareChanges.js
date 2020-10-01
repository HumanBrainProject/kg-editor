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
import { toJS } from "mobx";
import { FormStore } from "hbp-quickfire";
import CompareFieldChanges from "./CompareFieldChanges";
import instanceStore from "../../Stores/InstanceStore";

const styles = {
  container: {
    padding: "12px 15px"
  }
};

@injectStyles(styles)
@observer
class CompareChanges extends React.Component{
  render(){
    const { classes } = this.props;
    const instance = instanceStore.instances.get(this.props.instanceId);
    if (!instance) {
      return null;
    }

    const formStoreBefore = new FormStore(toJS(instance.form.structure));
    formStoreBefore.injectValues(instance.initialValues);
    formStoreBefore.toggleReadMode(true);
    const formStoreAfter = new FormStore(toJS(instance.form.structure));
    formStoreAfter.toggleReadMode(true);

    const fields = [...instance.promotedFields, ...instance.nonPromotedFields];
    const beforeValues = formStoreBefore.getValues();
    const afterValues = formStoreAfter.getValues();

    return(
      <div className={classes.container}>
        {fields.map(key => (
          <CompareFieldChanges key={key} field={instance.form.structure.fields[key]} beforeValue={beforeValues[key]} afterValue={afterValues[key]} />
        ))}
      </div>
    );
  }
}

export default CompareChanges;