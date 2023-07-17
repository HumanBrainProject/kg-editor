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
import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';

import useStores from '../../Hooks/useStores';
import type Instance from '../../Stores/Instance';
import type { Value } from '../Stores/LinksStore';
import type { DragEvent, FocusEvent, KeyboardEvent, MouseEvent} from 'react';

const useStyles = createUseStyles({
  value: {
    '&:not(:last-child):after':{
      content: '\';\\00a0\''
    }
  },
  circular: {
    color: 'var(--bs-danger)',
    '&:hover': {
      color: 'var(--bs-danger)'
    }
  },
  valueTag: {
    marginBottom: '5px',
    padding: '1px 5px',
    border: '1px solid #ced4da',
    '&:not($circular):hover': {
      backgroundColor: 'var(--link-bg-color-hover)',
      borderColor: 'var(--link-border-color-hover)',
      color: '#143048'
    },
    '& + $valueTag': {
      marginLeft: '5px'
    }
  },
  valueLabel: {
    display: 'inline-block',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    verticalAlign: 'bottom'
  },
  remove: {
    fontSize: '0.8em',
    opacity: 0.5,
    marginLeft: '3px',
    '&:hover': {
      opacity: 1
    }
  },
  notFound: {
    fontStyle: 'italic',
    backgroundColor: 'lightgrey',
    '&:hover': {
      backgroundColor: 'lightgrey'
    }
  }
});

const getLabel = (instance?: Instance, hasError?: boolean, isFetching?: boolean) => {
  if (!instance) {
    return  'Unknown instance';
  }
  if (hasError) {
    return 'Not found';
  }
  if (isFetching) {
    return instance.id;
  }
  return instance.name;
};

interface ListItemProps {
  index?: number;
  instanceId: string;
  readOnly: boolean;
  disabled: boolean;
  isCircular: boolean;
  enablePointerEvents: boolean;
  onClick?: (index?: number) => void;
  onDelete?: (index?: number) => void;
  onDragEnd?: () => void;
  onDragStart?: (index?: number) => void;
  onDrop?: (droppedIndex?: number) => void;
  onKeyDown?: (value: Value, e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus?: (index?: number) => void;
  onBlur?: () => void;
  fetchLabel: boolean;
}

const ListItem = observer(({ index, instanceId, readOnly, disabled, isCircular, enablePointerEvents, onClick, onDelete, onDragEnd, onDragStart, onDrop, onKeyDown, onFocus, onBlur, fetchLabel }: ListItemProps) => {

  const classes = useStyles();

  const { instanceStore } = useStores();

  useEffect(() => {
    if (fetchLabel) {
      instanceStore.createInstanceOrGet(instanceId)?.fetchLabel();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, fetchLabel]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onClick && onClick(index);
    }
  };

  const handleDelete = (e: MouseEvent<SVGSVGElement>) => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onDelete && onDelete(index);
    }
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onDragEnd && onDragEnd();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onDragStart && onDragStart(index);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onDrop && onDrop(index);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onKeyDown && onKeyDown(index, e); //TODO: Fix me. This is not working.
    }
  };

  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFocus && onFocus(index);
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onBlur && onBlur();
  };


  const instance = instanceStore.instances.get(instanceId);

  const hasError = !instance || instance.fetchError || instance.fetchLabelError;
  const isFetching = instance && (instance.isFetching || instance.isLabelFetching);
  const label = getLabel(instance, !!hasError, isFetching);
  const isDisabled = disabled || isCircular;

  if (readOnly) {

    if (isCircular) {
      return (
        <span className={`${classes.value} ${classes.circular}`}title="This link points to itself!" >{label}</span>
      );
    }

    if (!enablePointerEvents) {
      return (
        <span className={classes.value}>{label}</span>
      );
    }

    return (
      <div className={`btn btn-xs btn-default ${classes.valueTag}  ${isDisabled? 'disabled' : ''} ${hasError ? classes.notFound : ''}`}
        disabled={isDisabled}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        title={label}
      >{label}
      </div>
    );
  }

  if (isCircular) {
    return (
      <div
        tabIndex={0}
        className={`btn btn-xs btn-default ${classes.valueTag} ${classes.circular} ${hasError ? classes.notFound : ''}`}
        disabled={isDisabled}
        draggable={!isDisabled}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        title="This link points to itself!"
      >
        <span className={classes.valueLabel}>{label}</span>
        {!disabled && <FontAwesomeIcon className={classes.remove} icon="times" onClick={handleDelete} />}
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      className={`btn btn-xs btn-default ${classes.valueTag} ${isDisabled ? 'disabled' : ''} ${hasError ? classes.notFound : ''}`}
      disabled={isDisabled}
      draggable={!isDisabled}
      onClick={handleClick}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      title={label}
    >
      <span className={classes.valueLabel}>{label}</span>
      {!disabled && <FontAwesomeIcon className={classes.remove} icon="times" onClick={handleDelete} />}
    </div>
  );
});
ListItem.displayName = 'ListItem';

export default ListItem;