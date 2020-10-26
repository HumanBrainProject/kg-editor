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
import { createUseStyles } from "react-jss";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import routerStore from "../../../Stores/RouterStore";
import appStore from "../../../Stores/AppStore";

const useStyles = createUseStyles({
  panel:{
    "& .btn":{
      display:"block",
      width:"100%"
    }
  },
  info:{
    color:"grey",
    fontWeight:"300",
    fontSize:"0.7em",
    wordBreak: "break-all",
    "&:last-child": {
      paddingBottom: "10px"
    }
  },
  showActions:{
    "& $panel":{
      height:"36px"
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
    width:"25px",
    gridTemplateColumns:"repeat(1, 1fr)",
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
    },
    "&:first-child:last-child":{
      borderRadius:"4px"
    }
  }
});

const FooterPanel = ({ className, instance, showOpenActions }) => {

  const classes = useStyles();

  const handleOpenInstance = e => {
    e.stopPropagation();
    if(e.metaKey || e.ctrlKey){
      appStore.openInstance(instance.id, instance.name, instance.primaryType, "view");
    } else {
      routerStore.history.push(`/instances/${instance.id}`);
    }
  };

  return(
    <div className={`${classes.panel} ${className} ${showOpenActions?classes.showActions:""}`}>
      <Row>
        <Col xs={10}>
          <div className={classes.info}>ID: {instance.id?instance.id:"<New>"}</div>
          <div className={classes.info}>Workspace: {instance.workspace}</div>
        </Col>
        <Col xs={2}>
          <div className={classes.actions}>
            {appStore.currentWorkspace.id === instance.workspace && instance.permissions.canRead && (
              <div className={classes.action} onClick={handleOpenInstance}>
                <FontAwesomeIcon icon="folder-open"/>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default FooterPanel;