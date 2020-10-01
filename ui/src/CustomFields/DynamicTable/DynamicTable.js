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
import injectStyles from "react-jss";
import { FormGroup, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Button} from "react-bootstrap";
import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";

import FieldError from "../FieldError";
import Dropdown from "../../Components/DynamicDropdown/Dropdown";
import Table from "./Table";

import appStore from "../../Stores/AppStore";
import { ViewContext, PaneContext } from "../../Stores/ViewStore";

const styles = {
  container: {
    position: "relative"
  },
  field: {
    marginBottom: "0"
  },
  table: {
    border: "1px solid #ccc",
    paddingTop: "10px",
    marginBottom: "15px",
    "&.disabled": {
      background: "rgb(238, 238, 238)",
      color: "rgb(85,85,85)"
    },
    "& .form-control": {
      paddingLeft: "9px"
    }
  },
  dropdownContainer:{
    height:"auto",
    borderRadius: "0",
    borderLeft: "0",
    borderRight: "0",
    borderBottom: "0",
    paddingTop: "4px",
    paddingBottom: "1px",
    position:"relative",
    "& input.quickfire-user-input":{
      width: "100%",
      maxWidth: "unset"
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
  },
  deleteBtn: {
    float: "right",
    marginRight: "9px"
  }
};

@inject("formStore")
@injectStyles(styles)
@observer
class DynamicTableWithContext extends React.Component {
  
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

  handleDropdownReset = () => {
    this.props.field.resetOptionsSearch();
    appStore.togglePreviewInstance();
    this.triggerOnChange();
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
    appStore.togglePreviewInstance();
    this.triggerOnChange();
  }

  handleOnAddValue = id => {
    const { field } = this.props;
    const value = {[field.mappingValue]: id};
    field.addValue(value);
    this.triggerOnChange();
  }

  handleDelete = id => e => {
    e.stopPropagation();
    this.props.field.removeValue({[this.props.field.mappingValue]: id});
    appStore.togglePreviewInstance();
    this.triggerOnChange();
  }

  handleDeleteAll = () => {
    this.props.field.removeAllValues();
    appStore.togglePreviewInstance();
    this.triggerOnChange();
  }

  handleOptionPreview = (id, name) => {
    const options = { showEmptyFields:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    appStore.togglePreviewInstance(id, name, options);
  }

  handleSearchOptions = term => {
    this.props.field.searchOptions(term);
  }

  handleLoadMoreOptions = () => {
    this.props.field.loadMoreOptions();
  }

  handleRowDelete = index => {
    const { field } = this.props;
    const { value: values } = field;
    const value = values[index];
    field.removeValue(value);
    appStore.togglePreviewInstance();
    this.triggerOnChange();
  }

  handleRowClick = index => {
    const { field, view, pane } = this.props;
    if (view && pane) {
      const { value: values } = field;
      const value = values[index];
      const id = value[field.mappingValue];
      if (id) {
        field.showLink(id);
        view.resetInstanceHighlight();
        view.setCurrentInstanceId(pane, id);
        view.selectPane(view.currentInstanceIdPane);
      }
    }
  }

  handleRowMouseOver = index => {
    const { field, view } = this.props;
    if (view) {
      const { value: values } = field;
      const value = values[index];
      const id = value[field.mappingValue];
      if (id && field.isLinkVisible(id)) {
        view.setInstanceHighlight(id, field.label);
      }
    }
  }

  handleRowMouseOut = () => {
    const { view } = this.props;
    if (view) {
      view.resetInstanceHighlight();
    }
  }

  render() {
    const { classes, formStore, field } = this.props;
    const {
      instanceId,
      links,
      label,
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

    const fieldLabel = label.toLowerCase();
    const isReadOnly = formStore.readMode || readMode || readOnly || disabled;
    const canAddValues =  !isReadOnly && links.length < max;
    
    return (
      <FieldError id={instanceId} field={field}>
        <div className={classes.container}>
          <div>
            <FormGroup
              onClick={this.handleFocus}
              className={`quickfire-field-dropdown-select ${!links.length? "quickfire-empty-field": ""}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""} ${classes.field}`}
              validationState={validationState}>
              <FieldLabel field={field}/>
              {!isReadOnly && (
                <div className={classes.deleteBtn}>
                  <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleDeleteAll} disabled={links.length === 0}>
                    <FontAwesomeIcon icon="times"/>
                  </Button>
                </div>
              )}
              <div className={`${classes.table} ${((readOnly || disabled) && !(formStore.readMode || readMode))?"disabled":""}`}>
                <Table
                  list={links}
                  readOnly={isReadOnly}
                  onRowDelete={this.handleRowDelete}
                  onRowClick={this.handleRowClick}
                  onRowMouseOver={this.handleRowMouseOver}
                  onRowMouseOut={this.handleRowMouseOut}
                />
                {canAddValues && (
                  <div className={`form-control ${classes.dropdownContainer}`}>
                    <Dropdown
                      searchTerm={optionsSearchTerm}
                      options={options}
                      types={(allowCustomValues && optionsTypes.length && optionsSearchTerm)?optionsTypes:[]}
                      externalTypes={(allowCustomValues && optionsExternalTypes.length && optionsSearchTerm)?optionsExternalTypes:[]}
                      loading={fetchingOptions}
                      hasMore={hasMoreOptions}
                      inputPlaceholder={`type to add a ${fieldLabel}`}
                      onSearch={this.handleSearchOptions}
                      onLoadMore={this.handleLoadMoreOptions}
                      onReset={this.handleDropdownReset}
                      onAddValue={this.handleOnAddValue}
                      onAddNewValue={this.handleOnAddNewValue}
                      onPreview={this.handleOptionPreview}
                    />
                    <input style={{display:"none"}} type="text" ref={ref=>this.hiddenInputRef = ref}/>
                  </div>
                )}
              </div>
              {validationErrors && (
                <Alert bsStyle="danger">
                  {validationErrors.map(error => <p key={error}>{error}</p>)}
                </Alert>
              )}
              {!links.length && (
                <div className={classes.emptyMessage}>
                  <span className={classes.emptyMessageLabel}>
                    No {fieldLabel} available
                  </span>
                </div>
              )}
            </FormGroup>
          </div>
        </div>
      </FieldError>
    );
  }
}

class DynamicTable extends React.Component { // because Quickfire request class
  render() {
    return (
     <ViewContext.Consumer>
       {view => (
         <PaneContext.Consumer>
           {pane => (
             <DynamicTableWithContext view={view} pane={pane} {...this.props} />
           )}
         </PaneContext.Consumer> 
       )}
     </ViewContext.Consumer> 
    );
  }
 }
 
export default DynamicTable;