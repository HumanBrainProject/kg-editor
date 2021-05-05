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
import Pane from "./Pane";
import InstanceForm from "./InstanceForm";
import instanceStore from "../../Stores/InstanceStore";
import browseStore from "../../Stores/BrowseStore";

const styles = {
  pane: {
    position: "relative"
  }
};

@injectStyles(styles)
@observer
class Links extends React.Component{
  componentDidMount() {
    if (this.props.id) {
      this.fetchInstance();
    }
  }

  componentDidUpdate(prevProps) {
    if(this.props.id && prevProps.id !== this.props.id) {
      this.fetchInstance();
    }
  }

  fetchInstance = (forceFetch = false) => {
    const instance = instanceStore.createInstanceOrGet(this.props.id);
    instance.fetch(forceFetch);
  }

  render(){
    const {classes, mainInstanceId } = this.props;

    const instance = instanceStore.instances.get(this.props.id);
    if (!instance || (!instance.isReadMode && !browseStore.isFetched.lists)) {
      return null;
    }

    const mainInstance = instanceStore.openedInstances.get(mainInstanceId);
    const currentInstancePath = mainInstance.currentInstancePath;
    let linkKeys = [];
    if(instance.isFetched){
      linkKeys = Object.keys(instance.data.fields).filter(fieldKey => {
        return instance.form.getField(fieldKey).isLink && instance.form.getField(fieldKey).getValue().length > 0;
      });
    }
    return(
      <React.Fragment>
        {linkKeys.length > 0?
          <Pane paneId={"ChildrenOf"+this.props.id} key={"ChildrenOf"+this.props.id} className={classes.pane}>
            {linkKeys.map(fieldKey => {
              let fieldObj = instance.form.getField(fieldKey);
              if(fieldObj.isLink && fieldObj.value.length > 0){
                return (
                  <div key={fieldObj.label} data-provenence={fieldObj.label}>
                    <h4>{fieldObj.label}{fieldObj.type === "KgTable"?
                      <em style={{fontWeight:"lighter"}}>
                        (showing {fieldObj.visibleInstancesCount} out of {fieldObj.instances.length})</em>:null}
                    </h4>
                    {fieldObj.value.map((value, index) => {
                      const id = value[fieldObj.mappingValue];
                      if(fieldObj.type === "KgTable") {
                        if(index < fieldObj.defaultVisibleInstances || fieldObj.instancesMap.get(id).show){
                          return (
                            <InstanceForm level={this.props.level} id={id} key={id} provenence={fieldObj.label} mainInstanceId={mainInstanceId} />
                          );
                        }
                      } else {
                        return (
                          <InstanceForm level={this.props.level} id={id} key={id} provenence={fieldObj.label} mainInstanceId={mainInstanceId} />
                        );
                      }
                    })}
                  </div>
                );
              }
            })}
          </Pane>
          :
          null
        }
        {currentInstancePath.length-1 >= this.props.level &&
          <DecoratedLinks
            level={this.props.level+1}
            id={currentInstancePath[this.props.level]}
            mainInstanceId={mainInstanceId} />
        }
      </React.Fragment>
    );
  }
}

const DecoratedLinks = Links;
export default DecoratedLinks;