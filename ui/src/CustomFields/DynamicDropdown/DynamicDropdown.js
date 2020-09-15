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
import { inject, observer } from "mobx-react";
import { get, toJS } from "mobx";
import { FormGroup, Glyphicon, Alert } from "react-bootstrap";
import { isFunction } from "lodash";

import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";

import Alternatives from "../Alternatives";
import appStore from "../../Stores/AppStore";
import instanceStore from "../../Stores/InstanceStore";

import injectStyles from "react-jss";
import FieldError from "../FieldError";
import Dropdown from "./Dropdown";

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
  notFound:{
    fontStyle: "italic",
    backgroundColor: "lightgrey",
    "&:hover":{
      backgroundColor: "lightgrey"
    }
  },
  options:{
    width:"100%",
    maxHeight:"33vh",
    overflowY:"auto",
    "&.open":{
      display:"block"
    },
    position: "absolute",
    top: "100%",
    left: "0",
    zIndex: "1000",
    display: "none",
    float: "left",
    minWidth: "160px",
    padding: "5px 0",
    margin: "2px 0 0",
    fontSize: "14px",
    textAlign: "left",
    backgroundColor: "#fff",
    backgroundClip: "padding-box",
    border: "1px solid rgba(0,0,0,.15)",
    borderRadius: "4px",
    boxShadow: "0 6px 12px rgba(0,0,0,.175)",
    "& .dropdown-menu":{
      position:"static",
      display:"block",
      float:"none",
      width:"100%",
      background:"none",
      border:"none",
      boxShadow:"none",
      padding:0,
      margin:0
    },
    "& .quickfire-dropdown-item .option": {
      position: "relative"
    },
    "& .quickfire-dropdown-item:hover $preview": {
      display: "block"
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

@inject("formStore")
@injectStyles(styles)
@observer
class DynamicDropdownField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alternatives: [],
      currentType: null,
      currentOption: null
    };
  }

  //The only way to trigger an onChange event in React is to do the following
  //Basically changing the field value, bypassing the react setter and dispatching an "input"
  // event on a proper html input node
  //See for example the discussion here : https://stackoverflow.com/a/46012210/9429503
  triggerOnChange = () => {
    this.hiddenInputRef.value = "";
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
      .call(this.hiddenInputRef, JSON.stringify(this.props.field.getValue(false)));
    var event = new Event("input", { bubbles: true });
    this.hiddenInputRef.dispatchEvent(event);
  }

  triggerRemoveSuggestionOnChange = () => {
    let selectedInstance = instanceStore.instances.get(this.props.formStore.structure.id);
    selectedInstance && selectedInstance.setFieldAsNull(this.props.field.path.substr(1));
    this.inputRef.parentNode.style.height = "34px"; // Only for dropdown as it is wrapped in a div
    this.handleNodesStyles(this.props.field.getValue(false));
    let event = new Event("input", { bubbles: true });
    this.hiddenInputRef.dispatchEvent(event);
  }

  handleNodesStyles(value){
    const prototype = window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set
      .call(this.hiddenInputRef, JSON.stringify(value));
  }

  handleInputKeyStrokes = e => {
    let field = this.props.field;
    if(field.disabled || field.readOnly){
      return;
    }
    if(!e.target.value && field.value.length > 0 && e.keyCode === 8){
      // User pressed "Backspace" while focus on input, and input is empty, and values have been entered
      e.preventDefault();
      this.beforeRemoveValue(field.value[field.value.length-1]);
      this.triggerOnChange();
    } else if(e.keyCode === 40){
      e.preventDefault();
      const { options, optionsTypes } = this.props.field;
      if(optionsTypes.length){
        const type = optionsTypes[0];
        this.setState({currentType: type.name, currentOption: null});
      } else if(options.length){
        const value = options[0];
        this.setState({currentType: null, currentOption: value.id});
      } else if(optionsTypes.length) {
        const type = optionsTypes[optionsTypes.length-1];
        this.setState({currentType: type.name, currentOption: null});
      } else {
        this.setState({currentType: null, currentOption: null});
      }
    } else if(e.keyCode === 38){
      e.preventDefault();
      const { options, optionsTypes } = this.props.field;
      if(options.length){
        const value = options[options.length - 1];
        this.setState({currentType: null, currentOption: value.id});
      } else if(optionsTypes.length){
        const type = optionsTypes[options.length-1];
        this.setState({currentType: type.name, currentOption: null});
      } else if(options.length){
        const value = options[0];
        this.setState({currentType: null, currentOption: value.id});
      } else {
        this.setState({currentType: null, currentOption: null});
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
    this.props.field.setUserInput(e.target.value);
  }

  handleFocus = e => {
    this.setState({currentType: null, currentOption: null});
    if(this.props.field.disabled || this.props.field.readOnly){
      return;
    }
    if (e && e.target && this.wrapperRef
      && this.alternativesRef && this.alternativesRef.props && this.alternativesRef.props.className
      && this.wrapperRef.querySelector("." + this.alternativesRef.props.className)
      && this.wrapperRef.querySelector("." + this.alternativesRef.props.className).contains(e.target)) {
      this.closeDropdown();
      return;
    }
    this.props.field.fetchOptions(true);
    this.listenClickOutHandler();
  };

  closeDropdown = () => {
    this.wrapperRef = null;
    this.setState({currentType: null, currentOption: null});
    appStore.togglePreviewInstance();
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

  handleAlternativeSelect = values => {
    let field = this.props.field;
    field.value.map(value => value).forEach(value => this.beforeRemoveValue(value));
    values.forEach(value => this.beforeAddValue(value));
    this.triggerOnChange();
  }

  handleRemoveSuggestion = () => {
    let field = this.props.field;
    field.value.map(value => value).forEach(value => this.beforeRemoveValue(value));
    this.triggerRemoveSuggestionOnChange();
  }

  handleOnAddNewValue = name => {
    const {field, onAddCustomValue} = this.props;
    const labelValue =  field.userInput.trim();
    if(labelValue) {
      onAddCustomValue(labelValue, name, field);
      field.setUserInput("");
    }
    this.handleFocus();
  }

  handleOnAddValue = id => {
    const {field} = this.props;
    this.beforeAddValue({"@id": id});
    this.triggerOnChange();
    field.setUserInput("");
    this.handleFocus();
  }

  handleOnSelectNextType = name => {
    const { optionsTypes, options } = this.props.field;
    const index = optionsTypes.findIndex(o => o.name === name);
    if(index < optionsTypes.length - 1){
      const type = optionsTypes[index + 1] ;
      this.setState({currentType: type.name, currentOption: null});
    } else if(options.length){
      const value = options[0];
      this.setState({currentType: null, currentOption: value.id});
    } else if(optionsTypes.length) {
      const type = optionsTypes[0];
      this.setState({currentType: type.name, currentOption: null});
    } else {
      this.setState({currentType: null, currentOption: null});
    }
  }

  handleOnSelectPreviousType = name => {
    const { optionsTypes, options } = this.props.field;
    const index = optionsTypes.findIndex(o => o.name === name);
    if(index > 0){
      const type = optionsTypes[index - 1] ;
      this.setState({currentType: type.name, currentOption: null});
    } else if(options.length){
      const value = options[options.length-1];
      this.setState({currentType: null, currentOption: value.id});
    } else if(optionsTypes.length) {
      const type = optionsTypes[0];
      this.setState({currentType: type.name, currentOption:null});
    } else {
      this.setState({currentType: null, currentOption: null});
    }
  }

  handleOnSelectNextValue = id => {
    const { optionsTypes, options } = this.props.field;
    const index = options.findIndex(o => o.id === id);
    if(index < options.length - 1){
      const value = options[index + 1] ;
      this.setState({currentType:null, currentOption: value.id});
    } else if(optionsTypes.length) {
      const type = optionsTypes[0];
      this.setState({currentType: type.name, currentOption: null});
    } else if(options.length) {
      const value = options[0];
      this.setState({currentType: null, currentOption: value.id});
    } else {
      this.setState({currentType: null, currentOption: null});
    }
  }

  handleOnSelectPreviousValue = id => {
    const { optionsTypes, options } = this.props.field;
    const index = options.findIndex(o => o.id === id);
    if(index > 0){
      const value = options[index- 1] ;
      this.setState({currentType: null, currentOption: value.id});
    } else if(optionsTypes.length){
      const type = optionsTypes[optionsTypes.length-1];
      this.setState({currentType: type.name, currentOption: null});
    } else if(options.length){
      const value = options[0];
      this.setState({currentType: null, currentOption: value.id});
    } else {
      this.setState({currentType: null, currentOption: null});
    }
  }

  getAlternativeOptions = value => {
    const { field } = this.props;
    const { options, mappingValue } = field;
    const valueAttributeName = mappingValue?mappingValue:"id";

    if (!value) {
      return [];
    }

    if (typeof value !== "object") {
      return [value];
    }

    if (value.length) {
      return value.map(item => {
        if (item[valueAttributeName]) {
          if (options instanceof Array) {
            const option = options.find(option => option[valueAttributeName] === item[valueAttributeName]);
            if (option) {
              return option;
            }
          }
          return field.getOption(item);
        }
        return item;
      });
    }

    if (value[valueAttributeName]) {
      if (options instanceof Array) {
        const option = options.find(option => option[valueAttributeName] === value[valueAttributeName]);
        if (option) {
          return [option];
        }
      }
      return [field.getOption(value)];
    }

    return [];
  }

  getAlternatives = () => {
    const { formStore, field: { path} } = this.props;

    const fieldPath = (typeof path === "string")?path.substr(1):null; // remove first | char
    const alternatives = ((fieldPath && formStore && formStore.structure && formStore.structure.alternatives && formStore.structure.alternatives[fieldPath])?formStore.structure.alternatives[fieldPath]:[])
      .sort((a, b) => a.selected === b.selected?0:(a.selected?-1:1))
      .map(alternative => ({
        value: this.getAlternativeOptions(alternative.value),
        userIds: alternative.userIds,
        selected: !!alternative.selected
      }));
    this.setState({alternatives: alternatives});
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
      this.props.field.setUserInput("");
      appStore.togglePreviewInstance();
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

  componentDidMount(){
    this.getAlternatives();
  }

  componentDidUpdate(prevProps){
    if (this.props.formStore && this.props.formStore.structure && (!prevProps.formStore || !prevProps.formStore.structure || (JSON.stringify(toJS(this.props.formStore.structure.alternatives)) !== JSON.stringify(toJS(prevProps.formStore.structure.alternatives))))) {
      this.getAlternatives();
    }
  }

  beforeAddValue(value){
    this.props.field.addValue(value);
    if(this.props.field.closeDropdownAfterInteraction){
      this.wrapperRef = null;
    }
  }

  beforeRemoveValue(value){
    this.props.field.removeValue(value);
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

  handleLoadMoreOptions = () => {
    this.props.field.loadMoreOptions();
  }

  handleOptionPreview = (instanceId, instanceName) => {
    const options = { showEmptyFields:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    appStore.togglePreviewInstance(instanceId, instanceName, options);
  }

  valueLabelRendering = (field, value) => {
    return field.valueLabelRendering(field, value, this.props.valueLabelRendering);
  }

  renderReadMode(){
    const { classes, field, readModeRendering } = this.props;
    const { value, disabled, readOnly } = field;
    return (
      <FieldError id={this.props.formStore.structure.id} field={this.props.field}>
        <div className={`quickfire-field-dropdown-select ${!value.length? "quickfire-empty-field":""} quickfire-readmode ${classes.readMode}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}>
          <FieldLabel field={field}/>
          {isFunction(readModeRendering)?
            this.props.readModeRendering(field)
            :
            <span className={"quickfire-readmode-list"}>
              {value.map(value => (
                <span key={this.props.formStore.getGeneratedKey(value, "dropdown-read-item")} className="quickfire-readmode-item">
                  {this.valueLabelRendering(field, value)}
                </span>
              ))}
            </span>
          }
          <input style={{display:"none"}} type="text" ref={ref=>this.hiddenInputRef = ref}/>
        </div>
      </FieldError>
    );
  }

  render() {
    if(this.props.formStore.readMode || this.props.field.readMode){
      return this.renderReadMode();
    }

    const { classes, formStore, field } = this.props;
    const { options, value: values, mappingLabel, disabled, readOnly, max, allowCustomValues, validationErrors, validationState, path, optionsTypes, optionsOuterSpaceTypes, userInput} = field;

    const selectedInstance = instanceStore.instances.get(this.props.formStore.structure.id);
    const isAlternativeDisabled = !selectedInstance || selectedInstance.fieldsToSetAsNull.includes(path.substr(1));

    const dropdownOpen = !disabled && !readOnly && values.length < max && this.wrapperRef && this.wrapperRef.contains(document.activeElement) && (options.length || userInput);
    const types = (allowCustomValues && optionsTypes.length && userInput)?optionsTypes:[];
    const outerSpaceTypes = (allowCustomValues && optionsOuterSpaceTypes.length && userInput)?optionsOuterSpaceTypes:[];

    return (
      <FieldError id={this.props.formStore.structure.id} field={this.props.field}>
        <div ref={ref=>this.wrapperRef = ref}>
          <FormGroup
            onClick={this.handleFocus}
            className={`quickfire-field-dropdown-select ${!values.length? "quickfire-empty-field": ""}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}
            validationState={validationState}>
            <FieldLabel field={this.props.field}/>
            <Alternatives className={classes.alternatives}
              show={!disabled && !readOnly && !!this.state.alternatives.length}
              disabled={disabled || readOnly || isAlternativeDisabled}
              list={this.state.alternatives}
              onSelect={this.handleAlternativeSelect}
              onClick={this.handleRemoveSuggestion}
              field={field}
              parentContainerClassName="form-group"
              ref={ref=>this.alternativesRef = ref}/>
            <div disabled={disabled} readOnly={readOnly} className={`form-control ${classes.values}`}>
              {values.map(value => (
                <div key={formStore.getGeneratedKey(value, "quickfire-dropdown-item-button")}
                  tabIndex={"0"}
                  className={`value-tag quickfire-value-tag btn btn-xs btn-default ${disabled||readOnly? "disabled": ""} ${value.fetchError ? classes.notFound : ""}`}
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
                  title={get(value, mappingLabel)}>
                  <span className={classes.valueDisplay}>{this.valueLabelRendering(this.props.field, value)}</span>
                  <Glyphicon className={`${classes.remove} quickfire-remove`} glyph="remove" onClick={this.handleRemove.bind(this, value)}/>
                </div>
              ))}

              <input className={`quickfire-user-input ${classes.userInput}`}
                onDrop={this.handleDrop.bind(this, null)}
                onDragOver={e=>e.preventDefault()}
                ref={ref=>this.inputRef=ref} type="text"
                onKeyDown={this.handleInputKeyStrokes}
                onChange={this.handleChangeUserInput}
                onFocus={this.handleFocus}
                value={userInput}
                disabled={readOnly || disabled || values.length >= max}/>

              <input style={{display:"none"}} type="text" ref={ref=>this.hiddenInputRef = ref}/>

              {dropdownOpen?
                <Dropdown currentType={this.state.currentType}
                  currentOption={this.state.currentOption}
                  search={userInput}
                  values={options}
                  types={types}
                  outerSpaceTypes={outerSpaceTypes}
                  loading={this.props.field.fetchingOptions}
                  hasMore={this.props.field.hasMoreOptions}
                  onLoadMore={this.handleLoadMoreOptions}
                  onAddNewValue={this.handleOnAddNewValue}
                  onAddValue={this.handleOnAddValue}
                  onSelectNextType={this.handleOnSelectNextType}
                  onSelectPreviousType={this.handleOnSelectPreviousType}
                  onSelectNextValue={this.handleOnSelectNextValue}
                  onSelectPreviousValue={this.handleOnSelectPreviousValue}
                  onClose={this.closeDropdown}
                  onPreview={this.handleOptionPreview}
                />
                :null}
            </div>
            {validationErrors && <Alert bsStyle="danger">
              {validationErrors.map(error => <p key={error}>{error}</p>)}
            </Alert>}
          </FormGroup>
        </div>
      </FieldError>
    );
  }
}

export default DynamicDropdownField;