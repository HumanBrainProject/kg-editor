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

import React from "react";
import injectStyles from "react-jss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react";
import { isFunction } from "lodash";

import routerStore from "../Stores/RouterStore";

let styles = {
  container:{
    height:"50px",
    lineHeight:"50px",
    color:"var(--ft-color-normal)",
    background:"var(--bg-color-ui-contrast2)",
    padding:"0 20px 0 20px",
    border:"1px solid var(--border-color-ui-contrast2)",
    borderLeft:"none",
    cursor:"pointer",
    display:"grid",
    gridTemplateColumns:"auto 1fr auto",
    "&$closable":{
      paddingRight:"10px"
    },
    "& $icon": {
      opacity:0.5
    },
    "&:hover":{
      color:"var(--ft-color-loud)",
      "& $icon": {
        opacity:1
      }
    }
  },
  closable:{},
  current:{
    backgroundColor:"var(--bg-color-ui-contrast3)",
    color:"var(--ft-color-loud)",
    borderBottom:"1px solid #40a9f3",
    "& $icon": {
      opacity:1
    }
  },
  text:{
    display:"inline-block",
    overflow:"hidden",
    textOverflow:"ellipsis",
    whiteSpace:"nowrap",
    "& + $close":{
      marginLeft:"10px"
    }
  },
  icon:{
    color:"var(--ft-color-loud)",
    display:"inline-block",
    "& + $text":{
      marginLeft:"10px"
    }
  },
  close:{
    color:"var(--ft-color-normal)",
    padding:"0 10px",
    "&:hover":{
      color:"var(--ft-color-loud)"
    }
  }
};

@injectStyles(styles)
@observer
export default class Tab extends React.Component {
  handleClick = (e) => {
    e.preventDefault();
    if(this.props.path){
      routerStore.history.push(this.props.path);
    }
    if(isFunction(this.props.onClick)){
      this.props.onClick(e);
    }
  }

  handleClose = (e) => {
    e.stopPropagation();
    if(isFunction(this.props.onClose)){
      this.props.onClose();
    }
  }

  render(){
    const {classes, current, icon, onClose, iconColor, iconSpin, hideLabel} = this.props;
    return (
      <div className={`${classes.container} ${current? classes.current: ""} ${onClose?classes.closable:""}`} onClick={this.handleClick}>
        <div className={classes.icon} style={iconColor?{color:iconColor}:{}} title={this.props.label}>
          {icon && <FontAwesomeIcon fixedWidth icon={icon} spin={iconSpin}/>}
        </div>
        {hideLabel?null:
          <div className={classes.text} title={this.props.label}>
            {this.props.label}
          </div>
        }
        {onClose?
          <div className={classes.close} onClick={this.handleClose}>
            <FontAwesomeIcon icon={"times"}/>
          </div>
          :null}
      </div>
    );
  }
}