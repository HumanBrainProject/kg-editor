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
import { observer } from "mobx-react";
import { FormGroup } from "react-bootstrap";
import injectStyles from "react-jss";
import _  from "lodash-uuid";

import List from "./List";

import instancesStore from "../../Stores/InstancesStore";
import typesStore from "../../Stores/TypesStore";
import { ViewContext, PaneContext } from "../../Stores/ViewStore";

import Dropdown from "../../Components/DynamicDropdown/Dropdown";
import LinksAlternatives from "../LinksAlternatives";
import Label from "../Label";


const styles = {
  values:{
    height:"auto",
    paddingBottom:"3px",
    position:"relative",
    minHeight: "34px",
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
      content: "';\\00a0'"
    }
  },
  alternatives: {
    marginLeft: "3px"
  }
};

@injectStyles(styles)
@observer
class DynamicDropdownWithContext extends React.Component {
  dropValue(droppedValue) {
    this.props.fieldStore.moveValueAfter(this.draggedValue, droppedValue);
    this.draggedValue = null;
    instancesStore.togglePreviewInstance();
  }

  handleDropdownReset = () => {
    this.props.fieldStore.resetOptionsSearch();
    instancesStore.togglePreviewInstance();
  }

  handleOnAddNewValue = (name, typeName) => {
    const { fieldStore, view, pane } = this.props;
    if (fieldStore.allowCustomValues) {
      const id = _.uuid();
      const type = typesStore.typesMap.get(typeName);
      instancesStore.createNewInstance(type, id, name);
      const value = {[fieldStore.mappingValue]: id};
      fieldStore.addValue(value);
      setTimeout(() => {
        view.setInstanceHighlight(id, fieldStore.label);
        view.setCurrentInstanceId(pane, id);
        view.selectPane(view.currentInstanceIdPane);
        view.resetInstanceHighlight();
      }, 1000);
    }
    instancesStore.togglePreviewInstance();
  }

  handleOnAddValue = id => {
    const { fieldStore, view } = this.props;
    instancesStore.createInstanceOrGet(id);
    const value = {[fieldStore.mappingValue]: id};
    fieldStore.addValue(value);
    setTimeout(() => view.setInstanceHighlight(id, fieldStore.label), 1000);
    instancesStore.togglePreviewInstance();
  }

  handleSelectAlternative = instances => {
    const { fieldStore } = this.props;
    const values = instances.map(instance => ({[fieldStore.mappingValue]: instance.id}));
    this.props.fieldStore.setValues(values);
    instancesStore.togglePreviewInstance();
  }

  handleRemoveMySuggestion = () => {
    this.props.fieldStore.removeAllValues();
    instancesStore.togglePreviewInstance();
  }

  handleDeleteLastValue = () => {
    this.props.fieldStore.removeLastValue();
    instancesStore.togglePreviewInstance();
  }

  handleClick = index => {
    const { fieldStore, view, pane } = this.props;
    if (view && pane) {
      const { value: values } = fieldStore;
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        view.resetInstanceHighlight();
        view.setCurrentInstanceId(pane, id);
        view.selectPane(view.currentInstanceIdPane);
      }
    }
  };

  handleDelete = index => {
    const { fieldStore } = this.props;
    const { value: values } = fieldStore;
    const value = values[index];
    fieldStore.removeValue(value);
    instancesStore.togglePreviewInstance();
  };

  handleDragEnd = () => this.draggedValue = null;

  handleDragStart = value => this.draggedValue = value;

  handleDrop = value => this.dropValue(value);

  handleKeyDown = (value, e) => {
    if (e.keyCode === 8) { //User pressed "Backspace" while focus on a value
      e.preventDefault();
      this.props.fieldStore.removeValue(value);
      instancesStore.togglePreviewInstance();
    }
  }

  handleFocus = index => {
    const { fieldStore, view } = this.props;
    if (view) {
      const { value: values } = fieldStore;
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        view.setInstanceHighlight(id, fieldStore.label);
      }
      instancesStore.togglePreviewInstance();
    }
    fieldStore.resetOptionsSearch();
  };

  handleBlur = () => {
    const { view } = this.props;
    if (view) {
      view.resetInstanceHighlight();
    }
  };

  handleMouseOver = index => {
    const { fieldStore, view } = this.props;
    if (view) {
      const { value: values } = fieldStore;
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        view.setInstanceHighlight(id, fieldStore.label);
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
    instancesStore.togglePreviewInstance(instanceId, instanceName, options);
  }

  handleSearchOptions = term => this.props.fieldStore.searchOptions(term);

  handleLoadMoreOptions = () => this.props.fieldStore.loadMoreOptions();

  renderReadMode(){
    const { classes, className, fieldStore, view } = this.props;
    const { label, labelTooltip, instanceId, links } = fieldStore;
    return (
      <div className={className}>
        <div className={`quickfire-field-dropdown-select ${!links.length? "quickfire-empty-field":""} quickfire-readmode ${classes.readMode}  quickfire-field-readonly`}>
          <Label label={label} labelTooltip={labelTooltip} />
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
      </div>
    );
  }

  render() {
    const { classes, className, fieldStore, readMode } = this.props;
    const {
      links,
      label,
      labelTooltip,
      mappingValue,
      allowCustomValues,
      optionsSearchTerm,
      options,
      optionsTypes,
      optionsExternalTypes,
      hasMoreOptions,
      fetchingOptions,
      alternatives,
      returnAsNull
    } = fieldStore;

    if(readMode){
      return this.renderReadMode();
    }

    const isDisabled = returnAsNull;
    const canAddValues = !isDisabled;
    return (
      <div className={className}>
        <FormGroup
          ref={ref=>this.formGroupRef = ref}
          className={`quickfire-field-dropdown-select ${!links.length? "quickfire-empty-field": ""}  ${isDisabled? "quickfire-field-disabled quickfire-field-readonly": ""}`}
        >
          <Label label={label} labelTooltip={labelTooltip} />
          <LinksAlternatives
            className={classes.alternatives}
            list={alternatives}
            onSelect={this.handleSelectAlternative}
            onRemove={this.handleRemoveMySuggestion}
            mappingValue={mappingValue}
            parentContainerClassName="form-group"
          />
          <div className={`form-control ${classes.values}`} disabled={isDisabled} >
            <List
              list={links}
              readOnly={false}
              disabled={isDisabled}
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
        </FormGroup>
      </div>
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