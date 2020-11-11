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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

import { useStores } from "../../Hooks/UseStores";

import GlobalFieldErrors from "../../Components/GlobalFieldErrors";

const rootPath = window.rootPath || "";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundImage: `url('${window.location.protocol}//${window.location.host}${rootPath}/assets/graph.png')`,
    backgroundPosition: "50% 50%",
    color: "var(--ft-color-loud)"
  },
  panel: {
    position: "relative",
    width: "60%",
    height: "calc(100% - 40px)",
    margin: "20px 20%"
  },
  content: {
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    border: "1px solid var(--bg-color-blend-contrast1)",
    marginBottom: "15px",
    padding: "15px",
    "& h4": {
      marginBottom: "15px"
    },
    "& p": {
      marginBottom: "15px"
    },
    "& ul": {
      marginBottom: "15px"
    },
    "& strong": {
      color: "var(--ft-color-louder)"
    }
  },
  id: {
    fontSize: "0.75em",
    color: "var(--ft-color-normal)",
    marginTop: "20px",
    marginBottom: "20px"
  },
  field: {
    marginBottom: "10px",
    wordBreak: "break-word"
  },
  error: {
    color: "var(--ft-color-error)"
  }
});

const InstanceManage = observer(({instance}) => {

  const classes = useStyles();

  const { appStore, statusStore } = useStores();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchStatus(), [instance]);

  const fetchStatus = () => statusStore.fetchStatus(instance.id);

  const handleDuplicateInstance = () => appStore.duplicateInstance(instance.id);

  const handleDeleteInstance = async () => appStore.deleteInstance(instance.id);

  const permissions = instance.permissions;
  const status = statusStore.getInstance(instance.id);

  return (
    <div className={classes.container}>
      <Scrollbars autoHide>
        <div className={classes.panel}>
          <div className={classes.content}>
            <h4>{instance.primaryType.label}</h4>
            <div className={classes.id}>
                ID: {instance.id}
            </div>
            {instance.hasFieldErrors ? <GlobalFieldErrors instance={instance} /> :
              < div className={classes.field}>
                {instance.name}
              </div>
            }
          </div>
          {permissions.canCreate && (
            <div className={classes.content}>
              <h4>Duplicate this instance</h4>
              <ul>
                <li>Be careful. After duplication both instances will look the same.</li>
                <li>After duplication you should update the name &amp; description fields.</li>
              </ul>
              <Button variant={"warning"} onClick={handleDuplicateInstance}>
                <FontAwesomeIcon icon={"copy"} /> &nbsp; Duplicate this instance
              </Button>
            </div>
          )}
          {permissions.canDelete && (
            <div className={classes.content}>
              <h4>Delete this instance</h4>
              {status && status.hasFetchError ?
                <div className={classes.error}>
                  <FontAwesomeIcon icon={"exclamation-triangle"} />&nbsp;&nbsp;{status.fetchError}&nbsp;&nbsp;
                  <Button variant="primary" onClick={fetchStatus}><FontAwesomeIcon icon="redo-alt" />&nbsp;Retry</Button>
                </div>
                : !status || !status.isFetched ?
                  <React.Fragment>
                    <FontAwesomeIcon icon={"circle-notch"} spin />&nbsp;&nbsp;Fetching instance release status
                  </React.Fragment>
                  :
                  <React.Fragment>
                    {status.data !== "UNRELEASED" ?
                      <ul>
                        <li>This instance has been released and therefore cannot be deleted.</li>
                        <li>If you still want to delete it you first have to unrelease it.</li>
                      </ul>
                      :
                      <p>
                        <strong>Be careful. Removed instances cannot be restored!</strong>
                      </p>
                    }
                    <Button variant={"danger"} onClick={handleDeleteInstance} disabled={status.data !== "UNRELEASED"} >
                      <FontAwesomeIcon icon={"trash-alt"} />&nbsp;&nbsp; Delete this instance
                    </Button>
                  </React.Fragment>
              }
            </div>
          )}
        </div>
      </Scrollbars>
    </div>
  );
});

export default InstanceManage;