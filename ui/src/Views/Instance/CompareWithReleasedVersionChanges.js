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

import React, { useEffect } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import releaseStore from "../../Stores/ReleaseStore";
import instancesStore, { createInstanceStore } from "../../Stores/InstancesStore";
import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";
import CompareFieldsChanges from "./CompareFieldsChanges";

const useStyles = createUseStyles({
  container: {
    padding: "12px 15px",
    "& button + button": {
      marginLeft: "20px"
    }
  }
});

const CompareWithReleasedVersionChanges = observer(({ instanceId, status }) => {

  const classes = useStyles();

  useEffect(() => {
    if (instanceId && status !== "UNRELEASED") {
      this.releasedInstanceStore = createInstanceStore("RELEASED");
      fetchReleasedInstance(true);
      fetchInstance();
    }
    return () => {
      if (this.releasedInstanceStore) {
        this.releasedInstanceStore.flush();
        this.releasedInstanceStore = null;
      }
    };
  }, [instanceId, status]);

  const fetchReleasedInstance = (forceFetch=false) => {
    if (status !== "UNRELEASED") {
      const instance = this.releasedInstanceStore.createInstanceOrGet(instanceId);
      instance.fetch(forceFetch);
    }
  };

  const fetchInstance = (forceFetch=false) => {
    const instance = instancesStore.createInstanceOrGet(instanceId);
    instance.fetch(forceFetch);
  };

  const handleCloseComparison = () => releaseStore.setComparedInstance(null);

  const handleRetryFetchInstance = () => fetchInstance(true);

  const handleRetryFetchReleasedInstance = () => fetchReleasedInstance(true);

  if (!instanceId) {
    return null;
  }
  const releasedInstance = status !== "UNRELEASED"?this.releasedInstanceStore.instances.get(instanceId):null;
  const instance = instancesStore.instances.get(instanceId);

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

  if(instance.fetchError) {
    return(
      <div className={classes.container}>
        <BGMessage icon={"ban"}>
            There was a network problem fetching instance &quot;<i>{instanceId}&quot;</i>.<br/>
            If the problem persists, please contact the support.<br/>
          <small>{instance.fetchError}</small><br/><br/>
          <div>
            <Button onClick={handleCloseComparison}><FontAwesomeIcon icon={"times"}/>&nbsp;&nbsp; Cancel</Button>
            <Button bsStyle={"primary"} onClick={handleRetryFetchInstance}><FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry</Button>
          </div>
        </BGMessage>
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
            <Button onClick={handleCloseComparison}><FontAwesomeIcon icon={"times"}/>&nbsp;&nbsp; Cancel</Button>
            <Button bsStyle={"primary"} onClick={handleRetryFetchReleasedInstance}><FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry</Button>
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
          rightInstanceStore={instancesStore}
          leftChildrenIds={releasedInstance?releasedInstance.childrenIds:[]}
          rightChildrenIds={instance.childrenIds}
          onClose={handleCloseComparison}
        />
      </div>
    );
  }
  return null;
});

export default CompareWithReleasedVersionChanges;