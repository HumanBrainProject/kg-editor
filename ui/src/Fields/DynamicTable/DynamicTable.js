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
import injectStyles from "react-jss";
import _  from "lodash-uuid";
import { ControlLabel, FormGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Button} from "react-bootstrap";

import FieldError from "../FieldError";
import Dropdown from "../../Components/DynamicDropdown/Dropdown";
import Table from "./Table";

import instancesStore from "../../Stores/InstancesStore";
import typesStore from "../../Stores/TypesStore";

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

@injectStyles(styles)
@observer
class DynamicTableWithContext extends React.Component {
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
        if (fieldStore.isLinkVisible(id)) {
          view.setInstanceHighlight(id, fieldStore.label);
        }
        view.setCurrentInstanceId(pane, id);
        view.selectPane(view.currentInstanceIdPane);
        view.resetInstanceHighlight();
      }, 1000);
    }
    instancesStore.togglePreviewInstance();
  }

  handleOnAddValue = id => {
    const { fieldStore, view, pane } = this.props;
    instancesStore.createInstanceOrGet(id);
    const value = {[fieldStore.mappingValue]: id};
    fieldStore.addValue(value);
    setTimeout(() => {
      if (fieldStore.isLinkVisible(id)) {
        view.setInstanceHighlight(id, fieldStore.label);
      }
      view.setCurrentInstanceId(pane, id);
      view.selectPane(view.currentInstanceIdPane);
      view.resetInstanceHighlight();
    }, 1000);
    instancesStore.togglePreviewInstance();
  }

  handleDelete = id => e => {
    e.stopPropagation();
    this.props.fieldStore.removeValue({[this.props.fieldStore.mappingValue]: id});
    instancesStore.togglePreviewInstance();
  }

  handleDeleteAll = () => {
    this.props.fieldStore.removeAllValues();
    instancesStore.togglePreviewInstance();
  }

  handleOptionPreview = (id, name) => {
    const options = { showEmptyfieldStores:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    instancesStore.togglePreviewInstance(id, name, options);
  }

  handleSearchOptions = term => this.props.fieldStore.searchOptions(term);

  handleLoadMoreOptions = () => this.props.fieldStore.loadMoreOptions();

  handleRowDelete = index => {
    const { fieldStore } = this.props;
    const { value: values } = fieldStore;
    const value = values[index];
    fieldStore.removeValue(value);
    instancesStore.togglePreviewInstance();
  }

  handleRowClick = index => {
    const { fieldStore, view, pane } = this.props;
    if (view && pane) {
      const { value: values } = fieldStore;
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        fieldStore.showLink(id);
        setTimeout(() => {
          view.resetInstanceHighlight();
          view.setCurrentInstanceId(pane, id);
          view.selectPane(view.currentInstanceIdPane);
        }, fieldStore.isLinkVisible(id)?0:1000);
      }
    }
  }

  handleRowMouseOver = index => {
    const { fieldStore, view } = this.props;
    if (view) {
      const { value: values } = fieldStore;
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id && fieldStore.isLinkVisible(id)) {
        view.setInstanceHighlight(id, fieldStore.label);
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
    const { classes, fieldStore, view, readMode } = this.props;
    const {
      instance,
      links,
      label,
      allowCustomValues,
      optionsSearchTerm,
      options,
      optionsTypes,
      optionsExternalTypes,
      hasMoreOptions,
      fetchingOptions,
      returnAsNull
    } = fieldStore;

    const fieldStoreLabel = label.toLowerCase();
    const isDisabled =  readMode || returnAsNull;

    return (
      <FieldError fieldStore={fieldStore}>
        <div className={classes.container}>
          <div>
            <FormGroup
              onClick={this.handleFocus}
              className={`quickfire-fieldStore-dropdown-select ${!links.length? "quickfire-empty-fieldStore": ""}  ${isDisabled? "quickfire-fieldStore-disabled quickfire-fieldStore-readonly": ""} ${classes.fields}`}
            >
              <ControlLabel className={"quickfire-label"}>{label}</ControlLabel>
              {!isDisabled && (
                <div className={classes.deleteBtn}>
                  <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleDeleteAll} disabled={links.length === 0}>
                    <FontAwesomeIcon icon="times"/>
                  </Button>
                </div>
              )}
              <div className={`${classes.table} ${isDisabled?"disabled":""}`}>
                {(view && view.currentInstanceId === instance.id)?
                  <Table
                    list={links}
                    readOnly={isDisabled}
                    enablePointerEvents={true}
                    onRowDelete={this.handleRowDelete}
                    onRowClick={this.handleRowClick}
                    onRowMouseOver={this.handleRowMouseOver}
                    onRowMouseOut={this.handleRowMouseOut}
                  />
                  :
                  <Table
                    list={links}
                    readOnly={isDisabled}
                    enablePointerEvents={false}
                  />
                }
                {!isDisabled && (
                  <div className={`form-control ${classes.dropdownContainer}`}>
                    <Dropdown
                      searchTerm={optionsSearchTerm}
                      options={options}
                      types={(allowCustomValues && optionsTypes.length && optionsSearchTerm)?optionsTypes:[]}
                      externalTypes={(allowCustomValues && optionsExternalTypes.length && optionsSearchTerm)?optionsExternalTypes:[]}
                      loading={fetchingOptions}
                      hasMore={hasMoreOptions}
                      inputPlaceholder={`type to add a ${fieldStoreLabel}`}
                      onSearch={this.handleSearchOptions}
                      onLoadMore={this.handleLoadMoreOptions}
                      onReset={this.handleDropdownReset}
                      onAddValue={this.handleOnAddValue}
                      onAddNewValue={this.handleOnAddNewValue}
                      onPreview={this.handleOptionPreview}
                    />
                  </div>
                )}
              </div>
              {!links.length && (
                <div className={classes.emptyMessage}>
                  <span className={classes.emptyMessageLabel}>
                    No {fieldStoreLabel} available
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