import React from "react";
import injectStyles from "react-jss";
import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import instanceStore from "../../../Stores/InstanceStore";
import routerStore from "../../../Stores/RouterStore";

const styles = {
  panel:{
    "& .btn":{
      display:"block",
      width:"100%"
    }
  },
  id:{
    paddingBottom: "10px",
    color:"grey",
    fontWeight:"300",
    fontSize:"0.7em",
    wordBreak: "break-all"
  },
  showActions:{
    "&$panel":{
      height:"36px"
    },
    "& $id":{
      paddingTop: "10px"
    },
    "& $actions":{
      display:"grid"
    }
  },
  actions:{
    display:"none",
    position:"absolute",
    top:"0",
    right:"15px",
    width:"100px",
    gridTemplateColumns:"repeat(4, 1fr)",
    opacity:0.25,
    "&:hover":{
      opacity:"1 !important"
    },
    cursor:"pointer"
  },

  action:{
    fontSize:"0.9em",
    lineHeight:"27px",
    textAlign:"center",
    backgroundColor: "var(--bg-color-ui-contrast4)",
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
export default class FooterPanel extends React.Component{
  handleOpenInstance(mode, instanceId, event){
    event.stopPropagation();
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(instanceId, mode);
    } else {
      routerStore.history.push(`/instance/${mode}/${instanceId}`);
    }
  }

  render(){
    const { classes, className, nexusId, id, showOpenActions } = this.props;

    return(
      <div className={`${classes.panel} ${className} ${showOpenActions?classes.showActions:""}`}>
        <Row>
          <Col xs={10}>
            <div className={classes.id}>Nexus ID: {nexusId}</div>
          </Col>
          <Col xs={2}>
            <div className={classes.actions}>
              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "view", id)}>
                <FontAwesomeIcon icon="eye"/>
              </div>
              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "edit", id)}>
                <FontAwesomeIcon icon="pencil-alt"/>
              </div>
              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "graph", id)}>
                <FontAwesomeIcon icon="project-diagram"/>
              </div>
              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "release", id)}>
                <FontAwesomeIcon icon="cloud-upload-alt"/>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}