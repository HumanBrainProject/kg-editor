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

import React, { useRef } from "react";
import { observer } from "mobx-react";
import Form from "react-bootstrap/Form";
import { createUseStyles } from "react-jss";
import _ from "lodash-uuid";

import List from "./List";

import instancesStore from "../../Stores/InstancesStore";
import typesStore from "../../Stores/TypesStore";

import Dropdown from "../../Components/DynamicDropdown/Dropdown";
import LinksAlternatives from "../LinksAlternatives";
import Label from "../Label";


const useStyles = createUseStyles({
  values:{
    height:"auto",
    paddingBottom:"3px",
    position:"relative",
    minHeight: "34px",
    "&[disabled]": {
      backgroundColor: "#e9ecef",
      pointerEvents:"none"
    }
  },
  label: {},
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
    }
  },
  alternatives: {
    marginLeft: "3px"
  }
});

const DynamicDropdown = observer(({ className, fieldStore, readMode, showIfNoValue, view, pane}) => {

  const classes = useStyles();

  const draggedValue = useRef();
  const formGroupRef = useRef();

  const {
    instance,
    value: values,
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

  const dropValue = droppedValue => {
    fieldStore.moveValueAfter(draggedValue.current, droppedValue);
    draggedValue.current = null;
    instancesStore.togglePreviewInstance();
  };

  const handleDropdownReset = () => {
    fieldStore.resetOptionsSearch();
    instancesStore.togglePreviewInstance();
  };

  const handleOnAddNewValue = (name, typeName) => {
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
  };

  const handleOnAddValue = id => {
    instancesStore.createInstanceOrGet(id);
    const value = {[fieldStore.mappingValue]: id};
    fieldStore.addValue(value);
    setTimeout(() => view.setInstanceHighlight(id, fieldStore.label), 1000);
    instancesStore.togglePreviewInstance();
  };

  const handleSelectAlternative = instances => {
    const values = instances.map(instance => ({[fieldStore.mappingValue]: instance.id}));
    fieldStore.setValues(values);
    instancesStore.togglePreviewInstance();
  };

  const handleRemoveMySuggestion = () => {
    fieldStore.removeAllValues();
    instancesStore.togglePreviewInstance();
  };

  const handleDeleteLastValue = () => {
    fieldStore.removeLastValue();
    instancesStore.togglePreviewInstance();
  };

  const handleClick = index => {
    if (view && pane) {
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        view.resetInstanceHighlight();
        view.setCurrentInstanceId(pane, id);
        view.selectPane(view.currentInstanceIdPane);
      }
    }
  };

  const handleDelete = index => {
    const value = values[index];
    fieldStore.removeValue(value);
    instancesStore.togglePreviewInstance();
  };

  const handleDragEnd = () => draggedValue.current = null;

  const handleDragStart = value => draggedValue.current = value;

  const handleDrop = value => dropValue(value);

  const handleKeyDown = (value, e) => {
    if (e.keyCode === 8) { //User pressed "Backspace" while focus on a value
      e.preventDefault();
      fieldStore.removeValue(value);
      instancesStore.togglePreviewInstance();
    }
  };

  const handleFocus = index => {
    if (view) {
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        view.setInstanceHighlight(id, fieldStore.label);
      }
      instancesStore.togglePreviewInstance();
    }
    fieldStore.resetOptionsSearch();
  };

  const handleBlur = () => {
    if (view) {
      view.resetInstanceHighlight();
    }
  };

  const handleMouseOver = index => {
    if (view) {
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        view.setInstanceHighlight(id, fieldStore.label);
      }
    }
  };

  const handleMouseOut = () => {
    if (view) {
      view.resetInstanceHighlight();
    }
  };

  const handleOptionPreview = (instanceId, instanceName) => {
    const options = { showEmptyFields:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    instancesStore.togglePreviewInstance(instanceId, instanceName, options);
  };

  const handleSearchOptions = term => fieldStore.searchOptions(term);

  const handleLoadMoreOptions = () => fieldStore.loadMoreOptions();

  if(readMode){

    if (!links.length && !showIfNoValue) {
      return null;
    }

    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} />
        {(view && view.currentInstanceId === instance.id)?
          <List
            list={links}
            readOnly={true}
            disabled={false}
            enablePointerEvents={true}
            onClick={handleClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          />
          :
          <List
            list={links}
            readOnly={true}
            disabled={false}
            enablePointerEvents={false}
          />
        }
      </Form.Group>
    );
  }

  const isDisabled = returnAsNull;
  const canAddValues = !isDisabled;
  return (
    <Form.Group className={className} ref={formGroupRef}>
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} />
      <LinksAlternatives
        className={classes.alternatives}
        list={alternatives}
        onSelect={handleSelectAlternative}
        onRemove={handleRemoveMySuggestion}
        mappingValue={mappingValue}
        parentContainerRef={formGroupRef}
      />
      <div className={`form-control ${classes.values}`} disabled={isDisabled} >
        <List
          list={links}
          readOnly={false}
          disabled={isDisabled}
          enablePointerEvents={true}
          onClick={handleClick}
          onDelete={handleDelete}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        />
        {canAddValues && (
          <Dropdown
            searchTerm={optionsSearchTerm}
            options={options}
            types={(allowCustomValues && optionsTypes.length && optionsSearchTerm)?optionsTypes:[]}
            externalTypes={(allowCustomValues && optionsExternalTypes.length && optionsSearchTerm)?optionsExternalTypes:[]}
            loading={fetchingOptions}
            hasMore={hasMoreOptions}
            onSearch={handleSearchOptions}
            onLoadMore={handleLoadMoreOptions}
            onReset={handleDropdownReset}
            onAddValue={handleOnAddValue}
            onAddNewValue={handleOnAddNewValue}
            onDeleteLastValue={handleDeleteLastValue}
            onDrop={dropValue}
            onPreview={handleOptionPreview}
          />
        )}
      </div>
    </Form.Group>
  );
});

export default DynamicDropdown;