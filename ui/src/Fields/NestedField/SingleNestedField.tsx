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
import Label from '../Label';
import Add from './Add';
import type { ActionProps } from './NestedField';
import type { FieldStores } from '../Stores/FieldStore';
import type SingleNestedFieldStore from '../Stores/SingleNestedFieldStore';
import type { Field as FieldProps } from '../index';
import type { MouseEvent} from 'react';

const useStyles = createUseStyles({
  label: {},
  readMode:{
    '& $item': {
      padding: 0
    },
    '&:.readOnly $label:after': {
      content: '\':\\00a0\''
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
    border: 0,
    borderRadius: '.25rem',
    padding: '30px 0 0 0 ',
    minHeight: '40px'
  },
  field: {
    marginBottom: 0,
    '& + $field': {
      marginTop: '1rem'
    }
  },
  actions: {
    position: 'absolute',
    top: 0,
    right: 0,
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
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'var(--button-secondary-active-bg-color)'
    }
  },
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


const Action = ({ icon, title, onClick }: ActionProps) => {

  const classes = useStyles();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }
    typeof onClick === 'function' && onClick();
  };

  return (
    <div className={classes.action} onClick={handleClick} title={title}>
      <FontAwesomeIcon icon={icon} />
    </div>
  );
};

interface ItemProps {
  itemFieldStores: FieldStores;
  readMode: boolean;
  active: boolean;
  onDelete: () => void;
}


const Item = ({ itemFieldStores, readMode, active, onDelete }: ItemProps) => {

  const classes = useStyles();

  const view = React.useContext(ViewContext);
  const pane = React.useContext(PaneContext);

  const sortedStores = Object.values(itemFieldStores).sort((a, b) => compareField(a, b, true));

  return (
    <div className={classes.item}>
      {sortedStores.map(store => (
        <Field key={store.fullyQualifiedName} name={store.fullyQualifiedName} className={classes.field} fieldStore={store} view={view} pane={pane} readMode={readMode} enablePointerEvents={true} showIfNoValue={false} />
      ))}
      {!readMode && active && (
        <div className={classes.actions} >
          <Action icon="times" onClick={onDelete} title="Delete" />
        </div>
      )}
    </div>
  );
};

interface SingleNestedFieldProps extends FieldProps {
  fieldStore: SingleNestedFieldStore;
}

const SingleNestedField = observer(({className, fieldStore, readMode, showIfNoValue}:SingleNestedFieldProps) => {

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

  const handleAdd = (type: string) => fieldStore.add(type);

  const handleDelete = () => fieldStore.delete();

  const active = (view && view.currentInstanceId === instance?.id)?true:false;

  if(readMode && !showIfNoValue && (!initialValue || !nestedFieldsStores )) {
    return null;
  }

  return (
    <div className={`${(readMode || isReadOnly)?classes.readMode:''} ${className} ${isReadOnly?'readOnly':''}`} ref={formGroupRef}>
      {readMode ?
        <Label className={classes.label} label={label} />:
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isPublic={isPublic} isReadOnly={isReadOnly} />
      }
      <div className={classes.form} >
        {nestedFieldsStores && (
          <Item itemFieldStores={nestedFieldsStores.stores} readMode={readMode || isReadOnly} active={active}  onDelete={handleDelete} />
        )}
        {!readMode && !isReadOnly && active && !nestedFieldsStores && (
          <Add className={`${classes.actionBtn} ${nestedFieldsStores?'':classes.noItems}`} onClick={handleAdd} types={fieldStore.resolvedTargetTypes} />
        )}
      </div>
    </div>
  );
});
SingleNestedField.displayName = 'SingleNestedField';

export default SingleNestedField;