import React from "react";
import { inject, observer } from "mobx-react";
import { get, toJS } from "mobx";
import { FormGroup, Glyphicon, MenuItem, Alert } from "react-bootstrap";
import { difference, isFunction, isString, uniq } from "lodash";
import InfiniteScroll from "react-infinite-scroller";

import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";

import Alternatives from "./Alternatives";
import instanceStore from "../Stores/InstanceStore";

import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FieldError from "./FieldError";

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
  },
  preview: {
    display: "none",
    position: "absolute",
    top: "50%",
    right: "-10px",
    borderRadius: "2px",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-louder)",
    padding: "3px 6px",
    cursor: "pointer",
    transform: "translateY(-50%)"
  }
};

@inject("formStore")
@injectStyles(styles)
@observer
export default class DynamicDropdownField extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alternatives: [] };
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
    if(field.allowCustomValues && e.keyCode === 13 && field.value.length < field.max){
      //User pressed "Enter" while focus on input and we haven't reached the maximum values
      if(isFunction(this.props.onAddCustomValue)){
        this.props.onAddCustomValue(e.target.value.trim(), field, this.props.formStore);
      }
      field.setUserInput("");
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
    this.props.field.setUserInput(e.target.value);
  }

  handleFocus = e => {
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
    this.inputRef.focus();
    this.listenClickOutHandler();
    //this.forceUpdate();
  };

  closeDropdown(){
    this.wrapperRef = null;
    instanceStore.togglePreviewInstance();
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
    instanceStore.togglePreviewInstance();
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
        field.setUserInput("");
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

  handleRemoveSuggestion = () => {
    let field = this.props.field;
    field.value.map(value => value).forEach(value => this.beforeRemoveValue(value));
    this.triggerRemoveSuggestionOnChange();
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
      instanceStore.togglePreviewInstance();
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

  handleLoadMoreOptions = () => {
    this.props.field.loadMoreOptions();
  }

  handleOptionPreview = (instanceId, instanceName, event) => {
    event && event.stopPropagation();
    const options = { showEmptyFields:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    instanceStore.togglePreviewInstance(instanceId, instanceName, options);
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
    const { options, value: values, mappingValue, mappingLabel, listPosition, disabled, readOnly, max, allowCustomValues, validationErrors, validationState, path } = field;

    const selectedInstance = instanceStore.instances.get(this.props.formStore.structure.id);
    const isAlternativeDisabled = !selectedInstance || selectedInstance.fieldsToSetAsNull.includes(path.substr(1));

    const dropdownOpen = (!disabled && !readOnly && values.length < max && this.wrapperRef && this.wrapperRef.contains(document.activeElement));
    const dropdownClass = (dropdownOpen? "open": "") + (listPosition === "top"?" " + classes.topList: "");

    let filteredOptions = [];
    if(dropdownOpen){
      filteredOptions = difference(options, values);
      filteredOptions = uniq(filteredOptions);
    }

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
                value={this.props.field.userInput}
                disabled={readOnly || disabled || values.length >= max}/>

              <input style={{display:"none"}} type="text" ref={ref=>this.hiddenInputRef = ref}/>

              {dropdownOpen && (filteredOptions.length || this.props.field.userInput)?
                <div className={`quickfire-dropdown ${classes.options} ${dropdownClass}`} ref={ref=>{this.optionsRef = ref;}}>
                  <InfiniteScroll
                    element={"ul"}
                    className={"dropdown-menu"}
                    threshold={100}
                    hasMore={this.props.field.hasMoreOptions()}
                    loadMore={this.handleLoadMoreOptions}
                    useWindow={false}>
                    {!allowCustomValues && this.props.field.userInput && filteredOptions.length === 0?
                      <MenuItem key={"no-options"} className={"quickfire-dropdown-item"}>
                        <em>No options available for: </em> <strong>{this.props.field.userInput}</strong>
                      </MenuItem>
                      :null}

                    {allowCustomValues && this.props.field.userInput?
                      <MenuItem className={"quickfire-dropdown-item"} key={this.props.field.userInput} onSelect={this.handleSelect.bind(this, this.props.field.userInput)}>
                        <div tabIndex={-1} className="option" onKeyDown={this.handleSelect.bind(this, this.props.field.userInput)}>
                          <em>Add a value: </em> <strong>{this.props.field.userInput}</strong>
                        </div>
                      </MenuItem>
                      :null}
                    {filteredOptions.map(option => {
                      return(
                        <MenuItem className={"quickfire-dropdown-item"} key={formStore.getGeneratedKey(option, "quickfire-dropdown-list-item")} onSelect={this.handleSelect.bind(this, option)}>
                          <div tabIndex={-1} className="option" onKeyDown={this.handleSelect.bind(this, option)}>
                            {option[mappingLabel]}
                            <div className={classes.preview} title="preview" onClick={this.handleOptionPreview.bind(this, option[mappingValue], option[mappingLabel])}>
                              <FontAwesomeIcon icon="eye" />
                            </div>
                          </div>
                        </MenuItem>
                      );
                    })}
                    {this.props.field.fetchingOptions?
                      <MenuItem className={"quickfire-dropdown-item quickfire-dropdown-item-loading"} key={"loading options"}>
                        <div tabIndex={-1} className="option">
                          <FontAwesomeIcon spin icon="circle-notch"/>
                        </div>
                      </MenuItem>
                      :null}
                  </InfiniteScroll>
                </div>
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