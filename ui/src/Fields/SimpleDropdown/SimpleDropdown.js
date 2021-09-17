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
import Dropdown from "react-bootstrap/Dropdown";
import { createUseStyles } from "react-jss";
import _ from "lodash-uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPiwik from "react-piwik";

import { useStores } from "../../Hooks/UseStores";

import DropdownComponent  from "../../Components/DynamicDropdown/Dropdown";
import DynamicOption  from "../DynamicOption/DynamicOption";
import LinksAlternatives from "../LinksAlternatives";
import Label from "../Label";
import Invalid from "../Invalid";

import ListItem from "../DynamicDropdown/ListItem";

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
  targetTypes: {
    minWidth: "30%",
    "&.dropdown > button.btn.dropdown-toggle, &.dropdown > button.btn.dropdown-toggle:hover, &.dropdown > button.btn.dropdown-toggle:active": {
      border: 0, //"1px solid #ced4da",
      background: "transparent",
      color: "#212529",
      width: "100%",
      paddingRight: "2px",
      textOverflow: "ellipsis",
      textAlign: "right",
      outline: 0
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

const SimpleDropdown = observer(({ className, fieldStore, readMode, showIfNoValue, view, pane}) => {

  const classes = useStyles();

  const { typeStore, instanceStore, appStore } = useStores();

  const formGroupRef = useRef();

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
      const id = _.uuid();
      const type = typeStore.typesMap.get(typeName);
      instanceStore.createNewInstance(type, id, name);
      const value = {[mappingValue]: id};
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
    const value = {[mappingValue]: id};
    fieldStore.addValue(value);
    const index = view.panes.findIndex(p => p === pane);
    if (index !== -1 && index < view.panes.length -1) {
      const targetPane = view.panes[index+1];
      setTimeout(() => view.setInstanceHighlight(targetPane, id, fieldStore.label), 1000);
    }
    instanceStore.togglePreviewInstance();
  };

  const handleSelectAlternative = value => {
    fieldStore.addValue({[mappingValue]: value.id});
    instanceStore.togglePreviewInstance();
  };

  const handleRemoveMySuggestion = () => {
    fieldStore.removeValue();
    instanceStore.togglePreviewInstance();
  };

  const handleClick = () => {
    if (view && pane) {
      const id = value && value[mappingValue];
      if (id) {
        view.resetInstanceHighlight();
        const _pane = view.currentInstanceIdPane;
        view.selectPane(_pane);
        view.setCurrentInstanceId(_pane, id);
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
         ReactPiwik.push(["trackEvent", "Instance", "CreateInstanceInExternalSpace", option.type.name]);
        appStore.createExternalInstance(option.space.id, option.type.name, name);
      } else {
        ReactPiwik.push(["trackEvent", "Instance", "CreateInstanceInCurrentSpace", option.type.name]);
        addNewValue(name, option.type.name);
      }
    } else {
      addValue(option.id);
    }
  };


  const handleFocus = () => {
    if (view) {
      const id = value && value[mappingValue];
      if (id) {
        const index = view.panes.findIndex(p => p === pane);
        if (index !== -1 && index < view.panes.length -1) {
          const targetPane = view.panes[index+1];
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

  const handleMouseOver = () => {
    if (view) {
      const id = value && value[mappingValue];
      if (id) {
        const index = view.panes.findIndex(p => p === pane);
        if (index !== -1 && index < view.panes.length -1) {
          const targetPane = view.panes[index+1];
          view.setInstanceHighlight(targetPane, id, fieldStore.label);
        }
      }
    }
  };

  const handleMouseOut = () => {
    if (view) {
      view.resetInstanceHighlight();
    }
  };

  const handleSearchOptions = term => fieldStore.searchOptions(term);

  const handleLoadMoreOptions = () => fieldStore.loadMoreOptions();

  const id = value && value[mappingValue];

  if (readMode && !showIfNoValue) {
    return null;
  }

  if(readMode || isReadOnly){
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isRequired={isRequired} isReadOnly={readMode?false:isReadOnly} />
        {(view && view.currentInstanceId === instance.id)?
          <ListItem
            instanceId={id}
            readOnly={false}
            disabled={false}
            enablePointerEvents={true}
            onClick={handleClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            fetchLabel={!view || (view.selectedPane && (pane !== view.selectedPane))}
          />
          :
          <ListItem
            instanceId={id}
            readOnly={false}
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
  const hasWarning = !isDisabled && fieldStore.hasChanged && fieldStore.requiredValidationWarning;
  const warningMessages = fieldStore.warningMessages;
  const hasWarningMessages = fieldStore.hasWarningMessages;
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
        {hasMultipleTypes && (
          <Dropdown className={classes.targetTypes} onSelect={handleSelectTargetType}>
            <Dropdown.Toggle id={`targetType-${fullyQualifiedName}`}>
              <FontAwesomeIcon icon={"circle"} color={targetType.color}/>&nbsp;&nbsp;{targetType.label?targetType.label:targetType.name}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {targetTypes.map(type =>
                  <Dropdown.Item key={type.name} eventKey={type.name}>
                    <FontAwesomeIcon icon={"circle"} color={type.color}/>&nbsp;&nbsp;{type.label?type.label:type.name}
                  </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
      <div className={`form-control ${classes.values} ${(hasWarning && hasWarningMessages)?classes.warning:""}`} disabled={isDisabled} >
        {value &&
        <ListItem
          instanceId={id}
          readOnly={false}
          disabled={isDisabled}
          enablePointerEvents={(view && view.currentInstanceId === instance.id)}
          onClick={handleClick}
          onDelete={handleDelete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          fetchLabel={!view || (view.selectedPane && (pane !== view.selectedPane))}
        />
        }
        {canAddValues && (
          <DropdownComponent
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
      {hasWarning && hasWarningMessages &&
        <Invalid  messages={warningMessages}/>
      }
    </Form.Group>
  );
});
SimpleDropdown.displayName = "SimpleDropdown";

export default SimpleDropdown;