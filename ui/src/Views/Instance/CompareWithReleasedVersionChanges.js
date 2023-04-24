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

import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react-lite";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../Hooks/useStores";
import { createInstanceStore } from "../../Stores/InstanceStore";

import Spinner from "../../Components/Spinner";
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

  const { instanceStore, releaseStore } = useStores();

  const [releasedInstanceStore, setReleasedInstanceStore] = useState(null);

  useEffect(() => {
    if(!releasedInstanceStore) {
      const store = createInstanceStore(instanceStore.transportLayer, instanceStore.rootStore, "RELEASED");
      setReleasedInstanceStore(store);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instanceId && status !== "UNRELEASED" && releasedInstanceStore) {
      fetchReleasedInstance(true);
      fetchInstance();
    }
    return () => {
      releasedInstanceStore && releasedInstanceStore.flush();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, status, releasedInstanceStore]);

  const fetchReleasedInstance = (forceFetch=false) => {
    if (status !== "UNRELEASED") {
      const inst = releasedInstanceStore.createInstanceOrGet(instanceId);
      inst.fetch(forceFetch);
    }
  };

  const fetchInstance = (forceFetch=false) => {
    const inst = instanceStore.createInstanceOrGet(instanceId);
    inst.fetch(forceFetch);
  };

  const handleCloseComparison = () => releaseStore.setComparedInstance(null);

  const handleRetryFetchInstance = () => fetchInstance(true);

  const handleRetryFetchReleasedInstance = () => fetchReleasedInstance(true);

  if (!instanceId) {
    return null;
  }
  const releasedInstance = (releasedInstanceStore && status !== "UNRELEASED")?releasedInstanceStore.instances.get(instanceId):null;
  const instance = instanceStore.instances.get(instanceId);

  if (!instance) {
    return null;
  }

  if ((releasedInstance && releasedInstance.isFetching) || instance.isFetching) {
    return(
      <div className={classes.container}>
        <Spinner text={`Retrieving instance ${instanceId}...`} />
      </div>
    );
  }

  if(instance.fetchError) {
    return(
      <div className={classes.container}>
        <BGMessage icon={"ban"}>
            There was a network problem retrieving instance &quot;<i>{instanceId}&quot;</i>.<br/>
            If the problem persists, please contact the support.<br/>
          <small>{instance.fetchError}</small><br/><br/>
          <div>
            <Button onClick={handleCloseComparison}><FontAwesomeIcon icon={"times"}/>&nbsp;&nbsp; Cancel</Button>
            <Button variant={"primary"} onClick={handleRetryFetchInstance}><FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry</Button>
          </div>
        </BGMessage>
      </div>
    );
  }

  if(releasedInstance && releasedInstance.fetchError) {
    return(
      <div className={classes.container}>
        <BGMessage icon={"ban"}>
            There was a network problem retrieving the released instance &quot;<i>{instanceId}&quot;</i>.<br/>
            If the problem persists, please contact the support.<br/>
          <small>{releasedInstance.fetchError}</small><br/><br/>
          <div>
            <Button onClick={handleCloseComparison}><FontAwesomeIcon icon={"times"}/>&nbsp;&nbsp; Cancel</Button>
            <Button variant={"primary"} onClick={handleRetryFetchReleasedInstance}><FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry</Button>
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
          leftInstanceStore={releasedInstanceStore}
          rightInstanceStore={instanceStore}
          leftChildrenIds={releasedInstance?releasedInstance.childrenIds:[]}
          rightChildrenIds={instance.childrenIds}
          onClose={handleCloseComparison}
        />
      </div>
    );
  }
  return null;
});
CompareWithReleasedVersionChanges.displayName = "CompareWithReleasedVersionChanges";

export default CompareWithReleasedVersionChanges;