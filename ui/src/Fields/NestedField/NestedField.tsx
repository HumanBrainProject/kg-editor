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
import { createUseStyles } from 'react-jss';

import { compareField } from '../../Stores/Instance';
import { ViewContext, PaneContext } from '../../Stores/ViewStore';
import Field from '../Field';
import Invalid from '../Invalid';
import Label from '../Label';
import Warning from '../Warning';
import Add from './Add';
import type NestedFieldStore from '../Stores/NestedFieldStore';
import type { NestedInstanceFieldStores } from '../Stores/SingleNestedFieldStore';
import type { Field as FieldProps } from '../index';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { MouseEvent} from 'react';

const useStyles = createUseStyles({
  label: {},
  readMode:{
    '&:.readOnly $label:after': {
      content: '\':\\00a0\''
    },
    '& $item': {
      padding: '10px'
    },
    '& $item$single': {
      padding: 0
    },
    '& $item:first-child:last-child': {
      border: 0
    },
    '& $field + $field': {
      marginTop: '0.5rem'
    }
  },
  form: {
    position: 'relative',
    border: '1px solid #ced4da',
    borderRadius: '.25rem',
    padding: '10px'
  },
  item: {
    position: 'relative',
    border: '1px solid #ced4da',
    borderRadius: '.25rem',
    padding: '40px 10px 10px 10px',
    minHeight: '40px',
    '& + $item': {
      marginTop: '10px'
    }
  },
  field: {
    marginBottom: 0,
    '& + $field': {
      marginTop: '1rem'
    }
  },
  actions: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    alignItems: 'flex-end'
  },
  action: {
    fontSize: '0.9em',
    lineHeight: '27px',
    textAlign: 'center',
    backgroundColor: 'var(--button-secondary-bg-color)',
    color: 'var(--ft-color-loud)',
    cursor: 'pointer',
    width: '25px',
    '&:hover': {
      backgroundColor: 'var(--button-secondary-active-bg-color)'
    },
    '&:first-child': {
      borderRadius: '4px 0 0 4px'
    },
    '&:last-child': {
      borderRadius: '0 4px 4px 0'
    },
    '&$single': {
      borderRadius: '4px'
    }
  },
  single: {},
  actionBtn: {
    marginTop: '10px',
    '&$noItems': {
      marginTop: '0'
    }
  },
  noItems: {},
  warning: {
    borderColor: 'var(--ft-color-warn)'
  }
});

export interface ActionProps {
  icon: IconProp;
  title: string;
  single?: boolean;
  onClick: () => void;
}

const Action = ({ icon, title, single, onClick }: ActionProps) => {

  const classes = useStyles();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }
    typeof onClick === 'function' && onClick();
  };

  return (
    <div className={`${classes.action} ${single?classes.single:''}`} onClick={handleClick} title={title}>
      <FontAwesomeIcon icon={icon} />
    </div>
  );
};

interface ItemProps {
  itemFieldStores: NestedInstanceFieldStores;
  readMode: boolean;
  active: boolean;
  index: number;
  total: number;
  onDelete: (v:number) => void;
  onMoveUp: (v:number) => void;
  onMoveDown: (v:number) => void;
}

const Item = ({ itemFieldStores, readMode, active, index, total, onDelete, onMoveUp, onMoveDown }: ItemProps) => {

  const classes = useStyles();

  const view = React.useContext(ViewContext);
  const pane = React.useContext(PaneContext);

  const handleDelete = () => onDelete(index);
  const handleMoveUp = () => onMoveUp(index);
  const handleMoveDown = () => onMoveDown(index);

  const sortedStores = Object.values(itemFieldStores).sort((a, b) => compareField(a, b, true));

  return (
    <div className={`${classes.item} ${total === 1?classes.single:''}`} >
      {sortedStores.map(store => (
        <Field key={store.fullyQualifiedName} name={store.fullyQualifiedName} className={classes.field} fieldStore={store} view={view} pane={pane} readMode={readMode} enablePointerEvents={true} showIfNoValue={false} />
      ))}
      {!readMode && active && (
        <div className={classes.actions} >
          <Action icon="times" onClick={handleDelete} single={total === 1} title="Delete" />
          {index !== 0 && (
            <Action icon="arrow-up" onClick={handleMoveUp} title="Move up" />
          )}
          {index < total - 1 && (
            <Action icon="arrow-down" onClick={handleMoveDown} title="Move down" />
          )}
        </div>
      )}
    </div>
  );
};

interface NestedFieldProps extends FieldProps {
  fieldStore: NestedFieldStore;
}

const NestedField = observer(({className, fieldStore, readMode, showIfNoValue}: NestedFieldProps) => {

  const classes = useStyles();

  const formGroupRef = useRef<HTMLDivElement>(null);

  const view = React.useContext(ViewContext);

  const {
    instance,
    initialValue,
    label,
    labelTooltip,
    labelTooltipIcon,
    isReadOnly,
    isPublic,
    nestedFieldsStores
  } = fieldStore;

  const addValue = (type: string) => fieldStore.addValue(type);

  const handleDeleteItem = (index: number) => fieldStore.deleteItemByIndex(index);
  const handleMoveItemUp = (index: number) => fieldStore.moveItemUpByIndex(index);
  const handleMoveItemDown = (index: number) => fieldStore.moveItemDownByIndex(index);

  const active = view && view.currentInstanceId === instance?.id?true: false;

  if(readMode && !showIfNoValue && (!initialValue || !initialValue.length )) {
    return null;
  }


  const isDisabled = readMode || isReadOnly;
  const hasValidationWarnings = !isDisabled && fieldStore.hasValidationWarnings;
  const hasWarning = !readMode && !isReadOnly && fieldStore.hasChanged && fieldStore.hasWarning;
  return (
    <div className={`${(readMode || isReadOnly)?classes.readMode:''} ${className} ${isReadOnly?'readOnly':''}`} ref={formGroupRef}>
      {readMode ?
        <Label className={classes.label} label={label} />:
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isPublic={isPublic} isReadOnly={isReadOnly} />
      }
      <div className={`${classes.form} ${hasValidationWarnings?classes.warning:''}`} >
        {nestedFieldsStores.map((row, idx) => (
          <Item key={idx} itemFieldStores={row.stores} readMode={readMode || isReadOnly} active={active} index={idx} total={nestedFieldsStores.length} onDelete={handleDeleteItem} onMoveUp={handleMoveItemUp} onMoveDown={handleMoveItemDown} />
        ))}
        {!readMode && !isReadOnly && active && (
          <Add className={`${classes.actionBtn} ${nestedFieldsStores.length === 0?classes.noItems:''}`} onClick={addValue} types={fieldStore.resolvedTargetTypes} />
        )}
      </div>
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </div>
  );
});
NestedField.displayName = 'NestedField';

export default NestedField;