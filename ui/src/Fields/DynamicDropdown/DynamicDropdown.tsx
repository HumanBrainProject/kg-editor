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

import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';
import Form from 'react-bootstrap/Form';
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import DropdownComponent  from '../../Components/DynamicDropdown/Dropdown';
import useStores from '../../Hooks/useStores';

import Matomo from '../../Services/Matomo';
import Invalid from '../Invalid';
import Label from '../Label';
import LinksAlternatives from '../LinksAlternatives';
import TargetTypeSelection from '../TargetTypeSelection';
import Warning from '../Warning';

import List from './List';
import type { InstanceLabel, StructureOfType, Suggestion } from '../../types';
import type LinksStore from '../Stores/LinksStore';
import type { Field } from '../index';
import type { KeyboardEvent, MouseEvent, SyntheticEvent} from 'react';


const useStyles = createUseStyles({
  labelContainer: {
    display: 'flex'
  },
  labelPanel: {
    flex: '1'
  },
  values:{
    flex: 1,
    height:'auto',
    paddingBottom:'3px',
    position:'relative',
    minHeight: '34px'
  },
  disabledValues: {
    backgroundColor: '#e9ecef',
    pointerEvents:'none'
  },
  label: {},
  readMode:{
    '& $label:after': {
      content: '\':\\00a0\''
    }
  },
  alternatives: {
    marginLeft: '3px'
  },
  warning: {
    borderColor: 'var(--ft-color-warn)'
  },
  inferred: {
    color: 'var(--bs-gray-600)',
    '& .btn': {
      color: 'var(--bs-gray-600)',
      '&:hover':{
        color: 'var(--bs-body-color)'
      }
    }
  }
});

interface DynamicDropdownProps extends Field {
  fieldStore: LinksStore;
}

