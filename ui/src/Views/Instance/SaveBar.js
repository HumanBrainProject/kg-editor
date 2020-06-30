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
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import {Button, ButtonGroup, Modal} from "react-bootstrap";
import { uniqueId } from "lodash";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import CompareChanges from "./CompareChanges";
import instanceStore from "../../Stores/InstanceStore";

const animationId = uniqueId("animationId");

const styles = {
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
};

@injectStyles(styles)
@observer
export default class SavePanel extends React.Component{
  handleSaveAll = () => {
    Array.from(instanceStore.instances.entries())
      .filter(([, instance]) => instance.hasChanged && !instance.isSaving)
      .forEach(([id, ]) => {
        const instance = instanceStore.instances.get(id);
        instance && instance.save();
      });
  }

  handleSave(instanceId){
    const instance = instanceStore.instances.get(instanceId);
    if (instance) {
      instance.save();
      instanceStore.setComparedInstance(null);
    }
  }

  handleReset(instanceId){
    instanceStore.confirmCancelInstanceChanges(instanceId);
    instanceStore.setComparedInstance(null);
  }

  handleDismissSaveError(instanceId){
    const instance = instanceStore.instances.get(instanceId);
    instance && instance.cancelSave();
  }

  handleShowCompare(instanceId){
    instanceStore.setComparedInstance(instanceId);
  }

  onUnload = (event) => { // the method that will be used for both add and remove event
    if(!instanceStore.hasUnsavedChanges){
      return null;
    }
    instanceStore.toggleSavebarDisplay(true);
    event.returnValue = "You have unsaved modifications. Are you sure you want to leave this page?";
    return event.returnValue;
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.onUnload);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onUnload);
  }

  render(){
    const { classes } = this.props;
    const changedInstances = Array.from(instanceStore.instances.entries()).filter(([, instance]) => instance.hasChanged).reverse();
    const comparedInstance = instanceStore.comparedInstanceId?instanceStore.instances.get(instanceStore.comparedInstanceId):null;
    const comparedInstanceLabelField = comparedInstance && comparedInstance.data && comparedInstance.data.ui_info && comparedInstance.data.ui_info.labelField;
    const comparedInstanceLabel = comparedInstanceLabelField && comparedInstance && comparedInstance.form?comparedInstance.form.getField(comparedInstanceLabelField).getValue():"";
    return(
      <div className={classes.container}>
        <Scrollbars autoHide>
          <h4>Unsaved instances &nbsp;<Button bsStyle="primary" onClick={this.handleSaveAll}><FontAwesomeIcon icon="save"/>&nbsp;Save All</Button></h4>
          <div className={classes.instances}>
            {comparedInstance &&
              <Modal show={true} dialogClassName={classes.compareModal} onHide={this.handleShowCompare.bind(this,null)}>
                <Modal.Header closeButton>
                  <strong>({comparedInstance.data.label})</strong>&nbsp;{comparedInstanceLabel}
                </Modal.Header>
                <Modal.Body>
                  <Scrollbars autoHide>
                    <CompareChanges instanceId={instanceStore.comparedInstanceId}/>
                  </Scrollbars>
                </Modal.Body>
                <Modal.Footer>
                  <Button bsSize="small" onClick={this.handleReset.bind(this, instanceStore.comparedInstanceId)}><FontAwesomeIcon icon="undo"/>&nbsp;Revert the changes</Button>
                  <Button bsStyle="primary" bsSize="small" onClick={this.handleSave.bind(this, instanceStore.comparedInstanceId)}><FontAwesomeIcon icon="save"/>&nbsp;Save this instance</Button>
                </Modal.Footer>
              </Modal>
            }
            {!instanceStore.hasUnsavedChanges &&
              <div className={classes.noChanges}>
                <div className={classes.allGreenIcon}><FontAwesomeIcon icon="check"/></div>
                <div className={classes.allGreenText}>You have no unsaved modifications !</div>
              </div>
            }
            {changedInstances.map(([id, instance]) => {
              const labelField = instance && instance.data && instance.data.ui_info && instance.data.ui_info.labelField;
              const label = labelField && instance && instance.form?instance.form.getField(labelField).getValue():"";
              return(
                <div className={classes.instance} key={instanceStore.getGeneratedKey(instance, "savePanel")}>
                  <div className={classes.type}>
                    {instance.data.label}
                  </div>
                  <div className={classes.actions}>
                    {instance.isSaving?
                      <FontAwesomeIcon className={classes.saveIcon} icon="dot-circle"/>
                      :
                      <ButtonGroup vertical>
                        <Button bsStyle="primary" bsSize="small" onClick={this.handleSave.bind(this, id)} title="save this instance"><FontAwesomeIcon icon="save"/></Button>
                        <Button bsSize="small" onClick={this.handleReset.bind(this, id)} title="revert the changes"><FontAwesomeIcon icon="undo"/></Button>
                        <Button bsSize="small" onClick={this.handleShowCompare.bind(this, id)} title="compare the changes"><FontAwesomeIcon icon="glasses"/></Button>
                      </ButtonGroup>
                    }
                  </div>
                  <div className={classes.label}>
                    {label}
                  </div>
                  <div className={classes.id}>
                    {id}
                  </div>
                  {instance.hasSaveError &&
                    <div className={classes.errors}>
                      {instance.saveError} <Button bsSize={"xsmall"} bsStyle={"link"} onClick={this.handleDismissSaveError.bind(this, id)}><FontAwesomeIcon icon="check"/></Button>
                    </div>
                  }
                </div>
              );
            })}
          </div>
        </Scrollbars>
      </div>
    );
  }
}