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
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../Hooks/UseStores";

import GlobalFieldErrors from "../../Components/GlobalFieldErrors";
import FetchingLoader from "../../Components/FetchingLoader";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
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
  },
  deleteInstanceErrorModal: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    background: "rgba(0, 0, 0, 0.3)",
    "& .modal-dialog": {
      top: "35%",
      width: "max-content",
      maxWidth: "800px",
      "& .modal-body": {
        padding: "15px 25px",
        border: "1px solid var(--ft-color-loud)",
        borderRadius: "4px",
        color: "var(--ft-color-loud)",
        background: "var(--list-bg-hover)"
      }
    }
  },
  deleteInstanceError: {
    margin: "20px 0",
    color: "var(--ft-color-error)"
  },
  deleteInstanceErrorFooterBar: {
    marginBottom: "10px",
    width: "100%",
    textAlign: "center",
    wordBreak: "keep-all",
    whiteSpace: "nowrap",
    "& button + button": {
      marginLeft: "20px"
    }
  },
  deletingInstanceModal: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    background: "rgba(0, 0, 0, 0.3)",
    "& .modal-dialog": {
      top: "35%",
      width: "max-content",
      maxWidth: "800px",
      "& .modal-body": {
        padding: "30px",
        border: "1px solid var(--ft-color-loud)",
        borderRadius: "4px",
        color: "var(--ft-color-loud)",
        background: "var(--list-bg-hover)",
        "& .fetchingPanel": {
          position: "unset !important",
          top: "unset",
          left: "unset",
          width: "unset",
          transform: "none",
          wordBreak: "break-word",
          "& .fetchingLabel": {
            display: "inline"
          }
        }
      }
    }
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

  const handleRetryDeleteInstance = () => appStore.retryDeleteInstance();

  const handleCancelDeleteInstance = () => appStore.cancelDeleteInstance();

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
                  <>
                    <FontAwesomeIcon icon={"circle-notch"} spin />&nbsp;&nbsp;Fetching instance release status
                  </>
                  :
                  <>
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
                  </>
              }
            </div>
          )}
        </div>
      </Scrollbars>
      {appStore.deleteInstanceError && (
        <div className={classes.deleteInstanceErrorModal}>
          <Modal.Dialog>
            <Modal.Body>
              <div className={classes.deleteInstanceError}>Il y a une erreur {appStore.deleteInstanceError}</div>
              <div className={classes.deleteInstanceErrorFooterBar}>
                <Button onClick={handleCancelDeleteInstance}>Cancel</Button>
                <Button variant="primary" onClick={handleRetryDeleteInstance}><FontAwesomeIcon icon="redo-alt" />&nbsp;Retry</Button>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </div>
      )}
      {!appStore.deleteInstanceError && appStore.isDeletingInstance && !!appStore.instanceToDelete && (
        <div className={classes.deletingInstanceModal}>
          <Modal.Dialog>
            <Modal.Body>
              <FetchingLoader>{`Deleting instance "${appStore.instanceToDelete}" ...`}</FetchingLoader>
            </Modal.Body>
          </Modal.Dialog>
        </div>
      )}
    </div>
  );
});
InstanceManage.displayName = "InstanceManage";

export default InstanceManage;