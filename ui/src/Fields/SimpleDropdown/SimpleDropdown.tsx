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
import ListItem from '../DynamicDropdown/ListItem';
import Invalid from '../Invalid';
import Label from '../Label';
import LinksAlternatives from '../LinksAlternatives';
import TargetTypeSelection from '../TargetTypeSelection';
import Warning from '../Warning';

import type { StructureOfType, Suggestion } from '../../types';
import type LinkStore from '../Stores/LinkStore';
import type { Field } from '../index';
import type { MouseEvent, SyntheticEvent} from 'react';

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
  disabledValues:{
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
  }
});

interface ReadOnlyValueProps {
  id?: string | null;
  instanceId?: string;
  fetchLabel: boolean;
  onClick?: () => void;
}

const ReadOnlyValue = observer(({ id, instanceId, fetchLabel, onClick }: ReadOnlyValueProps) => {
  if (!id) {
    return null;
  }
  const isClickable = !!onClick;
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

interface SimpleDropdownProps extends Field {
  fieldStore: LinkStore;
}

const SimpleDropdown = observer(({ className, fieldStore, readMode, showIfNoValue, view, pane }: SimpleDropdownProps) => {

  const classes = useStyles();

  const location = useLocation();
  const navigate = useNavigate();

  const { typeStore, instanceStore, appStore } = useStores();

  const formGroupRef = useRef<HTMLInputElement>(null);
  const formControlRef = useRef<HTMLDivElement>(null);
  const dropdownInputRef = useRef<HTMLInputElement>(null);

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

  const id = value ? value[mappingValue] as string: undefined;

  const handleDropdownReset = () => {
    fieldStore.resetOptionsSearch();
    instanceStore.togglePreviewInstance();
  };

  const addNewValue = (name: string, typeName: string) => {
    if (fieldStore.allowCustomValues) {
      const newId = uuidv4();
      const type = typeStore.typesMap.get(typeName);
      instanceStore.createNewInstance(type as StructureOfType, newId, name);
      const newValue = {[mappingValue]: newId};
      fieldStore.addValue(newValue);
      if (view && pane) {
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
    }
    instanceStore.togglePreviewInstance();
  };

  const addValue = (idToAdd: string) => {
    instanceStore.createInstanceOrGet(idToAdd);
    const val = {[mappingValue]: idToAdd};
    fieldStore.addValue(val);
    if (view && pane) {
      const index = view.panes.findIndex(p => p === pane);
      if (index !== -1 && index < view.panes.length -1) {
        const targetPane = view.panes[index+1];
        setTimeout(() => view.setInstanceHighlight(targetPane, id, fieldStore.label), 1000);
      }
    }
    instanceStore.togglePreviewInstance();
  };

  const handleSelectAlternative = (val:any) => {
    fieldStore.addValue({[mappingValue]: val.id});
    instanceStore.togglePreviewInstance();
  };

  const handleRemoveMySuggestion = () => {
    fieldStore.removeValue();
    instanceStore.togglePreviewInstance();
  };

  const handleClick = () => {
    if (view && pane) {
      const selectedId = value ? value[mappingValue] as string: undefined;
      if (selectedId) {
        view.resetInstanceHighlight();
        const paneForInstanceId = view.getPaneByInstanceId(id);
        const _pane = paneForInstanceId?paneForInstanceId:view.currentInstanceIdPane;
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


  const handleFocus = () => {
    if (view) {
      const focusedId = value ? value[mappingValue] as string:undefined;
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

  const handleSearchOptions = (term: string) => fieldStore.searchOptions(term);

  const handleLoadMoreOptions = () => fieldStore.loadMoreOptions();

  const handleDropDownFocus = (e: MouseEvent<HTMLDivElement>) => {
    if (formControlRef && formControlRef.current === e.target && dropdownInputRef) {
      dropdownInputRef.current?.focus();
    }
  };

  const fetchLabel = !!(!view || (view.selectedPane && (pane !== view.selectedPane)));

  if (readMode && !id && !showIfNoValue) {
    return null;
  }

  if(readMode || isReadOnly){
    const isClickable = view && view.currentInstanceId === instance?.id;
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isRequired={isRequired} isReadOnly={readMode?false:isReadOnly} />
        <ReadOnlyValue
          id={id}
          instanceId={instance?.id}
          fetchLabel={fetchLabel}
          onClick={isClickable?handleClick:undefined}
        />
      </Form.Group>
    );
  }

  const isDisabled = returnAsNull;
  const canAddValues = !isDisabled;
  const hasValidationWarnings = !isDisabled && fieldStore.hasValidationWarnings;
  const hasWarning = !isDisabled && fieldStore.hasChanged && fieldStore.hasWarning;
  const hasMultipleTypes = canAddValues && targetTypes.length > 1;
  const sortedTargetTypes = hasMultipleTypes ? [...targetTypes].sort((a, b) => a.label.localeCompare(b.label)): targetTypes;
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
        {hasMultipleTypes && <TargetTypeSelection id={`targetType-${fullyQualifiedName}`} types={sortedTargetTypes} selectedType={targetType} onSelect={handleSelectTargetType} />}
      </div>
      <div ref={formControlRef} className={`form-control ${classes.values} ${hasValidationWarnings?classes.warning:''} ${isDisabled?classes.disabledValues:''}`} onClick={handleDropDownFocus} >
        {value &&
        <ListItem
          isCircular={instance?.id===id}
          instanceId={id}
          readOnly={false}
          disabled={isDisabled}
          enablePointerEvents={(!!view && view.currentInstanceId === instance?.id)}
          onClick={handleClick}
          onDelete={handleDelete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          fetchLabel={fetchLabel}
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
          />
        )}
      </div>
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
SimpleDropdown.displayName = 'SimpleDropdown';

export default SimpleDropdown;