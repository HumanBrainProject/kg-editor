/**
 * Copyright (c) Human Brain Project
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import { inject, observer } from "mobx-react";
import { FormGroup, Glyphicon, MenuItem, Alert } from "react-bootstrap";
import { filter, difference, isFunction, isString } from "lodash";

import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";

import Alternatives from "./Alternatives";

import injectStyles from "react-jss";

const styles = {
  values:{
    height:"auto",
    paddingBottom:"3px",
    position:"relative",
    "& .btn":{
      marginRight:"3px",
      marginBottom:"3px"
    },
    "& :disabled":{
      pointerEvents:"none"
    },
    "& [readonly] .quickfire-remove":{
      pointerEvents:"none"
    },
    "&[readonly] .quickfire-user-input, &[disabled] .quickfire-user-input":{
      display:"none"
    }
  },
  valueDisplay:{
    display:"inline-block",
    maxWidth:"200px",
    overflow:"hidden",
    textOverflow:"ellipsis",
    whiteSpace:"nowrap",
    verticalAlign:"bottom"
  },
  remove:{
    fontSize:"0.8em",
    opacity:0.5,
    marginLeft:"3px",
    "&:hover":{
      opacity:1
    }
  },
  options:{
    width:"100%",
    maxHeight:"33vh",
    overflowY:"auto",
    "&.open":{
      display:"block"
    }
  },
  userInput:{
    background:"transparent",
    border:"none",
    color:"currentColor",
    outline:"none",
    width:"200px",
    maxWidth:"33%",
    marginBottom:"3px"
  },
  topList:{
    bottom: "100%",
    top: "auto",
    margin: "0 0 2px",
    boxShadow: "none"
  },
  readMode:{
    "& .quickfire-label:after":{
      content: "':\\00a0'"
    },
    "& .quickfire-readmode-item:not(:last-child):after":{
      content: "',\\00a0'"
    }
  },
  alternatives: {
    marginLeft: "3px"
  }
};

/**
 * Form component allowing to select multiple values from a drop-down list with
 * an option to allow custom values entered by the user.
 * The handling of the a custom value is delegated to the application level
 * through the call of the "onAddCustomValue" callback passed in paramter
 * @class KgDropdownSelectField
 * @memberof FormFields
 * @namespace KgDropdownSelectField
 */

