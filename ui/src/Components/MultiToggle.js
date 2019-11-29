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
class MultiToggle extends React.Component{

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

export default MultiToggle;