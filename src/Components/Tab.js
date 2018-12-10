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