const DynamicDropdown = observer(({ className, fieldStore, readMode, showIfNoValue, view, pane}: DynamicDropdownProps) => {

  const classes = useStyles();

  const location = useLocation();
  const navigate = useNavigate();

  const { typeStore, instanceStore, appStore } = useStores();

  const draggedIndex = useRef<number|undefined>(undefined);
  const formGroupRef = useRef<HTMLInputElement>(null);
  const formControlRef = useRef<HTMLDivElement>(null);
  const dropdownInputRef = useRef<HTMLInputElement>(null);

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

  const addNewValue = (name: string, typeName: string) => {
    if (fieldStore.allowCustomValues) {
      const id = uuidv4();
      const type = typeStore.typesMap.get(typeName);
      instanceStore.createNewInstance(type as StructureOfType, id, name);
      const value = {[fieldStore.mappingValue]: id};
      fieldStore.addValue(value);
      if (view && pane) {
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
    }
    instanceStore.togglePreviewInstance();
  };

  const addValue = (id: string) => {
    instanceStore.createInstanceOrGet(id);
    const value = {[fieldStore.mappingValue]: id};
    fieldStore.addValue(value);
    if (view && pane) {
      const index = view.panes.findIndex(p => p === pane);
      if (index !== -1 && index < view.panes.length -1) {
        const targetPane = view.panes[index+1];
        setTimeout(() => view.setInstanceHighlight(targetPane, id, fieldStore.label), 1000);
      }
    }
    instanceStore.togglePreviewInstance();
  };

  const handleSelectAlternative = (value: InstanceLabel[]) => {
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

  const handleClick = (index?: number) => {
    if (view && pane) {
      view.resetInstanceHighlight();
      if(index !== undefined) {
        const value = values[index];
        const id = value ? value[fieldStore.mappingValue] as string : undefined;
        if (id) {
          const paneForInstanceId = view.getPaneByInstanceId(id);
          const _pane = paneForInstanceId?paneForInstanceId:view.currentInstanceIdPane;
          view.selectPane(_pane);
          view.setCurrentInstanceId(_pane, id);
          view.setInstanceHighlight(_pane, id, fieldStore.label);
        }
      }
    }
  };

  const handleDelete = (index?: number) => {
    if(index !== undefined){
      const value = values[index];
      fieldStore.removeValue(value);
      instanceStore.togglePreviewInstance();
    }
  };

  const handleSelectTargetType = (eventKey: string | null, e: SyntheticEvent<unknown>) => {
    e.preventDefault();
    const type = targetTypes.find(t => t.name === eventKey);
    if (type) {
      fieldStore.setTargetType(type);
    }
  };

  const handleOnSelectOption = (option: Suggestion) => {
    if (option.isNew) {
      const name = optionsSearchTerm.trim();
      if (option.isExternal) {
        Matomo.trackEvent('Instance', 'CreateInstanceInExternalSpace', option.type.name);
        appStore.createExternalInstance(option.space, option.type.name, name, location, navigate);
      } else {
        Matomo.trackEvent('Instance', 'CreateInstanceInCurrentSpace', option.type.name);
        addNewValue(name, option.type.name);
      }
    } else {
      addValue(option.id);
    }
  };

  const handleDragEnd = () => draggedIndex.current = undefined;

  const handleDragStart = (index?: number) => draggedIndex.current = index;

  const handleDrop = (droppedIndex?: number) => {
    if (Array.isArray(values) && draggedIndex.current !== undefined && draggedIndex.current >= 0 && draggedIndex.current < values.length && droppedIndex !== undefined && droppedIndex >= 0 && droppedIndex < values.length) {
      const value = values[draggedIndex.current];
      const afterValue = values[droppedIndex];
      fieldStore.moveValueAfter(value, afterValue);
    }
    draggedIndex.current = undefined;
    instanceStore.togglePreviewInstance();
  };


  const handleDropAtTheEnd = () => {
    if (Array.isArray(values) && draggedIndex.current !== undefined && draggedIndex.current >= 0 && draggedIndex.current < values.length) {
      const value = values[draggedIndex.current];
      const afterValue = values[values.length-1];
      fieldStore.moveValueAfter(value, afterValue);
    }
    draggedIndex.current = undefined;
    instanceStore.togglePreviewInstance();
  };

  const handleKeyDown = (index: number , e: KeyboardEvent<HTMLDivElement>) => {
    const value = index !== undefined ? values[index]: undefined;
    if (value && e.key === 'Backspace') { //User pressed "Backspace" while focus on a value
      e.preventDefault();
      fieldStore.removeValue(value);
      instanceStore.togglePreviewInstance();
    }
  };

  const handleFocus = (index?: number) => {
    if (view) {
      const value = index !== undefined && values[index];
      const id = value ? value[fieldStore.mappingValue] as string: undefined;
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

  const handleSearchOptions = (term: string) => fieldStore.searchOptions(term);

  const handleLoadMoreOptions = () => fieldStore.loadMoreOptions();

  const handleDropDownFocus = (e: MouseEvent<HTMLDivElement>) => {
    if (formControlRef && formControlRef.current === e.target && dropdownInputRef) {
      dropdownInputRef.current?.focus();
    }
  };

  if (readMode && !links.length && !showIfNoValue) {
    return null;
  }

  const fetchLabel = !!(!view || (view.selectedPane && (pane !== view.selectedPane)));

  if(readMode || isReadOnly){
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isRequired={isRequired} isReadOnly={readMode?false:isReadOnly} />
        {(view && view.currentInstanceId === instance?.id)?
          <List
            mainInstanceId={instance.id}
            list={links}
            readOnly={true}
            disabled={false}
            enablePointerEvents={true}
            onClick={handleClick}
            fetchLabel={fetchLabel}
          />
          :
          <List
            list={links}
            readOnly={true}
            disabled={false}
            enablePointerEvents={false}
            fetchLabel={fetchLabel}
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
  const sortedTargetTypes = hasMultipleTypes ? [...targetTypes].sort((a, b) => a.label.localeCompare(b.label)):targetTypes;
  return (
    <Form.Group className={className} ref={formGroupRef}>
      <div className={classes.labelContainer}>
        <div className={classes.labelPanel}>
          <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} isPublic={isPublic} isInferred={fieldStore.isInferred} />
          <LinksAlternatives
            className={classes.alternatives}
            list={alternatives}
            onSelect={handleSelectAlternative}
            onRemove={handleRemoveMySuggestion}
            mappingValue={mappingValue}
            parentContainerRef={formGroupRef}
          />
        </div>
        {hasMultipleTypes && <TargetTypeSelection id={`targetType-${fullyQualifiedName}`} types={sortedTargetTypes} selectedType={targetType} onSelect={handleSelectTargetType} />}
      </div>
      <div ref={formControlRef} className={`form-control ${classes.values} ${hasValidationWarnings?classes.warning:''} ${isDisabled?classes.disabledValues:''} ${fieldStore.isInferred?classes.inferred:''}`} onClick={handleDropDownFocus} >
        <List
          mainInstanceId={instance?.id}
          list={links}
          readOnly={false}
          disabled={isDisabled}
          enablePointerEvents={(!!view && view.currentInstanceId === instance?.id)}
          onClick={handleClick}
          onDelete={handleDelete}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          fetchLabel={fetchLabel}
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
            onDrop={handleDropAtTheEnd}
          />
        )}
      </div>
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
DynamicDropdown.displayName = 'DynamicDropdown';

export default DynamicDropdown;