/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import Form from "react-bootstrap/Form";
import { createUseStyles } from "react-jss";
import { v4 as uuidv4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";

import useStores from "../../Hooks/useStores";

import DropdownComponent  from "../../Components/DynamicDropdown/Dropdown";
import DynamicOption  from "../DynamicOption/DynamicOption";
import LinksAlternatives from "../LinksAlternatives";
import Label from "../Label";
import Invalid from "../Invalid";
import Warning from "../Warning";

import List from "./List";
import TargetTypeSelection from "../TargetTypeSelection";
import Matomo from "../../Services/Matomo";

const useStyles = createUseStyles({
  labelContainer: {
    display: "flex"
  },
  labelPanel: {
    flex: "1"
  },
  values:{
    flex: 1,
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

  const location = useLocation();
  const navigate = useNavigate();

  const { typeStore, instanceStore, appStore } = useStores();

  const draggedIndex = useRef();
  const formGroupRef = useRef();
  const formControlRef = useRef();
  const dropdownInputRef = useRef();

  const {
    instance,
    fullyQualifiedName,
    value: values,
    links,
    label,
    labelTooltip,
    labelTooltipIcon,
    isPublic,
    mappingValue,
    optionsSearchTerm,
    options,
    targetTypes,
    targetType,
    hasMoreOptions,
    fetchingOptions,
    alternatives,
    returnAsNull,
    isRequired,
    isReadOnly
  } = fieldStore;

  const handleDropdownReset = () => {
    fieldStore.resetOptionsSearch();
    instanceStore.togglePreviewInstance();
  };

  const addNewValue = (name, typeName) => {
    if (fieldStore.allowCustomValues) {
      const id = uuidv4();
      const type = typeStore.typesMap.get(typeName);
      instanceStore.createNewInstance(type, id, name);
      const value = {[fieldStore.mappingValue]: id};
      fieldStore.addValue(value);
      setTimeout(() => {
        const index = view.panes.findIndex(p => p === pane); 
        if (index !== -1 && index < view.panes.length -1) {
          const targetPane = view.panes[index+1];
          view.setInstanceHighlight(targetPane, id, fieldStore.label);
          view.setCurrentInstanceId(targetPane, id);
          view.selectPane(targetPane);
          view.resetInstanceHighlight();
        }
      }, 1000);
    }
    instanceStore.togglePreviewInstance();
  };

  const addValue = id => {
    instanceStore.createInstanceOrGet(id);
    const value = {[fieldStore.mappingValue]: id};
    fieldStore.addValue(value);
    const index = view.panes.findIndex(p => p === pane);
    if (index !== -1 && index < view.panes.length -1) {
      const targetPane = view.panes[index+1];
      setTimeout(() => view.setInstanceHighlight(targetPane, id, fieldStore.label), 1000);
    }
    instanceStore.togglePreviewInstance();
  };

  const handleSelectAlternative = value => {
    const vals = value.map(v => ({[fieldStore.mappingValue]: v.id}));
    fieldStore.setValues(vals);
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
      view.resetInstanceHighlight();
      const value = values[index];
      const id = value && value[fieldStore.mappingValue];
      if (id) {
        const paneForInstanceId = view.getPaneByInstanceId(id);
        const _pane = paneForInstanceId?paneForInstanceId:view.currentInstanceIdPane;
        view.selectPane(_pane);
        view.setCurrentInstanceId(_pane, id);
        view.setInstanceHighlight(_pane, id, fieldStore.label);
      }
    }
  };

  const handleDelete = index => {
    const value = values[index];
    fieldStore.removeValue(value);
    instanceStore.togglePreviewInstance();
  };

  const handleSelectTargetType = (eventKey, e) => {
    e.preventDefault();
    const type = targetTypes.find(t => t.name === eventKey);
    if (type) {
      fieldStore.setTargetType(type);
    }
  };

  const handleOnSelectOption = option => {
    if (option.isNew) {
      const name = optionsSearchTerm.trim();
      if (option.isExternal) {
        Matomo.trackEvent("Instance", "CreateInstanceInExternalSpace", option.type.name);
        appStore.createExternalInstance(option.space.id, option.type.name, name, location, navigate);
      } else {
        Matomo.trackEvent("Instance", "CreateInstanceInCurrentSpace", option.type.name);
        addNewValue(name, option.type.name);
      }
    } else {
      addValue(option.id);
    }
  };

  const handleDragEnd = () => draggedIndex.current = null;

  const handleDragStart = index => draggedIndex.current = index;

  const handleDrop = droppedIndex => {
    if (Array.isArray(values) && draggedIndex.current >= 0 && draggedIndex.current < values.length && droppedIndex >= 0 && droppedIndex < values.length) {
      const value = values[draggedIndex.current];
      const afterValue = values[droppedIndex];
      fieldStore.moveValueAfter(value, afterValue);
    }
    draggedIndex.current = null;
    instanceStore.togglePreviewInstance();
  };

  const handleKeyDown = (value, e) => {
    if (e.key === "Backspace") { //User pressed "Backspace" while focus on a value
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
        const idx = view.panes.findIndex(p => p === pane);
        if (idx !== -1 && idx < view.panes.length -1) {
          const targetPane = view.panes[idx+1];
          view.setInstanceHighlight(targetPane, id, fieldStore.label);
        }
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

  const handleSearchOptions = term => fieldStore.searchOptions(term);

  const handleLoadMoreOptions = () => fieldStore.loadMoreOptions();

  const handleDropDownFocus = e => {
    if (formControlRef && formControlRef.current === e.target && dropdownInputRef) {
      dropdownInputRef.current.focus();
    }
  };

  if (readMode && !links.length && !showIfNoValue) {
    return null;
  }

  if(readMode || isReadOnly){
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isRequired={isRequired} isReadOnly={readMode?false:isReadOnly} />
        {(view && view.currentInstanceId === instance.id)?
          <List
            mainInstanceId={instance.id}
            list={links}
            readOnly={true}
            disabled={false}
            enablePointerEvents={true}
            onClick={handleClick}
            fetchLabel={!view || (view.selectedPane && (pane !== view.selectedPane))}
          />
          :
          <List
            list={links}
            readOnly={true}
            disabled={false}
            enablePointerEvents={false}
            fetchLabel={!view || (view.selectedPane && (pane !== view.selectedPane))}
          />
        }
      </Form.Group>
    );
  }

  const isDisabled = returnAsNull;
  const canAddValues = !isDisabled;
  const hasValidationWarnings = !isDisabled && fieldStore.hasValidationWarnings;
  const hasWarning = !isDisabled && fieldStore.hasChanged && fieldStore.hasWarning;
  const hasMultipleTypes = canAddValues && targetTypes.length > 1;
  return (
    <Form.Group className={className} ref={formGroupRef}>
      <div className={classes.labelContainer}>
        <div className={classes.labelPanel}>
          <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} isPublic={isPublic}/>
          <LinksAlternatives
            className={classes.alternatives}
            list={alternatives}
            onSelect={handleSelectAlternative}
            onRemove={handleRemoveMySuggestion}
            mappingValue={mappingValue}
            parentContainerRef={formGroupRef}
          />
        </div>
        {hasMultipleTypes && <TargetTypeSelection id={`targetType-${fullyQualifiedName}`} types={targetTypes} selectedType={targetType} onSelect={handleSelectTargetType} />}
      </div>
      <div ref={formControlRef} className={`form-control ${classes.values} ${hasValidationWarnings?classes.warning:""}`} disabled={isDisabled} onClick={handleDropDownFocus} >
        <List
          mainInstanceId={instance.id}
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
          fetchLabel={!view || (view.selectedPane && (pane !== view.selectedPane))}
        />
        {canAddValues && (
          <DropdownComponent
            inputRef={dropdownInputRef}
            searchTerm={optionsSearchTerm}
            options={options}
            loading={fetchingOptions}
            hasMore={hasMoreOptions}
            onSearch={handleSearchOptions}
            onLoadMore={handleLoadMoreOptions}
            onReset={handleDropdownReset}
            onSelect={handleOnSelectOption}
            onDeleteLastValue={handleDeleteLastValue}
            onDrop={handleDrop}
            optionComponent={DynamicOption}
          />
        )}
      </div>
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
DynamicDropdown.displayName = "DynamicDropdown";

export default DynamicDropdown;