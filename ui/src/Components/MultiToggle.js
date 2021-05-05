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
import {isFunction} from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  container:{
    display:"inline-grid",
    background:"var(--bg-color-ui-contrast4)",
    borderRadius:"20px",
    height:"24px"
  }
};

@injectStyles(styles)
export default class MultiToggle extends React.Component{

  constructor(props){
    super(props);
  }

  handleSelect(value){
    if(isFunction(this.props.onChange)){
      this.props.onChange(value);
    }
  }

  render(){
    const { classes, children } = this.props;

    let childrenWithProps = React.Children.map(children, child => child && React.cloneElement(child, { selectedValue: this.props.selectedValue, onSelect: this.handleSelect.bind(this) }));

    return(
      <div className={classes.container} style={{gridTemplateColumns:`repeat(${childrenWithProps.length}, 24px)`}}>
        {childrenWithProps}
      </div>
    );
  }
}

const toggleStyles = {
  container:{
    textAlign:"center",
    height:"24px",
    lineHeight:"24px",
    cursor:"pointer",
    fontSize:"0.66em",
    transition:"all .2s ease",
    background:"none",
    "&.selected":{
      background:"var(--bg-color-ui-contrast1)",
      borderRadius:"50%",
      transform:"scale(1.12)",
      fontSize:"0.8em",
      /*backgroundColor:"currentColor",
      "& svg":{
        color:"white"
      },*/
      "&.noscale":{
        transform:"scale(1)",
      }
    }
  }
};

@injectStyles(toggleStyles)
class Toggle extends React.Component{
  handleClick = () => {
    if(isFunction(this.props.onSelect)){
      this.props.onSelect(this.props.value);
    }
  }

  render(){
    const {classes, selectedValue, value, noscale} = this.props;
    return(
      <div onClick={this.handleClick} className={`${classes.container}${selectedValue === value?" selected":""}${noscale !== undefined?" noscale":""}`} style={{color:this.props.color}}>
        <FontAwesomeIcon icon={this.props.icon || "dot-circle"}/>
      </div>
    );
  }
}

MultiToggle.Toggle = Toggle;