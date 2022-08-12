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
import _ from "lodash-uuid";
import { useLocation, useNavigate } from "react-router-dom";

import API from "../../Services/API";
import { useStores } from "../../Hooks/UseStores";

import DropdownComponent  from "../../Components/DynamicDropdown/Dropdown";
import DynamicOption  from "../DynamicOption/DynamicOption";
import LinksAlternatives from "../LinksAlternatives";
import Label from "../Label";
import Invalid from "../Invalid";
import Warning from "../Warning";

import ListItem from "../DynamicDropdown/ListItem";
import TargetTypeSelection from "../TargetTypeSelection";

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

const ReadOnlyValue = observer(({ id, instanceId, fetchLabel, onClick }) => {
  if (!id) {
    return null;
  }
  const isClickable = typeof onClick === "function";
  if (isClickable) {
    return (
      <ListItem
        isCircular={id === instanceId}
        instanceId={id}
        readOnly={true}
        disabled={false}
        enablePointerEvents={true}
        onClick={onClick}
        fetchLabel={fetchLabel}
      />
    );
  }
  return (
    <ListItem
      isCircular={id === instanceId}
      instanceId={id}
      readOnly={true}
      disabled={false}
      enablePointerEvents={false}
      fetchLabel={fetchLabel}
    />
  );
});

const SimpleDropdown = observer(({ className, fieldStore, readMode, showIfNoValue, view, pane}) => {

  const classes = useStyles();

  const location = useLocation();
  const navigate = useNavigate();

  const { typeStore, instanceStore, appStore } = useStores();

  const formGroupRef = useRef();
  const formControlRef = useRef();
  const dropdownInputRef = useRef();

  const {
    instance,
    fullyQualifiedName,
    value,
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
      const newId = _.uuid();
      const type = typeStore.typesMap.get(typeName);
      instanceStore.createNewInstance(type, newId, name);
      const newValue = {[mappingValue]: newId};
      fieldStore.addValue(newValue);
      setTimeout(() => {
        const index = view.panes.findIndex(p => p === pane); 
        if (index !== -1 && index < view.panes.length -1) {
          const targetPane = view.panes[index+1];
          view.setInstanceHighlight(targetPane, newId, fieldStore.label);
          view.setCurrentInstanceId(targetPane, newId);
          view.selectPane(targetPane);
          view.resetInstanceHighlight();
        }
      }, 1000);
    }
    instanceStore.togglePreviewInstance();
  };

  const addValue = idToAdd => {
    instanceStore.createInstanceOrGet(idToAdd);
    const val = {[mappingValue]: idToAdd};
    fieldStore.addValue(val);
    const index = view.panes.findIndex(p => p === pane);
    if (index !== -1 && index < view.panes.length -1) {
      const targetPane = view.panes[index+1];
      setTimeout(() => view.setInstanceHighlight(targetPane, id, fieldStore.label), 1000);
    }
    instanceStore.togglePreviewInstance();
  };

  const handleSelectAlternative = val => {
    fieldStore.addValue({[mappingValue]: val.id});
    instanceStore.togglePreviewInstance();
  };

  const handleRemoveMySuggestion = () => {
    fieldStore.removeValue();
    instanceStore.togglePreviewInstance();
  };

  const handleClick = () => {
    if (view && pane) {
      const selectedId = value && value[mappingValue];
      if (selectedId) {
        view.resetInstanceHighlight();
        const _pane = view.currentInstanceIdPane;
        view.selectPane(_pane);
        view.setCurrentInstanceId(_pane, selectedId);
        view.setInstanceHighlight(_pane, selectedId, fieldStore.label);
      }
    }
  };

  const handleDelete = () => {
    fieldStore.deleteValue();
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
         API.trackEvent("Instance", "CreateInstanceInExternalSpace", option.type.name);
        appStore.createExternalInstance(option.space.id, option.type.name, name, location, navigate);
      } else {
        API.trackEvent("Instance", "CreateInstanceInCurrentSpace", option.type.name);
        addNewValue(name, option.type.name);
      }
    } else {
      addValue(option.id);
    }
  };


  const handleFocus = () => {
    if (view) {
      const focusedId = value && value[mappingValue];
      if (focusedId) {
        const index = view.panes.findIndex(p => p === pane);
        if (index !== -1 && index < view.panes.length -1) {
          const targetPane = view.panes[index+1];
          view.setInstanceHighlight(targetPane, focusedId, fieldStore.label);
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

  const id = value && value[mappingValue];

  if (readMode && !id && !showIfNoValue) {
    return null;
  }

  if(readMode || isReadOnly){
    const isClickable = view && view.currentInstanceId === instance.id;
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isRequired={isRequired} isReadOnly={readMode?false:isReadOnly} />
        <ReadOnlyValue
          id={id}
          instanceId={instance.id}
          fetchLabel={!view || (view.selectedPane && (pane !== view.selectedPane))}
          onClick={isClickable?handleClick:null}
        />
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
        {value &&
        <ListItem
          isCircular={instance.id===id}
          instanceId={id}
          readOnly={false}
          disabled={isDisabled}
          enablePointerEvents={(view && view.currentInstanceId === instance.id)}
          onClick={handleClick}
          onDelete={handleDelete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          fetchLabel={!view || (view.selectedPane && (pane !== view.selectedPane))}
        />
        }
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
            optionComponent={DynamicOption}
          />
        )}
      </div>
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
SimpleDropdown.displayName = "SimpleDropdown";

export default SimpleDropdown;