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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import DropdownComponent from '../../Components/DynamicDropdown/Dropdown';
import useStores from '../../Hooks/useStores';

import Matomo from '../../Services/Matomo';
import Invalid from '../Invalid';
import Label from '../Label';
import TargetTypeSelection from '../TargetTypeSelection';
import Warning from '../Warning';
import Table from './Table';
import type { View } from '../../Stores/ViewStore';
import type { StructureOfType, Suggestion } from '../../types';
import type LinksStore from '../Stores/LinksStore';
import type { MouseEvent, SyntheticEvent} from 'react';

const useStyles = createUseStyles({
  container: {
    position: 'relative'
  },
  field: {
    marginBottom: '0'
  },
  table: {
    border: '1px solid var(--border-color-ui-contrast2)',
    paddingTop: '10px',
    marginBottom: '15px',
    '&.disabled': {
      background: 'rgb(238, 238, 238)',
      color: 'rgb(85,85,85)'
    },
    '& .form-control': {
      paddingLeft: '9px'
    }
  },
  addValueContainer: {
    position: 'relative',
    '&.hasMultipleTypes': {
      '& $dropdownContainer': {
        paddingRight: '30%'
      },
      '& $dropdown': {
        display: 'block',
        marginRight: '10px',
        '& > input': {
          maxWidth: 'unset !important',
          width: '100% !important'
        }
      }
    }
  },
  dropdownContainer:{
    height:'auto',
    borderRadius: '0',
    borderLeft: '0',
    borderRight: '0',
    borderBottom: '0',
    paddingTop: '4px',
    paddingBottom: '1px',
    position:'relative'
  },
  dropdown: {},
  emptyMessage: {
    position: 'absolute !important',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '1.2em',
    fontWeight: 'lighter',
    width:'100%',
    textAlign:'center'
  },
  emptyMessageLabel: {
    paddingLeft: '6px',
    display:'inline-block'
  },
  deleteBtn: {
    float: 'right',
    marginRight: '9px',
    '& .btn': {
      padding: '1px 6px 1px 6px'
    }
  },
  label: {},
  readMode:{
    '& $label:after': {
      content: '\':\\00a0\''
    }
  },
  warning: {
    borderColor: 'var(--ft-color-warn)'
  }
});

interface DynamicTableProps {
  className: string;
  fieldStore: LinksStore;
  view: View;
  pane: string;
  readMode: boolean;
  showIfNoValue: boolean;
}

