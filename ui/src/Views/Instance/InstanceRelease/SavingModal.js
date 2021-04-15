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
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "react-bootstrap/Button";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../../Hooks/UseStores";

const useStyles = createUseStyles({
  lastEndedOperation:{
    fontWeight:"bold",
    fontSize:"0.8em",
    whiteSpace:"nowrap",
    textOverflow:"ellipsis",
    overflow:"hidden"
  },
  reloadRelease:{
    extend:"lastEndedOperation"
  },
  error:{
    background:"rgba(255,0,0,0.1)",
    borderTop:"1px solid #f5f5f5",
    padding: "10px 5px",
    fontWeight:"bold",
    fontSize:"0.8em",
    "&:last-child":{
      borderBottom:"1px solid #f5f5f5"
    },
    "&:nth-child(odd)":{
      background:"rgba(255,0,0,0.15)"
    }
  },
  errors:{
    marginTop:"10px"
  },
  absoluteProgress: {
    fontSize: "12px",
    transform: "translateY(-10px)",
    marginTop: "-10px"
  }
});

const SavingModal = observer(() => {

  const classes = useStyles();

  const { releaseStore } = useStores();

  const handleDismissSavingReport = () => {
    releaseStore.dismissSaveError();
  };

  const handleStop = () => {
    releaseStore.stopRelease();
  };

  return (
    <Modal show={releaseStore.isSaving} onHide={() => {}}>
      <Modal.Body>
        <ProgressBar
          active={releaseStore.savingProgress !== releaseStore.savingTotal}
          now={releaseStore.savingTotal <= 0? 100: Math.round(releaseStore.savingProgress/releaseStore.savingTotal*100)}
          label={`${releaseStore.savingTotal <= 0? 100: Math.round(releaseStore.savingProgress/releaseStore.savingTotal*100)}%`} />
        <div className={classes.absoluteProgress}>{releaseStore.savingProgress} / {releaseStore.savingTotal}</div>
        {releaseStore.savingProgress !== releaseStore.savingTotal?
          <>
            <div className={classes.lastEndedInstance}>
              {releaseStore.savingLastEndedNode && releaseStore.savingLastEndedNode.label}
            </div>
            <div className={classes.lastEndedOperation}>
              {releaseStore.savingLastEndedRequest}
            </div>
          </>
          :releaseStore.savingErrors.length === 0?
            <div className={classes.reloadRelease}>
              <FontAwesomeIcon icon={"circle-notch"} spin/>&nbsp;&nbsp;Reloading current instance release status
            </div>
            :null
        }
        {releaseStore.savingErrors.length > 0 &&
            <div className={classes.errors}>
              {releaseStore.savingErrors.map(error => {
                return(
                  <div key={error.id} className={classes.error}>
                    <FontAwesomeIcon icon={"times-circle"}/>&nbsp;
                    ({error.node.type}) {error.node.label}<br/><br/>
                    {error.message}
                  </div>
                );
              })}
            </div>
        }
      </Modal.Body>
      {releaseStore.savingErrors.length > 0 && releaseStore.savingProgress === releaseStore.savingTotal ?
        <Modal.Footer>
          <Button variant="primary" onClick={handleDismissSavingReport}>Dismiss</Button>
        </Modal.Footer> : <Modal.Footer>
          <Button variant="danger" onClick={handleStop}>Stop</Button>
        </Modal.Footer>
      }
    </Modal>
  );
});
SavingModal.displayName = "SavingModal";

export default SavingModal;