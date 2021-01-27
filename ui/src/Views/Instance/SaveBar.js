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

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Modal from "react-bootstrap/Modal";
import uniqueId from "lodash/uniqueId";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../Hooks/UseStores";

import CompareChanges from "./CompareChanges";

const animationId = uniqueId("animationId");

const useStyles = createUseStyles({
  container:{
    height:"100%",
    "& h4":{
      padding:10,
      marginTop:0,
      lineHeight:"1.8",
      "& .btn":{
        float:"right"
      }
    }
  },
  instances:{
    marginTop:10
  },
  instance:{
    padding:10,
    display:"grid",
    "&:nth-child(odd)":{
      background:"var(--bg-color-ui-contrast3)"
    },
    "&:nth-child(even)":{
      background:"var(--bg-color-ui-contrast2)"
    },
    gridTemplateColumns:"1fr 50px",
  },
  actions:{
    gridRow:"span 4",
    textAlign:"right"
  },
  id:{
    fontSize:"0.7em",
    color:"#aaa",
    fontStyle:"italic",
    wordBreak:"break-all",
    marginTop:5
  },
  type:{
    fontWeight:"bold",
    fontSize:"0.8em"
  },
  label:{
    fontSize:"0.9em"
  },
  errors:{
    color:"red",
    fontSize:"0.7em",
    marginTop:5
  },
  saveIcon: {
    color: "red",
    animation: `${animationId} 1.4s infinite linear`
  },
  [`@keyframes ${animationId}`]: {
    "0%": {
      transform: "scale(1)"
    },
    "50%": {
      transform: "scale(0.1)"
    },
    "100%": {
      transform: "scale(1)"
    }
  },
  noChanges:{
    textAlign:"center",
    marginTop:"20px"
  },
  allGreenIcon:{
    color:"white",
    background:"#2ecc71",
    fontSize:"2em",
    borderRadius:"50%",
    width:"50px",
    height:"50px",
    lineHeight:"50px",
    display:"inline-block"
  },
  allGreenText:{
    fontWeight:"bold",
    marginTop:"20px"
  },
  compareModal:{
    width:"90%",
    "@media screen and (min-width:1024px)": {
      width:"900px",
    },
    "& .modal-body": {
      height: "calc(95vh - 112px)",
      padding: "3px 0"
    }
  }
});

const CompareModal = ({ instance, onSave, onReset, onClose }) => {
  const classes = useStyles();

  if (!instance) {
    return null;
  }

  const handleSave = () => onSave(instance);
  const handleReset = () => onReset(instance);
  const handleClose = () => onClose();

  return (
    <Modal show={true} dialogClassName={classes.compareModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <strong>({instance.primaryType.label})</strong>&nbsp;{instance.name}
      </Modal.Header>
      <Modal.Body>
        <Scrollbars autoHide>
          <CompareChanges instanceId={instance.id} onClose={onClose}/>
        </Scrollbars>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" onClick={handleReset}><FontAwesomeIcon icon="undo"/>&nbsp;Revert the changes</Button>
        <Button variant="primary" size="sm" onClick={handleSave}><FontAwesomeIcon icon="save"/>&nbsp;Save this instance</Button>
      </Modal.Footer>
    </Modal>
  );
};

const Instance = observer(({ instance, onSave, onReset, onCompare, onDismissSaveError }) => {

  const classes = useStyles();

  const handleSave = () => onSave(instance);
  const handleReset = () => onReset(instance);
  const handleCompare = () => onCompare(instance);
  const handleDismissSaveError = () => onDismissSaveError(instance);

  return (
    <div key={instance.id} className={classes.instance}>
      <div className={classes.type}>
        {instance.primaryType.label}
      </div>
      <div className={classes.actions}>
        {instance.isSaving?
          <FontAwesomeIcon className={classes.saveIcon} icon="dot-circle"/>
          :
          <ButtonGroup vertical>
            <Button variant="primary" size="sm" onClick={handleSave} title="save this instance"><FontAwesomeIcon icon="save"/></Button>
            {!instance.isNew && <Button size="sm" onClick={handleReset} title="revert the changes"><FontAwesomeIcon icon="undo"/></Button>}
            <Button size="sm" onClick={handleCompare} title="compare the changes"><FontAwesomeIcon icon="glasses"/></Button>
          </ButtonGroup>
        }
      </div>
      <div className={classes.label}>
        {instance.name}
      </div>
      <div className={classes.id}>
        {instance.id}
      </div>
      {instance.hasSaveError && (
        <div className={classes.errors}>
          {instance.saveError} <Button size="small" variant={"link"} onClick={handleDismissSaveError.bind(this, instance.id)}><FontAwesomeIcon icon="check"/></Button>
        </div>
      )}
    </div>
  );
});
Instance.displayName = "Instance";

const SavePanel = observer(() => {

  const classes = useStyles();

  const { appStore, instanceStore } = useStores();

  const [comparedInstance, setComparedInstance] = useState(null);

  useEffect(() => {

    const onUnload = e => { // the method that will be used for both add and remove event
      if(!instanceStore.hasUnsavedChanges){
        return null;
      }
      appStore.toggleSavebarDisplay(true);
      e.returnValue = "You have unsaved modifications. Are you sure you want to leave this page?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveAll = () => {
    instanceStore.getUnsavedInstances.forEach(instance => !instance.isSaving && appStore.saveInstance(instance));
  };

  const handleSave = instance => {
    appStore.saveInstance(instance);
    setComparedInstance(null);
  };

  const handleReset = instance => {
    instanceStore.confirmCancelInstanceChanges(instance.id);
    setComparedInstance(null);
  };

  const handleDismissSaveError = instance => instance.cancelSave();

  const handleCompare = instance => setComparedInstance(instance);

  const handleCloseCompararison = () => setComparedInstance(null);

  const changedInstances = instanceStore.getUnsavedInstances;

  return(
    <div className={classes.container}>
      <Scrollbars autoHide>
        <h4>Unsaved instances &nbsp;<Button variant="primary" onClick={handleSaveAll}><FontAwesomeIcon icon="save"/>&nbsp;Save All</Button></h4>
        <div className={classes.instances} >
          <CompareModal instance={comparedInstance} onSave={handleSave} onReset={handleReset} onClose={handleCloseCompararison} />
          {!instanceStore.hasUnsavedChanges &&
              <div className={classes.noChanges}>
                <div className={classes.allGreenIcon}><FontAwesomeIcon icon="check"/></div>
                <div className={classes.allGreenText}>You have no unsaved modifications !</div>
              </div>
          }
          {changedInstances.map(instance => (
            <Instance key={instance.id} instance={instance} onSave={handleSave} onReset={handleReset} onCompare={handleCompare} onDismissSaveError={handleDismissSaveError} />
          ))}
        </div>
      </Scrollbars>
    </div>
  );
});
SavePanel.displayName = "SavePanel";

export default SavePanel;