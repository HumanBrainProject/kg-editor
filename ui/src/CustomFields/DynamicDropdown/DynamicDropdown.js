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
import injectStyles from "react-jss";
import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";

import FieldError from "../FieldError";
import Alternatives from "../Alternatives";

import appStore from "../../Stores/AppStore";
import instanceStore from "../../Stores/InstanceStore";

import Dropdown from "../../Components/DynamicDropdown/Dropdown";

const styles = {
  values:{
    height:"auto",
    paddingBottom:"3px",
    position:"relative",
    "& .btn":{
      marginRight:"3px",
      marginBottom:"3px"
    },
    "&:disabled $remove, &[disabled] $remove, &.disabled $remove, & :disabled $remove, & [disabled] $remove, & .disabled $remove, &[readonly] $remove, &:disabled $remove, & [readonly] $remove, & :disabled $remove":{
      pointerEvents:"none",
      display: "none !important"
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
class DynamicDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alternatives: []
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

  handleDropdownReset = () => {
    appStore.togglePreviewInstance();
    this.props.field.resetOptionsSearch();
  }

  handleOnAddNewValue = (value, type) => {
    const {field, onAddCustomValue} = this.props;
    onAddCustomValue(value, type, field);
    field.resetOptionsSearch();
    this.triggerOnChange();
  }

  handleOnAddValue = id => {
    const {field} = this.props;
    field.addValue({[field.mappingValue]: id});
    field.resetOptionsSearch();
    this.triggerOnChange();
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
    }
  }

  handleAlternativeSelect = values => {
    const field = this.props.field;
    field.value.map(value => value).forEach(value => this.beforeRemoveValue(value));
    values.forEach(value => field.addValue(value));
    this.triggerOnChange();
    field.resetOptionsSearch();
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

  handleDeleteLastValue = () => {
    const field = this.props.field;
    if(field.disabled || field.readOnly || !field.value.length){
      return;
    }
    this.beforeRemoveValue(field.value[field.value.length-1]);
    this.triggerOnChange();
  }

  handleDrop(droppedVal, e){
    let field = this.props.field;
    if(field.disabled || field.readOnly){
      return;
    }
    e.preventDefault();
    this.dropValue(droppedVal);
  }

  dropValue(droppedVal){
    const field = this.props.field;
    if(field.disabled || field.readOnly){
      return;
    }
    field.removeValue(this.draggedValue);
    field.addValue(this.draggedValue, field.value.indexOf(droppedVal));
    this.triggerOnChange();
    appStore.togglePreviewInstance();
    field.resetOptionsSearch();
  }

  componentDidMount(){
    this.getAlternatives();
  }

  componentDidUpdate(prevProps){
    if (this.props.formStore && this.props.formStore.structure && (!prevProps.formStore || !prevProps.formStore.structure || (JSON.stringify(toJS(this.props.formStore.structure.alternatives)) !== JSON.stringify(toJS(prevProps.formStore.structure.alternatives))))) {
      this.getAlternatives();
    }
  }

  beforeRemoveValue(value){
    this.props.field.removeValue(value);
    appStore.togglePreviewInstance();
    this.props.field.resetOptionsSearch();
  }

  handleTagInteraction(interaction, value, event){
    const onInteraction = this.props[`onValue${interaction}`];
    if(isFunction(onInteraction)){
      onInteraction(this.props.field, value, event);
    } else if(interaction === "Focus"){
      event.stopPropagation();
      appStore.togglePreviewInstance();
      this.props.field.resetOptionsSearch();
    }
  }

  handleOptionPreview = (instanceId, instanceName) => {
    const options = { showEmptyFields:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    appStore.togglePreviewInstance(instanceId, instanceName, options);
  }

  handleSearchOptions = term => {
    this.props.field.searchOptions(term);
  }

  handleLoadMoreOptions = () => {
    this.props.field.loadMoreOptions();
  }

  valueLabelRendering = (field, value) => {
    return field.valueLabelRendering(field, value, this.props.valueLabelRendering);
  }

  renderReadMode(){
    const { classes, field, readModeRendering } = this.props;
    const { instanceId, value, disabled, readOnly } = field;
    return (
      <FieldError id={instanceId} field={field}>
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
    const { classes, formStore, field } = this.props;
    const {
      instanceId,
      value: values,
      fullyQualifiedName,
      mappingLabel,
      disabled,
      readOnly,
      readMode,
      max,
      allowCustomValues,
      validationErrors,
      validationState,
      optionsSearchTerm,
      options,
      optionsTypes,
      optionsExternalTypes,
      hasMoreOptions,
      fetchingOptions
    } = field;

    if(formStore.readMode || readMode){
      return this.renderReadMode();
    }

    const selectedInstance = instanceStore.instances.get(instanceId);
    const isAlternativeDisabled = !selectedInstance || selectedInstance.fieldsToSetAsNull.includes(fullyQualifiedName);
    const isDisabled = formStore.readMode || readMode || readOnly || disabled;
    const canAddValues = !isDisabled && values.length < max;

    return (
      <FieldError id={instanceId} field={field}>
        <div>
          <FormGroup
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
            <div className={`form-control ${classes.values}`} disabled={disabled} readOnly={readOnly} >
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
                  <Glyphicon className={`quickfire-remove ${classes.remove}`} glyph="remove" onClick={this.handleRemove.bind(this, value)}/>
                </div>
              ))}
              {canAddValues && (
                <React.Fragment>
                  <Dropdown
                    searchTerm={optionsSearchTerm}
                    options={options}
                    types={(allowCustomValues && optionsTypes.length && optionsSearchTerm)?optionsTypes:[]}
                    externalTypes={(allowCustomValues && optionsExternalTypes.length && optionsSearchTerm)?optionsExternalTypes:[]}
                    loading={fetchingOptions}
                    hasMore={hasMoreOptions}
                    onSearch={this.handleSearchOptions}
                    onLoadMore={this.handleLoadMoreOptions}
                    onReset={this.handleDropdownReset}
                    onAddValue={this.handleOnAddValue}
                    onAddNewValue={this.handleOnAddNewValue}
                    onDeleteLastValue={this.handleDeleteLastValue}
                    onDrop={this.dropValue}
                    onPreview={this.handleOptionPreview}
                  />
                  <input style={{ display: "none" }} type="text" ref={ref => this.hiddenInputRef = ref} />
                </React.Fragment>
              )}
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

export default DynamicDropdown;