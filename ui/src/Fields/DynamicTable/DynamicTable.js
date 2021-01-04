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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import _  from "lodash-uuid";
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

import { useStores } from "../../Hooks/UseStores";

import Dropdown from "../../Components/DynamicDropdown/Dropdown";
import Table from "./Table";
import Label from "../Label";

const useStyles = createUseStyles({
  container: {
    position: "relative"
  },
  field: {
    marginBottom: "0"
  },
  table: {
    border: "1px solid var(--border-color-ui-contrast2)",
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
    position:"relative"
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
    marginRight: "9px",
    "& .btn": {
      padding: "1px 6px 1px 6px"
    }
  },
  label: {},
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
    }
  }
});

const DynamicTable = observer(({ className, fieldStore, view, pane, readMode, showIfNoValue}) => {

  const classes = useStyles();

  const { typeStore, instanceStore } = useStores();

  const {
    instance,
    links,
    label,
    labelTooltip,
    labelTooltipIcon,
    allowCustomValues,
    optionsSearchTerm,
    options,
    optionsTypes,
    optionsExternalTypes,
    hasMoreOptions,
    fetchingOptions,
    returnAsNull
  } = fieldStore;

  const handleDropdownReset = () => {
    fieldStore.resetOptionsSearch();
    instanceStore.togglePreviewInstance();
  };

  const handleOnAddNewValue = (name, typeName) => {
    if (fieldStore.allowCustomValues) {
      const id = _.uuid();
      const type = typeStore.typesMap.get(typeName);
      instanceStore.createNewInstance(type, id, name);
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
    instanceStore.togglePreviewInstance();
  };

  const handleOnAddValue = id => {
    instanceStore.createInstanceOrGet(id);
    const value = {[fieldStore.mappingValue]: id};
    fieldStore.addValue(value);
    setTimeout(() => {
      if (fieldStore.isLinkVisible(id)) {
        view.setInstanceHighlight(id, fieldStore.label);
      }
    }, 1000);
    instanceStore.togglePreviewInstance();
  };

  const handleDeleteAll = () => {
    fieldStore.setValues([]);
    instanceStore.togglePreviewInstance();
  };

  const handleOptionPreview = (id, name) => {
    const options = { showEmptyfieldStores:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    instanceStore.togglePreviewInstance(id, name, options);
  };

  const handleSearchOptions = term => fieldStore.searchOptions(term);

  const handleLoadMoreOptions = () => fieldStore.loadMoreOptions();

  const handleRowDelete = index => {
    const { value: values } = fieldStore;
    const value = values[index];
    fieldStore.removeValue(value);
    instanceStore.togglePreviewInstance();
  };

  const handleRowClick = index => {
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
  };

  const handleRowMouseOver = index => {
    if (view) {
      const { value: values } = fieldStore;
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id && fieldStore.isLinkVisible(id)) {
        view.setInstanceHighlight(id, fieldStore.label);
      }
    }
  };

  const handleRowMouseOut = () => {
    if (view) {
      view.resetInstanceHighlight();
    }
  };

  const fieldStoreLabel = label.toLowerCase();
  const isDisabled =  readMode || returnAsNull;

  if (readMode && !links.length && !showIfNoValue) {
    return null;
  }

  return (
    <Form.Group className={`${classes.container} ${readMode?classes.readMode:""} ${className}`}>
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon}/>
      {!isDisabled && (view && view.currentInstanceId === instance.id) && (
        <div className={classes.deleteBtn}>
          <Button size="small" variant={"primary"} onClick={handleDeleteAll} disabled={links.length === 0}>
            <FontAwesomeIcon icon="times"/>
          </Button>
        </div>
      )}
      <div className={`${classes.table} ${returnAsNull?"disabled":""}`}>
        {(view && view.currentInstanceId === instance.id)?
          <Table
            list={links}
            fieldStore={fieldStore}
            readOnly={isDisabled}
            enablePointerEvents={true}
            onRowDelete={handleRowDelete}
            onRowClick={handleRowClick}
            onRowMouseOver={handleRowMouseOver}
            onRowMouseOut={handleRowMouseOut}
          />
          :
          <Table
            list={links}
            fieldStore={fieldStore}
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
              onSearch={handleSearchOptions}
              onLoadMore={handleLoadMoreOptions}
              onReset={handleDropdownReset}
              onAddValue={handleOnAddValue}
              onAddNewValue={handleOnAddNewValue}
              onPreview={handleOptionPreview}
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
    </Form.Group>
  );
});
DynamicTable.displayName = "DynamicTable";

export default DynamicTable;