/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
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
export default class CompareChanges extends React.Component{
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

    const beforeValues = formStoreBefore.getValues();
    const afterValues = formStoreAfter.getValues();

    const promotedFields = instance.promotedFields;
    const nonPromotedFields = instance.nonPromotedFields;

    return(
      <div className={classes.container}>
        {promotedFields.map(key => (
          <CompareFieldChanges key={key} field={instance.form.structure.fields[key]} beforeValue={beforeValues[key]} afterValue={afterValues[key]} />
        ))}
        {nonPromotedFields.map(key => (
          <CompareFieldChanges key={key} field={instance.form.structure.fields[key]} beforeValue={beforeValues[key]} afterValue={afterValues[key]} />
        ))}
      </div>
    );
  }
}