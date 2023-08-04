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
import uniqueId from 'lodash/uniqueId';
import { observer } from 'mobx-react-lite';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import useStores from '../../Hooks/useStores';
import Matomo from '../../Services/Matomo';
import type { StructureOfType } from '../../types';
import type { MouseEvent } from 'react';

const useStyles = createUseStyles({
  container: {
    padding: '5px 5px 5px 30px',
    borderLeft: '2px solid transparent',
    color: 'var(--ft-color-normal)',
    cursor: 'pointer',
    position: 'relative',
    '&:hover': {
      background: 'var(--list-bg-hover)',
      borderColor: 'var(--list-border-hover)',
      color: 'var(--ft-color-loud)',
      '& $cannotCreateTooltip': {
        opacity: 0.75
      },
      '& $actions': {
        opacity: 0.75
      },
      '& $createInstance': {
        position: 'absolute',
        top: '0',
        right: '0',
        height: '100%',
        padding: '5px 10px',
        display: 'block',
        color: 'var(--ft-color-normal)',
        '&:hover': {
          color: 'var(--ft-color-loud)'
        }
      }
    },
    '&.selected': {
      background: 'var(--list-bg-selected)',
      borderColor: 'var(--list-border-selected)',
      color: 'var(--ft-color-loud)'
    },
    '&.edited': {
      padding: '0 5px 0 30px'
    },
    '&.disabled': {
      pointerEvents: 'none',
      opacity: '0.8'
    }
  },
  icon: {
    position: 'absolute',
    top: '8px',
    '& + span': {
      display: 'inline-block',
      marginLeft: '22px'
    }
  },
  cannotCreateTooltip: {
    position: 'absolute',
    top: '5px',
    right: '15px',
    opacity: 0,
    '&:hover': {
      opacity: '1 !important'
    }
  },
  actions: {
    position: 'absolute',
    top: '2px',
    right: '10px',
    display: 'grid',
    opacity: 0,
    width: '25px',
    gridTemplateColumns: 'repeat(1, 1fr)',
    '&:hover': {
      opacity: '1 !important'
    }
  },
  action: {
    fontSize: '0.9em',
    lineHeight: '27px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-color-ui-contrast2)',
    color: 'var(--ft-color-normal)',
    '&:hover': {
      color: 'var(--ft-color-loud)'
    },
    '&:first-child': {
      borderRadius: '4px 0 0 4px'
    },
    '&:last-child': {
      borderRadius: '0 4px 4px 0'
    },
    '&:first-child:last-child': {
      borderRadius: '4px'
    }
  },
  deleteBookmarkDialog: {
    position: 'absolute',
    top: 0,
    right: '-200px',
    transition: 'right .2s ease',
    '&.show': {
      right: '5px'
    }
  },
  error: {
    position: 'absolute',
    top: '5px',
    right: '10px'
  },
  errorButton: {
    color: 'var(--ft-color-error)'
  },
  textError: {
    margin: 0,
    wordBreak: 'keep-all'
  },
  createInstance: {
    display: 'none',
    cursor: 'pointer'
  },
  infoCircle: {
    marginLeft: '5px',
    transform: 'translateY(2px)'
  }
});

interface CreateInstanceProps {
  canCreate: boolean;
  isCreatingNewInstance: boolean;
  classes: any;
  onClick: () => void; // TODO: fix me
  cannotCreateTooltip?: string;
  label: string;
}

const CreateInstance = observer(({
  canCreate,
  isCreatingNewInstance,
  classes,
  onClick,
  cannotCreateTooltip,
  label
}: CreateInstanceProps) => {
  if (canCreate) {
    if (isCreatingNewInstance) {
      return (
        <div className={classes.createInstance}>
          <FontAwesomeIcon icon={'circle-notch'} spin />
        </div>
      );
    }
    return (
      <div className={classes.actions}>
        <div
          className={classes.action}
          onClick={onClick}
          title={`create a new ${label}`}
        >
          <FontAwesomeIcon icon={'plus'} />
        </div>
      </div>
    );
  }
  return (
    <div className={classes.cannotCreateTooltip}>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={uniqueId('cannotCreate-tooltip')}>
            {cannotCreateTooltip}
          </Tooltip>
        }
      >
        <span>
          <FontAwesomeIcon icon="question-circle" />
        </span>
      </OverlayTrigger>
    </div>
  );
});

interface TypesItemProps {
  type: StructureOfType;
}

const TypesItem = observer(({ type }: TypesItemProps) => {
  const classes = useStyles();

  const { appStore, browseStore } = useStores();
  const navigate = useNavigate();

  const handleSelect = (e: MouseEvent<HTMLDivElement> ) => {
    e && e.stopPropagation();
    Matomo.trackEvent('Browse', 'SelectType', type.name);
    browseStore.selectType(type);
  };

  const handleCreateInstance = () => {
    Matomo.trackEvent('Browse', 'CreateInstance', type.name);
    const uuid = uuidv4();
    navigate(`/instances/${uuid}/create?space=${appStore.currentSpaceName}&type=${encodeURIComponent(type.name)}`);
  };

  const selected =
    browseStore.selectedType && type
      ? browseStore.selectedType.name === type.name
      : false;
  const color = type.color;
  const canCreate = appStore.currentSpacePermissions.canCreate && type.canCreate !== false && type.isSupported; // We are allowed to create unless canCreate is explicitly set to false and there are fields

  let cannotCreateTooltip = undefined;
  if (!appStore.currentSpacePermissions.canCreate) {
    cannotCreateTooltip = `You are not allowed to create a new ${type.label} in space ${appStore.currentSpaceName}.`;
  } else if (!type.canCreate) {
    cannotCreateTooltip = `You are not allowed to create a new ${type.label} in the editor.`;
  }

  return (
    <div
      key={type.name}
      className={`${classes.container} ${selected ? 'selected' : ''} ${
        browseStore.isFetching ? 'disabled' : ''
      }`}
      onClick={handleSelect}
      title={type.description ? type.description : type.name}
    >
      <FontAwesomeIcon
        fixedWidth
        icon={color?'circle':'code-branch'}
        className={classes.icon}
        style={color?{ color: color }:undefined}
      />
      <span>
        {type.label}
        {type.description && (
          <FontAwesomeIcon className={classes.infoCircle} icon="info-circle" />
        )}
      </span>
      <CreateInstance
        canCreate={!!canCreate}
        isCreatingNewInstance={appStore.isCreatingNewInstance}
        classes={classes}
        onClick={handleCreateInstance}
        cannotCreateTooltip={cannotCreateTooltip}
        label={type.label}
      />
    </div>
  );
});
TypesItem.displayName = 'TypesItem';

export default TypesItem;
