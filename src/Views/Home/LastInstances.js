import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";

const styles = {
  container: {
    color:"var(--ft-color-normal)",
    "& h3": {
      margin: "25px 0 10px 0"
    },
    "& ul": {
      listStyleType: "none",
      paddingLeft: 0,
      "& li": {
        position:"relative",
        minHeight:"47px",
        cursor:"pointer",
        padding:"10px",
        background:"var(--bg-color-ui-contrast3)",
        borderLeft:"4px solid transparent",
        color:"var(--ft-color-normal)",
        outline:"1px solid var(--border-color-ui-contrast1)",
        marginBottom:"11px",
        "&:hover":{
          background:"var(--list-bg-hover)",
          borderColor:"var(--list-border-hover)",
          color:"var(--ft-color-loud)",
          outline:"1px solid transparent",
          "& $actions":{
            opacity:0.75
          }
        }
      }
    }
  },
  name:{
    fontSize:"1.4em",
    fontWeight:"300",
    color:"var(--ft-color-louder)"
  },
  description:{
    overflow:"hidden",
    whiteSpace:"nowrap",
    textOverflow:"ellipsis",
    marginTop:"10px"
  },
  actions:{
    position:"absolute",
    top:"10px",
    right:"10px",
    width:"100px",
    display:"grid",
    gridTemplateColumns:"repeat(4, 1fr)",
    opacity:0,
    "&:hover":{
      opacity:"1 !important"
    }
  },
  action:{
    fontSize:"0.9em",
    lineHeight:"27px",
    textAlign:"center",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color:"var(--ft-color-normal)",
    "&:hover":{
      color:"var(--ft-color-loud)"
    },
    "&:first-child":{
      borderRadius:"4px 0 0 4px"
    },
    "&:last-child":{
      borderRadius:"0 4px 4px 0"
    }
  }
};

@injectStyles(styles)
@observer
export default class LastInstances extends React.Component{

  handleOpenInstance(mode, instanceId, event) {
    event.stopPropagation();
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(instanceId, mode);
    } else {
      routerStore.history.push(`/instance/${mode}/${instanceId}`);
    }
  }

  render(){
    const {classes, title, list} = this.props;
    return(
      <div className={classes.container}>
        <h3>{title}</h3>
        <ul>
          {list.map(instanceId => {
            return (
              <li key={instanceId}
                onClick={this.handleOpenInstance.bind(this, "view", instanceId)}
                onDoubleClick={this.handleOpenInstance.bind(this, "view", instanceId)}>
                <div className={classes.name}>{instanceId}</div>
                {true || !!"instance.description" && (
                  <div className={classes.description}>{instanceId}</div>
                )}
                <div className={classes.actions}>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "view", instanceId)}>
                    <FontAwesomeIcon icon="eye"/>
                  </div>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "edit", instanceId)}>
                    <FontAwesomeIcon icon="pencil-alt"/>
                  </div>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "graph", instanceId)}>
                    <FontAwesomeIcon icon="project-diagram"/>
                  </div>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "release", instanceId)}>
                    <FontAwesomeIcon icon="cloud-upload-alt"/>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}