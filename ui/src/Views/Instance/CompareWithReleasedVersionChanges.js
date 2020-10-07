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
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import appStore from "../../Stores/AppStore";
import instanceStore, { createInstanceStore } from "../../Stores/InstanceStore";
import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";
import CompareFieldsChanges from "./CompareFieldsChanges";

const styles = {
  container: {
    padding: "12px 15px",
    "& button + button": {
      marginLeft: "20px"
    }
  }
};

@injectStyles(styles)
@observer
class CompareWithReleasedVersionChanges extends React.Component{
  constructor(props){
    super(props);
    this.releasedInstanceStore = createInstanceStore("RELEASED");
  }

  componentDidMount() {
    if (this.props.instanceId) {
      if (this.props.status !== "UNRELEASED") {
        const instance = this.releasedInstanceStore.createInstanceOrGet(this.props.instanceId);
        instance.fetch(true);
      }
      this.fetchInstance();
    }
  }

  componentDidUpdate(prevProps) {
    if(this.props.instanceId && prevProps.instanceId !== this.props.instanceId) {
      if (this.props.status !== "UNRELEASED") {
        const instance = this.releasedInstanceStore.createInstanceOrGet(this.props.instanceId);
        instance.fetch(true);
      }
      this.fetchInstance();
    }
  }

  fetchInstance = (forceFetch=false) => {
    const instance = instanceStore.createInstanceOrGet(this.props.instanceId);
    instance.fetch(forceFetch);
  }

  handleCloseComparison = () => appStore.setComparedWithReleasedVersionInstance(null);

  handleRetryFetchInstance = () => this.fetchInstance(true);

  handleRetryFetchReleasedInstance = () => {
    if (this.props.status !== "UNRELEASED") {
      this.fetchInstance(true);
    }
  }

  render(){
    const { classes, instanceId, status } = this.props;

    if (!instanceId) {
      return null;
    }
    const releasedInstance = status !== "UNRELEASED"?this.releasedInstanceStore.instances.get(instanceId):null;
    const instance = instanceStore.instances.get(instanceId);

    if (!instance) {
      return null;
    }

    if ((releasedInstance && releasedInstance.isFetching) || instance.isFetching) {
      return(
        <div className={classes.container}>
          <FetchingLoader>Fetching instance &quot;<i>{instanceId}</i>&quot; data...</FetchingLoader>
        </div>
      );
    }

    if(releasedInstance && releasedInstance.fetchError) {
      return(
        <div className={classes.container}>
          <BGMessage icon={"ban"}>
            There was a network problem fetching the released instance &quot;<i>{instanceId}&quot;</i>.<br/>
            If the problem persists, please contact the support.<br/>
            <small>{releasedInstance.fetchError}</small><br/><br/>
            <div>
              <Button onClick={this.handleCloseComparison}><FontAwesomeIcon icon={"times"}/>&nbsp;&nbsp; Cancel</Button>
              <Button bsStyle={"primary"} onClick={this.handleRetryFetchReleasedInstance}><FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry</Button>
            </div>
          </BGMessage>
        </div>
      );
    }

    if ((!releasedInstance || releasedInstance.isFetched) && instance.isFetched) {
      return (
        <div className={classes.container}>
          <CompareFieldsChanges
            instanceId={instanceId}
            leftInstance={releasedInstance}
            rightInstance={instance}
            leftInstanceStore={this.releasedInstanceStore}
            rightInstanceStore={instanceStore}
            leftChildrenIds={releasedInstance?releasedInstance.childrenIds:[]}
            rightChildrenIds={instance.childrenIds}
            onClose={this.handleCloseComparison}
          />
        </div>
      );
    }
    return null;
  }
}

export default CompareWithReleasedVersionChanges;