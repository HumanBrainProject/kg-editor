import React from "react";
import { inject, observer } from "mobx-react";
import injectStyles from "react-jss";
import {Button, ButtonGroup, Glyphicon} from "react-bootstrap";
import { uniqueId } from "lodash";

const animationId = uniqueId("animationId");

const styles = {
  container:{
    paddingTop:60,
    "& h4":{
      padding:10,
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
    borderBottom:"1px solid #f3f3f3",
    display:"grid",
    "&:nth-child(odd)":{
      background:"#f3f3f3"
    },
    gridTemplateColumns:"1fr 50px",
    "&:first-child":{
      borderTop:"1px solid #f3f3f3",
    }
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
    composes: "glyphicon glyphicon-record",
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
  }
};

@injectStyles(styles)
@inject("instanceStore")
@observer
export default class SavePanel extends React.Component{
  handleSaveAll = () => {
    Array.from(this.props.instanceStore.instances.entries())
      .filter(([, instance]) => instance.hasChanged && !instance.isSaving)
      .forEach(([id, ]) => this.props.instanceStore.saveInstance(id));
  }
  handleSave(instanceId){
    this.props.instanceStore.saveInstance(instanceId);
  }
  handleReset(instanceId){
    this.props.instanceStore.confirmCancelInstanceChanges(instanceId);
  }
  handleDismissSaveError(instanceId){
    this.props.instanceStore.cancelSaveInstance(instanceId);
  }

  render(){
    const { classes, instanceStore } = this.props;
    const changedInstances = Array.from(instanceStore.instances.entries()).filter(([, instance]) => instance.hasChanged).reverse();
    return(
      <div className={classes.container}>
        <h4>Unsaved instances &nbsp;<Button bsStyle="primary" onClick={this.handleSaveAll}><Glyphicon glyph={"save"}/>&nbsp;Save All</Button></h4>
        <div className={classes.instances}>
          {changedInstances.length === 0 &&
            <div className={classes.noChanges}>
              <div className={classes.allGreenIcon}><Glyphicon glyph={"ok"}/></div>
              <div className={classes.allGreenText}>You have no unsaved modifications !</div>
            </div>
          }
          {changedInstances.map(([id, instance]) => {
            const label = instance.form.getField("http:%nexus-slash%%nexus-slash%schema.org%nexus-slash%name").getValue();
            return(
              <div className={classes.instance} key={instanceStore.getGeneratedKey(instance, "savePanel")}>
                <div className={classes.type}>
                  {instance.data.label}
                </div>
                <div className={classes.actions}>
                  {instance.isSaving?
                    <span className={classes.saveIcon}></span>
                    :
                    <ButtonGroup vertical>
                      <Button bsStyle="primary" bsSize="small" onClick={this.handleSave.bind(this, id)}><Glyphicon glyph={"save"}/></Button>
                      {!instance.isNew && <Button bsSize="small" onClick={this.handleReset.bind(this, id)}><Glyphicon glyph={"refresh"}/></Button>}
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
                    {instance.saveError} <Button bsSize={"xsmall"} bsStyle={"link"} onClick={this.handleDismissSaveError.bind(this, id)}><Glyphicon glyph={"ok"}/></Button>
                  </div>
                }
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}