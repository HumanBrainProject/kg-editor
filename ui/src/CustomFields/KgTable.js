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
import injectStyles from "react-jss";
import { Column, Table } from "react-virtualized";
import { FormGroup, MenuItem, Alert } from "react-bootstrap";
import { inject, observer } from "mobx-react";
import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";
import { difference, isFunction, isString, uniq } from "lodash";
import InfiniteScroll from "react-infinite-scroller";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Button} from "react-bootstrap";

import FetchingLoader from "../Components/FetchingLoader";
import instanceStore from "../Stores/InstanceStore";
import FieldError from "./FieldError";

const styles = {
  container: {
    position: "relative"
  },
  kgTable: {
    border: "1px solid #ccc",
    paddingTop: "10px",
    marginBottom: "15px",
    "& .ReactVirtualized__Table__headerTruncatedText": {
      textTransform:"initial",
      fontWeight:"600"
    },
    "& .form-control": {
      paddingLeft: "9px"
    }
  },
  headerRow:{
    borderBottom: "1px solid #e0e0e0"
  },
  evenRow: {
    borderBottom: "1px solid #e0e0e0"
  },
  oddRow: {
    borderBottom: "1px solid #e0e0e0"
  },
  activeRow: {
    cursor: "pointer"
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
  topList:{
    bottom: "100%",
    top: "auto",
    margin: "0 0 2px",
    boxShadow: "none"
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
  },
  kgDropdown: {
    marginBottom: "0"
  },
  userInput:{
    background:"transparent",
    border:"none",
    color:"currentColor",
    outline:"none",
    width:"100%",
    marginBottom:"3px"
  },
  values:{
    height:"auto",
    borderRadius: "0",
    borderLeft: "0",
    borderRight: "0",
    borderBottom: "0",
    paddingTop: "2px",
    paddingBottom: "3px",
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
  emptyMessage: {
    position: "absolute !important",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "1.2em",
    fontWeight: "lighter",
    width:"100%",
    textAlign:"center"
  },
  emptyMessageLabel: {
    paddingLeft: "6px",
    display:"inline-block"
  }
};

@injectStyles(styles)
@inject("formStore")
@observer
export default class KgTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      containerWidth: 0,
      scrollToIndex: -1
    };
  }

  componentDidMount() {
    this.setContainerWidth();
    window.addEventListener("resize", this.setContainerWidth);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.wrapperRef && (prevState.containerWidth !== this.wrapperRef.offsetWidth)) {
      this.setContainerWidth();
    }
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.setContainerWidth);
    this.unlistenClickOutHandler();
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
      // field.setUserInput("");
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
    if (e && e.target && this.dropDownRef) {
      this.closeDropdown();
      return;
    }
    this.props.field.fetchOptions(true);
    this.listenClickOutHandler();
  };

  closeDropdown(){
    this.dropDownRef = null;
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

  async handleSelect(option, e){
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
            const id = await this.props.onAddCustomValue(option, field, this.props.formStore);
            const obj = {};
            obj[field.mappingValue] = id;
            field.addInstance(obj, field.mappingValue);
          }
        } else {
          this.beforeAddValue(option);
          this.triggerOnChange();
          this.setState({scrollToIndex:this.props.field.list.length});
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

  clickOutHandler = e => {
    if(!this.dropDownRef || !this.dropDownRef.contains(e.target)){
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


  beforeAddValue(value){
    const mappingValue = this.props.field.mappingValue;
    if(isFunction(this.props.onBeforeAddValue)){
      this.props.onBeforeAddValue(() => {
        const instance = this.props.field.addInstance(value, mappingValue);
        this.props.field.addValue(instance);
      }, this.props.field, value);
    } else {
      const instance = this.props.field.addInstance(value, mappingValue);
      this.props.field.addValue(instance);
    }
    if(this.props.field.closeDropdownAfterInteraction){
      this.dropDownRef = null;
    }
  }

  beforeRemoveValue(value){
    if(isFunction(this.props.onBeforeRemoveValue)){
      this.props.onBeforeRemoveValue(() => {this.props.field.removeValue(value);}, this.props.field, value);
    } else {
      this.props.field.removeValue(value);
    }
    if(this.props.field.closeDropdownAfterInteraction){
      this.dropDownRef = null;
    }
  }

  handleLoadMoreOptions = () => {
    this.props.field.loadMoreOptions();
  }

  handleOptionPreview = (instanceId, instanceName, event) => {
    event && event.stopPropagation();
    instanceStore.togglePreviewInstance(instanceId, instanceName);
  }

  setContainerWidth = () => {
    if(this.wrapperRef){
      this.setState({containerWidth: this.wrapperRef.offsetWidth});
    }
  }

  onRowClick = ({rowData}) => {
    const { field, onValueClick } = this.props;
    field.showInstance(rowData.id);
    typeof onValueClick === "function" &&
    setTimeout(() => onValueClick(field, rowData), 1000);
  }

  onRowMouseOver = ({index, rowData}) => {
    const { field, onValueMouseEnter } = this.props;
    field.isInstanceVisilbe(index, rowData.id) && typeof onValueMouseEnter === "function" && onValueMouseEnter(field, rowData);
  }

  onRowMouseOut = ({index, rowData}) => {
    const { field, onValueMouseLeave } = this.props;
    field.isInstanceVisilbe(index, rowData.id) && typeof onValueMouseLeave === "function" && onValueMouseLeave(field, rowData);
  }

  _rowClassName = ({index}) => {
    if (index < 0) {
      return this.props.classes.headerRow;
    } else {
      return `${index % 2 === 0 ? this.props.classes.evenRow : this.props.classes.oddRow} ${this.props.field.isInteractive?this.props.classes.activeRow:""}`;
    }
  }

  handleDelete = id => e => {
    const instance = this.props.field.instancesMap.get(id);
    this.handleRemove(instance, e);
    this.props.field.removeInstance(id);
  }

  handleRetry = instance => e => {
    e.stopPropagation();
    this.props.field.fetchInstance(instance);
  }

  lastCellRenderer = props => (
    this.props.field.isInitialized && props.rowData.instance.isFetched?
      <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleDelete(props.rowData.id)} >
        <FontAwesomeIcon icon="times"/>
      </Button>:
      props.rowData.instance.fetchError?
        <Button bsSize={"xsmall"} bsStyle={"danger"} onClick={this.handleRetry(props.rowData.instance)} >
          <FontAwesomeIcon icon="redo-alt"/>
        </Button>:null
  )


  firstCellRenderer = props => (
    props.rowData.instance.fetchError ?
      props.rowData.instance.fetchError:
      props.rowData.instance.isFetched?
        props.cellData:
        this.props.field.isInitialized ?
          <span>
            <FontAwesomeIcon icon="circle-notch" spin/>
            &nbsp; fetching {props.rowData.id}...
          </span>:props.rowData.id
  )

  cellRenderer = index => {
    if(index === 0) {
      return this.firstCellRenderer;
    }
    if(index === this.props.field.columns.length-1 && !(this.props.formStore.readMode || this.props.field.readMode) ) {
      return this.lastCellRenderer;
    }
    return undefined;
  }

  render() {
    const { classes, formStore, field } = this.props;
    const { options, value: values, mappingValue, mappingLabel, listPosition, disabled, readOnly, max, allowCustomValues, validationErrors, validationState } = field;

    const dropdownOpen = (!disabled && !readOnly && values.length < max && this.dropDownRef && this.dropDownRef.contains(document.activeElement));
    const dropdownClass = (dropdownOpen? "open": "") + (listPosition === "top"?" " + classes.topList: "");
    const instanceTypeLabel = field.label.toLowerCase();
    const inputPlaceholder = `type to add a ${instanceTypeLabel}`;
    let filteredOptions = [];
    if(dropdownOpen){
      filteredOptions = difference(options, values);
      filteredOptions = uniq(filteredOptions);
    }

    return (
      <FieldError id={this.props.formStore.structure.fields.id.nexus_id} field={this.props.field}>
        <div ref={ref=>this.wrapperRef = ref} className={classes.container}>
          <div ref={ref=>this.dropDownRef = ref}>
            <FormGroup
              onClick={this.handleFocus}
              className={`quickfire-field-dropdown-select ${!values.length? "quickfire-empty-field": ""}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""} ${classes.kgDropdown}`}
              validationState={validationState}>
              <FieldLabel field={field}/>
              <div className={classes.kgTable}>
                <Table
                  width={this.state.containerWidth}
                  height={300}
                  headerHeight={20}
                  rowHeight={30}
                  rowClassName={this._rowClassName}
                  rowCount={field.list.length}
                  rowGetter={({ index }) => field.list[index]}
                  onRowClick={this.onRowClick}
                  onRowMouseOver={this.onRowMouseOver}
                  onRowMouseOut={this.onRowMouseOut}
                  rowRenderer={this.rowRenderer}
                  scrollToIndex={this.state.scrollToIndex-1}
                >
                  {field.columns.map((col,index) =>{
                    const isLastCell = index === field.columns.length-1;
                    return(
                      <Column
                        label={col.label}
                        dataKey={col.name}
                        key={col.name}
                        flexGrow={isLastCell ? 0:1}
                        flexShrink={isLastCell ? 1:0}
                        width={20}
                        cellRenderer={this.cellRenderer(index)}
                      />
                    );}
                  )}
                </Table>
                {!this.props.formStore.readMode && !this.props.field.readMode &&
                  <div disabled={disabled} readOnly={readOnly} className={`form-control ${classes.values}`}>
                    <input className={`quickfire-user-input ${classes.userInput}`}
                      onDragOver={e=>e.preventDefault()}
                      ref={ref=>this.inputRef=ref} type="text"
                      onKeyDown={this.handleInputKeyStrokes}
                      onChange={this.handleChangeUserInput}
                      onFocus={this.handleFocus}
                      value={this.props.field.userInput}
                      disabled={readOnly || disabled || values.length >= max}
                      placeholder={inputPlaceholder}
                    />

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
                              <em>No {instanceTypeLabel} available for: </em> <strong>{this.props.field.userInput}</strong>
                            </MenuItem>
                            :null}

                          {allowCustomValues && this.props.field.userInput?
                            <MenuItem className={"quickfire-dropdown-item"} key={this.props.field.userInput} onSelect={this.handleSelect.bind(this, this.props.field.userInput)}>
                              <div tabIndex={-1} className="option" onKeyDown={this.handleSelect.bind(this, this.props.field.userInput)}>
                                <em>Add a {instanceTypeLabel}: </em> <strong>{this.props.field.userInput}</strong>
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
                  </div>}
              </div>
              {validationErrors && <Alert bsStyle="danger">
                {validationErrors.map(error => <p key={error}>{error}</p>)}
              </Alert>}
              {!field.list.length &&
            <div className={classes.emptyMessage}>
              <span className={classes.emptyMessageLabel}>
                No {instanceTypeLabel} available
              </span>
            </div>}
            </FormGroup>
          </div>
          {!field.isInitialized && field.list.length > 0 &&
          <FetchingLoader>
            <span>Fetching content...</span>
          </FetchingLoader>}
        </div>
      </FieldError>
    );
  }
}