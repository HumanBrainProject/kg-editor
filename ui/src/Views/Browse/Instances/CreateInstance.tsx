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

import {faCircle} from '@fortawesome/free-solid-svg-icons/faCircle';
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';
import useStores from '../../../Hooks/useStores';

const useStyles = createUseStyles({
  createInstanceButton: {
    padding: '5px 20px',
    background: 'var(--bg-color-ui-contrast2)',
    color: 'var(--ft-color-normal)',
    margin: '-16px 10px 0 10px',
    display: 'inline-block',
    border: '1px solid var(--border-color-ui-contrast1)',
    cursor: 'pointer',
    transition: 'border 0.25s ease',
    '&:hover': {
      background: 'var(--list-bg-hover)',
      borderColor: 'transparent',
      '& $createInstanceIcon path': {
        fill: 'rgba(255,255,255,0.6)'
      },
      '& $createInstanceText': {
        color: 'var(--ft-color-loud)'
      }
    }
  },
  createInstanceIcon: {
    display: 'inline-block',
    fontSize: '2em',
    '& path': {
      fill: 'rgba(255,255,255,0.4)',
      stroke: 'rgba(200,200,200,.1)',
      strokeWidth: '3px',
      transition: 'fill 0.25s ease'
    }
  },
  createInstanceText: {
    display: 'inline-block',
    fontSize: '1.2em',
    paddingLeft: '10px',
    color: 'var(--ft-color-normal)',
    transform: 'translateY(-5px)',
    transition: 'color 0.25s ease',
    '& span': {
      whiteSpace: 'nowrap'
    }
  }
});

const CreateInstance = observer(({ onCreateInstance }: {onCreateInstance: () => void}) => {

  const classes = useStyles();

  const { appStore, browseStore } = useStores();

  const selectedType = browseStore.selectedType;

  if (!selectedType) {
    return null;
  }

  const canCreate =
    appStore.currentSpacePermissions.canCreate &&
    selectedType.canCreate !== false &&
    selectedType.isSupported; // We are allowed to create unless canCreate is explicitly set to false and there are fields

  if (!canCreate) {
    return null;
  }

  return (
    <div
      className={classes.createInstanceButton}
      onClick={onCreateInstance}
    >
      <div className={classes.createInstanceIcon}>
        <FontAwesomeIcon icon={faPlus} />
      </div>
      <div className={classes.createInstanceText}>
        Create a new&nbsp;
        <span><FontAwesomeIcon
          fixedWidth
          icon={faCircle}
          style={selectedType.color?{ color: selectedType.color }:undefined}
        />
        &nbsp;{selectedType.label}</span>
      </div>
    </div>
  );
});
CreateInstance.displayName = 'CreateInstance';

export default CreateInstance;