const DynamicTable = observer(({ className, fieldStore, view, pane, readMode, showIfNoValue}: DynamicTableProps) => {

  const classes = useStyles();

  const location = useLocation();
  const navigate = useNavigate();

  const { typeStore, instanceStore,  appStore } = useStores();

  const formControlRef = useRef<HTMLDivElement>(null);
  const dropdownInputRef = useRef<HTMLInputElement>(null);

  const {
    instance,
    fullyQualifiedName,
    links,
    label,
    labelTooltip,
    labelTooltipIcon,
    isPublic,
    optionsSearchTerm,
    options,
    targetTypes,
    targetType,
    hasMoreOptions,
    fetchingOptions,
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
      setTimeout(() => {
        if (fieldStore.isLinkVisible(id)) {
          const index = view.panes.findIndex(p => p === pane);
          if (index !== -1 && index < view.panes.length -1) {
            const targetPane = view.panes[index+1];
            const paneForInstanceId = view.getPaneByInstanceId(id);
            const _pane = paneForInstanceId?paneForInstanceId:targetPane;
            view.setInstanceHighlight(_pane, id, fieldStore.label);
            view.setCurrentInstanceId(_pane, id);
            view.selectPane(_pane);
            view.resetInstanceHighlight();
          }
        }
      }, 1000);
    }
    instanceStore.togglePreviewInstance();
  };

  const addValue = (id: string) => {
    instanceStore.createInstanceOrGet(id);
    const value = {[fieldStore.mappingValue]: id};
    fieldStore.addValue(value);
    setTimeout(() => {
      if (fieldStore.isLinkVisible(id)) {
        const index = view.panes.findIndex(p => p === pane);
        if (index !== -1 && index < view.panes.length -1) {
          const targetPane = view.panes[index+1];
          view.setInstanceHighlight(targetPane, id, fieldStore.label);
        }
      }
    }, 1000);
    instanceStore.togglePreviewInstance();
  };

  const handleSelectTargetType =  (eventKey: string | null, e: SyntheticEvent<unknown>)  => {
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

  const handleDeleteAll = () => {
    fieldStore.setValues([]);
    instanceStore.togglePreviewInstance();
  };

  const handleSearchOptions = (term: string) => fieldStore.searchOptions(term);

  const handleLoadMoreOptions = () => fieldStore.loadMoreOptions();

  const handleRowDelete = (index: number) => {
    const { value: values } = fieldStore;
    const value = values[index];
    fieldStore.removeValue(value);
    instanceStore.togglePreviewInstance();
  };

  const handleRowClick = (index: number) => {
    if (view && pane) {
      const { value: values } = fieldStore;
      const value = values[index];
      const id = value ? value[fieldStore.mappingValue] as string: undefined;
      if (id && id !== instance?.id) {
        fieldStore.showLink(id);
        setTimeout(() => {
          view.resetInstanceHighlight();
          const paneForInstanceId = view.getPaneByInstanceId(id);
          const _pane = paneForInstanceId?paneForInstanceId:view.currentInstanceIdPane;
          view.selectPane(_pane);
          view.setCurrentInstanceId(_pane, id);
          view.setInstanceHighlight(_pane, id, fieldStore.label);
        }, fieldStore.isLinkVisible(id)?0:1000);
      }
    }
  };

  const handleRowMouseOver = (index: number) => {
    if (view) {
      const { value: values } = fieldStore;
      const value = values[index];
      const id = value ? value[fieldStore.mappingValue] as string:undefined;
      if (id && id !== instance?.id && fieldStore.isLinkVisible(id)) {
        const idx = view.panes.findIndex(p => p === pane);
        if (idx !== -1 && idx < view.panes.length -1) {
          const targetPane = view.panes[idx+1];
          view.setInstanceHighlight(targetPane, id, fieldStore.label);
        }
      }
    }
  };

  const handleRowMouseOut = () => {
    if (view) {
      view.resetInstanceHighlight();
    }
  };

  const handleDropDownFocus = (e: MouseEvent<HTMLDivElement>) => {
    if (formControlRef && formControlRef.current === e.target && dropdownInputRef) {
      dropdownInputRef.current?.focus();
    }
  };

  const fieldStoreLabel = label?.toLowerCase();
  const isDisabled =  readMode || isReadOnly || returnAsNull;
  const canAddValues = !isDisabled;
  const hasValidationWarnings = !isDisabled && fieldStore.hasValidationWarnings;
  const hasWarning = !isDisabled && fieldStore.hasChanged && fieldStore.hasWarning;
  const hasMultipleTypes = canAddValues && targetTypes.length > 1;
  const sortedTargetTypes = hasMultipleTypes ? [...targetTypes].sort((a, b) => a.label.localeCompare(b.label)): targetTypes;
  if (readMode && !links.length && !showIfNoValue) {
    return null;
  }

  return (
    <Form.Group className={`${classes.container} ${readMode?classes.readMode:''} ${className}`}>
      {readMode ?
        <Label className={classes.label} label={label} isRequired={isRequired} />:
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} isReadOnly={isReadOnly} isPublic={isPublic}/>
      }
      {!isDisabled && (view && view.currentInstanceId === instance?.id) && (
        <div className={classes.deleteBtn}>
          <Button size="sm" variant={'primary'} onClick={handleDeleteAll} disabled={links.length === 0}>
            <FontAwesomeIcon icon="times"/>
          </Button>
        </div>
      )}
      <div className={`${classes.table} ${hasValidationWarnings?classes.warning:''} ${returnAsNull?'disabled':''}`}>
        {(view && view.currentInstanceId === instance?.id)?
          <Table
            mainInstanceId={instance.id}
            list={links}
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
            readOnly={isDisabled}
            enablePointerEvents={false}
          />
        }
        {!isDisabled && (
          <div className={`${classes.addValueContainer} ${hasMultipleTypes?'hasMultipleTypes':''}`}>
            <div ref={formControlRef} className={`form-control ${classes.dropdownContainer}`} onClick={handleDropDownFocus} >
              <DropdownComponent
                inputRef={dropdownInputRef}
                className={classes.dropdown}
                searchTerm={optionsSearchTerm}
                options={options}
                loading={fetchingOptions}
                hasMore={hasMoreOptions}
                inputPlaceholder={`type to add a ${fieldStoreLabel}`}
                onSearch={handleSearchOptions}
                onLoadMore={handleLoadMoreOptions}
                onReset={handleDropdownReset}
                onSelect={handleOnSelectOption}
              />
            </div>
            {hasMultipleTypes && <TargetTypeSelection id={`targetType-${fullyQualifiedName}`} types={sortedTargetTypes} selectedType={targetType} onSelect={handleSelectTargetType} />}
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
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
DynamicTable.displayName = 'DynamicTable';

export default DynamicTable;