@inject("formStore")
@injectStyles(styles)
@observer
export default class KgDropdownSelectField extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      userInputValue: ""
    };
    this.initField();
  }

  async initField() {
    const { field, formStore } = this.props;
    let { optionsUrl, cacheOptionsUrl } = field;
    if (optionsUrl) {
      field.updateOptions(await formStore.resolveURL(optionsUrl, cacheOptionsUrl));
      this.triggerOnLoad();
    }
  }

  triggerOnLoad = () => {
    if(this.hiddenInputRef && this.hiddenInputRef.parentNode){
      var event = new Event("load", { bubbles: true });
      this.hiddenInputRef.dispatchEvent(event);
    }
  }

  //The only way to trigger an onChange event in React is to do the following
  //Basically changing the field value, bypassing the react setter and dispatching an "input"
  // event on a proper html input node
  //See for example the discussion here : https://stackoverflow.com/a/46012210/9429503
  triggerOnChange = () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
      .call(this.hiddenInputRef, JSON.stringify(this.props.field.getValue(false)));
    var event = new Event("input", { bubbles: true });
    this.hiddenInputRef.dispatchEvent(event);
  }

  handleInputKeyStrokes = e => {
    let field = this.props.field;
    if(field.disabled || field.readOnly){
      return;
    }
    if(field.allowCustomValues && e.keyCode === 13 && field.value.length < field.max){
      //User pressed "Enter" while focus on input and we haven't reached the maximum values
      if(isFunction(this.props.onAddCustomValue)){
        this.props.onAddCustomValue(e.target.value.trim(), field, this.props.formStore);
      }
      this.setState({userInputValue: ""});
    } else if(!e.target.value && field.value.length > 0 && e.keyCode === 8){
      // User pressed "Backspace" while focus on input, and input is empty, and values have been entered
      e.preventDefault();
      this.beforeRemoveValue(field.value[field.value.length-1]);
      this.triggerOnChange();
    } else if(e.keyCode === 40){
      e.preventDefault();
      let allOptions = this.optionsRef.querySelectorAll(".option");
      if(allOptions.length > 0){
        allOptions[0].focus();
      }
    } else if(e.keyCode === 38){
      e.preventDefault();
      let allOptions = this.optionsRef.querySelectorAll(".option");
      if(allOptions.length > 0){
        allOptions[allOptions.length-1].focus();
      }
    } else if(e.keyCode === 27) {
      //escape key -> we want to close the dropdown menu
      this.closeDropdown();
    }
  };

  handleChangeUserInput = e => {
    if(this.props.field.disabled || this.props.field.readOnly){
      return;
    }
    e.stopPropagation();
    this.setState({ userInputValue: e.target.value });
  }

  handleFocus = e => {
    if(this.props.field.disabled || this.props.field.readOnly){
      return;
    }

    if (this.wrapperRef
      && this.alternativesRef && this.alternativesRef.props && this.alternativesRef.props.className
      && this.wrapperRef.querySelector("." + this.alternativesRef.props.className)
      && this.wrapperRef.querySelector("." + this.alternativesRef.props.className).contains(e.target)) {
      this.closeDropdown();
      return;
    }
    this.inputRef.focus();
    this.listenClickOutHandler();
    this.forceUpdate();
  };

  closeDropdown(){
    this.wrapperRef = null;
    this.forceUpdate();
  }

  handleRemove(value, e){
    if(this.props.field.disabled || this.props.field.readOnly){
      return;
    }
    e.stopPropagation();
    this.beforeRemoveValue(value);
    this.triggerOnChange();
  }

  handleRemoveBackspace(value, e){
    if(this.props.field.disabled || this.props.field.readOnly){
      return;
    }
    //User pressed "Backspace" while focus on a value
    if(e.keyCode === 8){
      e.preventDefault();
      this.beforeRemoveValue(value);
      this.triggerOnChange();
      this.handleFocus();
    }
  }

  handleSelect(option, e){
    let field = this.props.field;
    if(field.disabled || field.readOnly){
      return;
    }
    if(!e || (e && (!e.keyCode || e.keyCode === 13))){
      //If this function call doesn't send an event (->React Bootstrap OnSelect callback)
      //Or if it comes from a keyboard event associated with the "Enter" key
      if(e){
        e.preventDefault();
      }
      if(field.value.length < field.max){
        //If we have not reached the maximum values
        if(isString(option)){
          if(field.allowCustomValues && isFunction(this.props.onAddCustomValue)){
            this.props.onAddCustomValue(option, field, this.props.formStore);
          }
        } else {
          this.beforeAddValue(option);
          this.triggerOnChange();
        }
        this.setState({userInputValue:""});
        this.handleFocus();
      }
    } else if(e && (e.keyCode === 38 || e.keyCode === 40)){
      //If it comes from a key board event associated with the "Up" or "Down" key
      e.preventDefault();
      let allOptions = this.optionsRef.querySelectorAll(".option");
      let currentIndex = Array.prototype.indexOf.call(allOptions, e.target);
      let nextIndex;
      if(e.keyCode === 40){
        nextIndex = currentIndex + 1 < allOptions.length? currentIndex + 1: 0;
      } else {
        nextIndex = currentIndex - 1 >= 0? currentIndex - 1: allOptions.length-1;
      }
      allOptions[nextIndex].focus();
    }
  }

  handleAlternativeSelect = values => {
    let field = this.props.field;
    field.value.map(value => value).forEach(value => this.beforeRemoveValue(value));
    values.forEach(value => this.beforeAddValue(value));
    this.triggerOnChange();
  }

  getAlternativeOptions = value => {
    const { options, mappingValue } = this.props.field;

    const valueAttributeName = mappingValue?mappingValue:"id";

    if (!value) {
      return [];
    }

    if (typeof value !== "object") {
      return [value];
    }

    if (value.length) {
      return value.map(item => {
        if (item[valueAttributeName] && (options instanceof Array)) {
          const option = options.find(option => option[valueAttributeName] === item[valueAttributeName]);
          if (option) {
            return option;
          }
          return item;
        }
        return item;
      });
    }

    if (value.id && (options instanceof Array)) {
      const option = options.find(option => option[valueAttributeName] === value[valueAttributeName]);
      if (option) {
        return [option];
      }
      return [value];
    }

    return [];
  }

  handleDrop(droppedVal, e){
    let field = this.props.field;
    if(field.disabled || field.readOnly){
      return;
    }
    e.preventDefault();
    field.removeValue(this.draggedValue);
    field.addValue(this.draggedValue, field.value.indexOf(droppedVal));
    if(this.props.field.closeDropdownAfterInteraction){
      this.wrapperRef = null;
    }
    this.triggerOnChange();
    this.handleFocus();
  }

  clickOutHandler = e => {
    if(!this.wrapperRef || !this.wrapperRef.contains(e.target)){
      this.unlistenClickOutHandler();
      this.setState({userInputValue:""});
    }
  };

  listenClickOutHandler(){
    window.addEventListener("mouseup", this.clickOutHandler, false);
    window.addEventListener("touchend", this.clickOutHandler, false);
    window.addEventListener("keyup", this.clickOutHandler, false);
  }

  unlistenClickOutHandler(){
    window.removeEventListener("mouseup", this.clickOutHandler, false);
    window.removeEventListener("touchend", this.clickOutHandler, false);
    window.removeEventListener("keyup", this.clickOutHandler, false);
  }

  componentWillUnmount(){
    this.unlistenClickOutHandler();
  }

  beforeAddValue(value){
    if(isFunction(this.props.onBeforeAddValue)){
      this.props.onBeforeAddValue(() => {this.props.field.addValue(value);}, this.props.field, value);
    } else {
      this.props.field.addValue(value);
    }
    if(this.props.field.closeDropdownAfterInteraction){
      this.wrapperRef = null;
    }
  }

  beforeRemoveValue(value){
    if(isFunction(this.props.onBeforeRemoveValue)){
      this.props.onBeforeRemoveValue(() => {this.props.field.removeValue(value);}, this.props.field, value);
    } else {
      this.props.field.removeValue(value);
    }
    if(this.props.field.closeDropdownAfterInteraction){
      this.wrapperRef = null;
    }
  }

  handleTagInteraction(interaction, value, event){
    if(isFunction(this.props[`onValue${interaction}`])){
      this.props[`onValue${interaction}`](this.props.field, value, event);
    } else if(interaction === "Focus"){
      event.stopPropagation();
      this.closeDropdown();
    }
  }

  render() {
    if(this.props.formStore.readMode || this.props.field.readMode){
      return this.renderReadMode();
    }

    let { classes, formStore } = this.props;
    let { options, value: values, mappingLabel, mappingValue, listPosition, disabled, readOnly, max, allowCustomValues, validationErrors, validationState, path } = this.props.field;

    let dropdownOpen = (!disabled && !readOnly && values.length < max && this.wrapperRef && this.wrapperRef.contains(document.activeElement));
    let dropdownClass = dropdownOpen? "open": "";
    dropdownClass += listPosition === "top" ? " "+classes.topList: "";

    let regexSearch = new RegExp(this.state.userInputValue, "gi");
    let filteredOptions = [];
    if(dropdownOpen){
      filteredOptions = filter(options, (option) => {
        return option[mappingLabel].match(regexSearch);
      });
      filteredOptions = difference(filteredOptions, values);
    }

    const fieldPath = (typeof path === "string")?path.substr(1):null; // remove first | char
    const alternatives = ((fieldPath && formStore && formStore.structure && formStore.structure.alternatives && formStore.structure.alternatives[fieldPath])?formStore.structure.alternatives[fieldPath]:[])
      .map(alternative => ({
        value: this.getAlternativeOptions(alternative.value),
        userIds: alternative.userIds
      }));

    return (
      <div ref={ref=>this.wrapperRef = ref}>
        <FormGroup
          onClick={this.handleFocus}
          className={`quickfire-field-dropdown-select ${!values.length? "quickfire-empty-field": ""}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}
          validationState={validationState}>
          <FieldLabel field={this.props.field}/>
          <Alternatives className={classes.alternatives} show={!disabled && !readOnly && !!alternatives.length} disabled={disabled || readOnly} list={alternatives} onSelect={this.handleAlternativeSelect}  ref={ref=>this.alternativesRef = ref}/>
          <div disabled={disabled} readOnly={readOnly} className={`form-control ${classes.values}`}>
            {values.map(value => {
              const label = value[mappingLabel] !== undefined?value[mappingLabel]:(value[mappingValue] !== undefined?value[mappingValue]:value.id);
              return(
                <div key={formStore.getGeneratedKey(value, "quickfire-dropdown-item-button")}
                  tabIndex={"0"}
                  className={`value-tag quickfire-value-tag btn btn-xs btn-default ${disabled||readOnly? "disabled": ""}`}
                  disabled={disabled}
                  readOnly={readOnly}
                  draggable={true}
                  onDragEnd={()=>this.draggedValue = null}
                  onDragStart={()=>this.draggedValue = value}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={this.handleDrop.bind(this, value)}
                  onKeyDown={this.handleRemoveBackspace.bind(this, value)}

                  onClick={this.handleTagInteraction.bind(this, "Click", value)}
                  onFocus={this.handleTagInteraction.bind(this, "Focus", value)}
                  onBlur={this.handleTagInteraction.bind(this, "Blur", value)}
                  onMouseOver={this.handleTagInteraction.bind(this, "MouseOver", value)}
                  onMouseOut={this.handleTagInteraction.bind(this, "MouseOut", value)}
                  onMouseEnter={this.handleTagInteraction.bind(this, "MouseEnter", value)}
                  onMouseLeave={this.handleTagInteraction.bind(this, "MouseLeave", value)}

                  title={label}>
                  <span className={classes.valueDisplay}>
                    {isFunction(this.props.valueLabelRendering)?
                      this.props.valueLabelRendering(this.props.field, value)
                      :
                      label}
                  </span>
                  <Glyphicon className={`${classes.remove} quickfire-remove`} glyph="remove" onClick={this.handleRemove.bind(this, value)}/>
                </div>
              );
            })}

            <input className={`quickfire-user-input ${classes.userInput}`}
              onDrop={this.handleDrop.bind(this, null)}
              onDragOver={e=>e.preventDefault()}
              ref={ref=>this.inputRef=ref} type="text"
              onKeyDown={this.handleInputKeyStrokes}
              onChange={this.handleChangeUserInput}
              onFocus={this.handleFocus}
              value={this.state.userInputValue}
              disabled={readOnly || disabled || values.length >= max}/>

            <input style={{display:"none"}} type="text" ref={ref=>this.hiddenInputRef = ref}/>

            {dropdownOpen && (filteredOptions.length || this.state.userInputValue)?
              <ul className={`quickfire-dropdown dropdown-menu ${classes.options} ${dropdownClass}`} ref={ref=>{this.optionsRef = ref;}}>
                {!allowCustomValues && this.state.userInputValue && filteredOptions.length === 0?
                  <MenuItem key={"no-options"} className={"quickfire-dropdown-item"}>
                    <em>No options available for: </em> <strong>{this.state.userInputValue}</strong>
                  </MenuItem>
                  :null}

                {allowCustomValues && this.state.userInputValue?
                  <MenuItem className={"quickfire-dropdown-item"} key={this.state.userInputValue} onSelect={this.handleSelect.bind(this, this.state.userInputValue)}>
                    <div tabIndex={-1} className={"option"} onKeyDown={this.handleSelect.bind(this, this.state.userInputValue)}>
                      <em>Add a value: </em> <strong>{this.state.userInputValue}</strong>
                    </div>
                  </MenuItem>
                  :null}
                {filteredOptions.map(option => {
                  return(
                    <MenuItem className={"quickfire-dropdown-item"} key={formStore.getGeneratedKey(option, "quickfire-dropdown-list-item")} onSelect={this.handleSelect.bind(this, option)}>
                      <div tabIndex={-1} className={"option"} onKeyDown={this.handleSelect.bind(this, option)}>
                        {option[mappingLabel]}
                      </div>
                    </MenuItem>
                  );
                })}
              </ul>
              :null}
          </div>
          {validationErrors && <Alert bsStyle="danger">
            {validationErrors.map(error => <p key={error}>{error}</p>)}
          </Alert>}
        </FormGroup>
      </div>
    );
  }

  renderReadMode(){
    let {
      value,
      mappingLabel,
      disabled,
      readOnly
    } = this.props.field;

    const {classes} = this.props;

    return (
      <div className={`quickfire-field-dropdown-select ${!value.length? "quickfire-empty-field":""} quickfire-readmode ${classes.readMode}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}>
        <FieldLabel field={this.props.field}/>
        {isFunction(this.props.readModeRendering)?
          this.props.readModeRendering(this.props.field)
          :
          <span className={"quickfire-readmode-list"}>
            {value.map(value => {
              return (
                <span key={this.props.formStore.getGeneratedKey(value, "dropdown-read-item")} className={"quickfire-readmode-item"}>
                  {isFunction(this.props.valueLabelRendering)?
                    this.props.valueLabelRendering(this.props.field, value):
                    value[mappingLabel]}
                </span>
              );
            })}
          </span>
        }
        <input style={{display:"none"}} type="text" ref={ref=>this.hiddenInputRef = ref}/>
      </div>
    );
  }
}