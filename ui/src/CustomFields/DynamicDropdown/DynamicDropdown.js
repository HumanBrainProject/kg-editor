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
import { FormGroup, Alert } from "react-bootstrap";
import injectStyles from "react-jss";
import _  from "lodash-uuid";
import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";

import FieldError from "../FieldError";
import List from "./List";

import instanceStore from "../../Stores/InstanceStore";
import typesStore from "../../Stores/TypesStore";
import { ViewContext, PaneContext } from "../../Stores/ViewStore";

import Dropdown from "../../Components/DynamicDropdown/Dropdown";
import LinksAlternatives from "../LinksAlternatives";

const styles = {
  values:{
    height:"auto",
    paddingBottom:"3px",
    position:"relative",
    "& .btn":{
      marginRight:"3px",
      marginBottom:"3px"
    },
    "&:disabled":{
      pointerEvents:"none",
      display: "none !important"
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
class DynamicDropdownWithContext extends React.Component {
  dropValue(droppedValue) {
    this.props.field.moveValueAfter(this.draggedValue, droppedValue);
    this.draggedValue = null;
    instanceStore.togglePreviewInstance();
  }

  handleDropdownReset = () => {
    this.props.field.resetOptionsSearch();
    instanceStore.togglePreviewInstance();
  }

  handleOnAddNewValue = (name, typeName) => {
    const {field, onAddCustomValue} = this.props;
    if (field.allowCustomValues) {
      const id = _.uuid();
      const type = typesStore.typesMap.get(typeName);
      instanceStore.createNewInstance(type, id, name);
      const value = {[field.mappingValue]: id};
      field.addValue(value);
      onAddCustomValue(value, type, field);
    }
    instanceStore.togglePreviewInstance();
  }

  handleOnAddValue = id => {
    const { field } = this.props;
    instanceStore.createInstanceOrGet(id);
    const value = {[field.mappingValue]: id};
    field.addValue(value);
  }

  handleSelectAlternative = values => {
    this.props.field.setValues(values);
    instanceStore.togglePreviewInstance();
  }

  handleRemoveMySuggestion = () => {
    //let field = this.props.field.removeAllValues();
    this.props.field.removeAllValues();
    instanceStore.togglePreviewInstance();
  }

  handleDeleteLastValue = () => {
    this.props.field.removeLastValue();
    instanceStore.togglePreviewInstance();
  }

  handleClick = index => {
    const { field, view, pane } = this.props;
    if (view && pane) {
      const { value: values } = field;
      const value = values[index];
      const id = value[field.mappingValue];
      if (id) {
        view.resetInstanceHighlight();
        view.setCurrentInstanceId(pane, id);
        view.selectPane(view.currentInstanceIdPane);
      }
    }
  };

  handleDelete = index => {
    const { field } = this.props;
    const { value: values } = field;
    const value = values[index];
    field.removeValue(value);
    instanceStore.togglePreviewInstance();
  };

  handleDragEnd = () => this.draggedValue = null;

  handleDragStart = value => this.draggedValue = value;

  handleDrop = value => this.dropValue(value);

  handleKeyDown = (value, e) => {
    if (e.keyCode === 8) { //User pressed "Backspace" while focus on a value
      e.preventDefault();
      this.props.field.removeValue(value);
      instanceStore.togglePreviewInstance();
    }
  }

  handleFocus = index => {
    const { field, view } = this.props;
    if (view) {
      const { value: values } = field;
      const value = values[index];
      const id = value[field.mappingValue];
      view.setInstanceHighlight(id, field.label);
      instanceStore.togglePreviewInstance();
    }
    field.resetOptionsSearch();
  };

  handleBlur = () => {
    const { view } = this.props;
    if (view) {
      view.resetInstanceHighlight();
    }
  };

  handleMouseOver = index => {
    const { field, view } = this.props;
    if (view) {
      const { value: values } = field;
      const value = values[index];
      const id = value[field.mappingValue];
      if (id) {
        view.setInstanceHighlight(id, field.label);
      }
    }
  };

  handleMouseOut = () => {
    const { view } = this.props;
    if (view) {
      view.resetInstanceHighlight();
    }
  };

  handleOptionPreview = (instanceId, instanceName) => {
    const options = { showEmptyFields:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    instanceStore.togglePreviewInstance(instanceId, instanceName, options);
  }

  handleSearchOptions = term => this.props.field.searchOptions(term);

  handleLoadMoreOptions = () => this.props.field.loadMoreOptions();

  renderReadMode(){
    const { classes, field, view } = this.props;
    const { instanceId, links, disabled, readOnly } = field;
    return (
      <FieldError id={instanceId} field={field}>
        <div className={`quickfire-field-dropdown-select ${!links.length? "quickfire-empty-field":""} quickfire-readmode ${classes.readMode}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}>
          <FieldLabel field={field}/>
          {(view && view.currentInstanceId === instanceId)?
            <List
              list={links}
              readOnly={true}
              disabled={false}
              enablePointerEvents={true}
              onClick={this.handleClick}
              onMouseOver={this.handleMouseOver}
              onMouseOut={this.handleMouseOut}
            />
            :
            <List
              list={links}
              readOnly={true}
              disabled={false}
              enablePointerEvents={false}
            />
          }
        </div>
      </FieldError>
    );
  }

  render() {
    const { classes, formStore, field } = this.props;
    const {
      instanceId,
      links,
      disabled,
      readOnly,
      readMode,
      max,
      mappingValue,
      allowCustomValues,
      validationErrors,
      validationState,
      optionsSearchTerm,
      options,
      optionsTypes,
      optionsExternalTypes,
      hasMoreOptions,
      fetchingOptions,
      alternatives
    } = field;

    if(formStore.readMode || readMode){
      return this.renderReadMode();
    }

    const selectedInstance = instanceStore.instances.get(instanceId);
    const isAlternativeDisabled = !selectedInstance;
    const isDisabled = formStore.readMode || readMode || readOnly || disabled;
    const canAddValues = !isDisabled && links.length < max;

    return (
      <FieldError id={instanceId} field={field}>
        <div>
          <FormGroup
            ref={ref=>this.formGroupRef = ref}
            className={`quickfire-field-dropdown-select ${!links.length? "quickfire-empty-field": ""}  ${disabled || readOnly? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}
            validationState={validationState}>
            <FieldLabel field={field}/>
            <LinksAlternatives
              className={classes.alternatives}
              show={!disabled && !readOnly && !!alternatives.length}
              disabled={disabled || readOnly || isAlternativeDisabled}
              list={alternatives}
              onSelect={this.handleSelectAlternative}
              onRemove={this.handleRemoveMySuggestion}
              mappingValue={mappingValue}
              parentContainerClassName="form-group"
              // formGroupRef={this.formGroupRef}
            />
            <div className={`form-control ${classes.values}`} disabled={disabled} readOnly={readOnly} >
              <List
                list={links}
                readOnly={false}
                disabled={disabled}
                enablePointerEvents={true}
                onClick={this.handleClick}
                onDelete={this.handleDelete}
                onDragEnd={this.handleDragEnd}
                onDragStart={this.handleDragStart}
                onDrop={this.handleDrop}
                onKeyDown={this.handleKeyDown}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
              />
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

class DynamicDropdown extends React.Component { // because Quickfire request class
  render() {
    return (
      <ViewContext.Consumer>
        {view => (
          <PaneContext.Consumer>
            {pane => (
              <DynamicDropdownWithContext view={view} pane={pane} {...this.props} />
            )}
          </PaneContext.Consumer>
        )}
      </ViewContext.Consumer>
    );
  }
}

export default DynamicDropdown;