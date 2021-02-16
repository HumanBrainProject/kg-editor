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
import { observer } from "mobx-react-lite";
import Form from "react-bootstrap/Form";
import { createUseStyles } from "react-jss";
import _ from "lodash-uuid";

import { useStores } from "../../Hooks/UseStores";

import Dropdown from "../../Components/DynamicDropdown/Dropdown";
import LinksAlternatives from "../LinksAlternatives";
import Label from "../Label";
import Invalid from "../Invalid";

import List from "./List";

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
  },
  warning: {
    borderColor: "var(--ft-color-warn)"
  }
});

const DynamicDropdown = observer(({ className, fieldStore, readMode, showIfNoValue, view, pane}) => {

  const classes = useStyles();

  const { typeStore, instanceStore } = useStores();

  const draggedValue = useRef();
  const formGroupRef = useRef();

  const {
    instance,
    value: values,
    links,
    label,
    labelTooltip,
    labelTooltipIcon,
    globalLabelTooltip,
    globalLabelTooltipIcon,
    mappingValue,
    allowCustomValues,
    optionsSearchTerm,
    options,
    optionsTypes,
    optionsExternalTypes,
    hasMoreOptions,
    fetchingOptions,
    alternatives,
    returnAsNull,
    isRequired
  } = fieldStore;

  const dropValue = droppedValue => {
    fieldStore.moveValueAfter(draggedValue.current, droppedValue);
    draggedValue.current = null;
    instanceStore.togglePreviewInstance();
  };

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
        view.setInstanceHighlight(id, fieldStore.label);
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
    setTimeout(() => view.setInstanceHighlight(id, fieldStore.label), 1000);
    instanceStore.togglePreviewInstance();
  };

  const handleSelectAlternative = value => {
    const values = value.map(v => ({[fieldStore.mappingValue]: v.id}));
    fieldStore.setValues(values);
    instanceStore.togglePreviewInstance();
  };

  const handleRemoveMySuggestion = () => {
    fieldStore.removeAllValues();
    instanceStore.togglePreviewInstance();
  };

  const handleDeleteLastValue = () => {
    fieldStore.removeLastValue();
    instanceStore.togglePreviewInstance();
  };

  const handleClick = index => {
    if (view && pane) {
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        view.resetInstanceHighlight();
        const _pane = view.currentInstanceIdPane;
        view.selectPane(_pane);
        view.setCurrentInstanceId(_pane, id);
      }
    }
  };

  const handleDelete = index => {
    const value = values[index];
    fieldStore.removeValue(value);
    instanceStore.togglePreviewInstance();
  };

  const handleDragEnd = () => draggedValue.current = null;

  const handleDragStart = value => draggedValue.current = value;

  const handleDrop = value => dropValue(value);

  const handleKeyDown = (value, e) => {
    if (e.keyCode === 8) { //User pressed "Backspace" while focus on a value
      e.preventDefault();
      fieldStore.removeValue(value);
      instanceStore.togglePreviewInstance();
    }
  };

  const handleFocus = index => {
    if (view) {
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        view.setInstanceHighlight(id, fieldStore.label);
      }
      instanceStore.togglePreviewInstance();
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
    instanceStore.togglePreviewInstance(instanceId, instanceName, options);
  };

  const handleSearchOptions = term => fieldStore.searchOptions(term);

  const handleLoadMoreOptions = () => fieldStore.loadMoreOptions();

  if(readMode){

    if (!links.length && !showIfNoValue) {
      return null;
    }

    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} />
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
  const hasWarning = !isDisabled && fieldStore.hasChanged && fieldStore.numberOfItemsWarning;
  const warningMessages = fieldStore.warningMessages;
  const hasWarningMessages = fieldStore.hasWarningMessages;
  return (
    <Form.Group className={className} ref={formGroupRef}>
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} globalLabelTooltip={globalLabelTooltip} globalLabelTooltipIcon={globalLabelTooltipIcon}/>
      <LinksAlternatives
        className={classes.alternatives}
        list={alternatives}
        onSelect={handleSelectAlternative}
        onRemove={handleRemoveMySuggestion}
        mappingValue={mappingValue}
        parentContainerRef={formGroupRef}
      />
      <div className={`form-control ${classes.values} ${hasWarning && hasWarningMessages?classes.warning:""}`} disabled={isDisabled} >
        <List
          list={links}
          readOnly={false}
          disabled={isDisabled}
          enablePointerEvents={(view && view.currentInstanceId === instance.id)}
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
      {hasWarning && hasWarningMessages &&
        <Invalid  messages={warningMessages}/>
      }
    </Form.Group>
  );
});
DynamicDropdown.displayName = "DynamicDropdown";

export default DynamicDropdown;