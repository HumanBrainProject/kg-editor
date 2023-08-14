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
import {faMinus} from '@fortawesome/free-solid-svg-icons/faMinus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';
import ErrorModal from '../../../Components/ErrorModal';
import SpinnerModal from '../../../Components/SpinnerModal';
import useRemoveTypeFromSpaceMutation from '../../../Hooks/useRemoveTypeFromSpaceMutation';
import useStores from '../../../Hooks/useStores';
import Matomo from '../../../Services/Matomo';
import type { StructureOfType } from '../../../types';

const useStyles = createUseStyles({
  removeTypeFromSpaceButton: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    //border: "1px solid rgba(0, 0, 0, 0.4)",
    border: '1px solid var(--ft-color-normal)',
    borderRadius: '10px',
    padding: '0 20px',
    //background: "rgba(0, 0, 0, 0.4)",
    background: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'border 0.25s ease',
    '&:hover': {
      border: '1px solid var(--ft-color-loud)',
      '& $removeTypeFromSpaceIcon path': {
        fill: 'rgba(255,255,255,0.6)'
      },
      '& $removeTypeFromSpaceText': {
        color: 'var(--ft-color-loud)'
      }
    }
  },
  removeTypeFromSpaceIcon: {
    fontSize: '5em',
    '& path': {
      //fill:"var(--bg-color-blend-contrast1)",
      fill: 'rgba(255,255,255,0.4)',
      stroke: 'rgba(200,200,200,.1)',
      strokeWidth: '3px',
      transition: 'fill 0.25s ease'
    }
  },
  removeTypeFromSpaceText: {
    fontSize: '1.5em',
    paddingLeft: '10px',
    //color: "rgba(0,0,0,0.4)",
    color: 'var(--ft-color-normal)',
    fontWeight: '800',
    transition: 'color 0.25s ease',
    '& span': {
      whiteSpace: 'nowrap'
    }
  }
});

const RemoveTypeFromSpace = observer(() => {

  const classes = useStyles();

  const { appStore, browseStore, typeStore } = useStores();

  const [removeTypeFromSpaceTrigger, removeTypeFromSpaceResult] = useRemoveTypeFromSpaceMutation();

  const selectedType = browseStore.selectedType;

  const removeTypeFromSpace = async () => {
    const type = selectedType?.name as string;
    const space = appStore.currentSpace?.id as string;
    const { error: removeTypeError} = await removeTypeFromSpaceTrigger({
      type: type,
      space: space
    });
    if (!removeTypeError) {
      if (type === browseStore.selectedType?.name) {
        browseStore.clearSelectedType();
      }
      typeStore.removeType(space, selectedType as StructureOfType);
    }
  };

  const handleRemoveType = () => {
    Matomo.trackEvent('Space', 'RemoveType', `remove type "${selectedType?.name}" from space "${appStore.currentSpace?.id}"`);
    removeTypeFromSpace();
  };

  if (!appStore.currentSpace) {
    return null;
  }

  const canManageSpace = appStore.currentSpace.permissions.canManageSpace;

  if (!canManageSpace) {
    return null;
  }

  if (!selectedType) {
    return null;
  }

  if (browseStore.instancesFilter || browseStore.instances.length !== 0) {
    return null;
  }

  if (removeTypeFromSpaceResult.isError) {
    return (
      <ErrorModal show={true} text={`Failed to add type "${selectedType.label}" to space "${appStore.currentSpace.name}" ("${removeTypeFromSpaceResult.error}")!`} onCancel={removeTypeFromSpaceResult.reset} onRetry={removeTypeFromSpace} />
    );
  }

  if (removeTypeFromSpaceResult.isTriggering) {
    return (
      <SpinnerModal text={`Removing type "${selectedType.label}" from space "${appStore.currentSpace.name}"...`} />
    );
  }

  return (
    <div className={classes.removeTypeFromSpaceButton} onClick={handleRemoveType} >
      <div className={classes.removeTypeFromSpaceIcon}>
        <FontAwesomeIcon icon={faMinus} />
      </div>
      <div className={classes.removeTypeFromSpaceText}>
        Remove type&nbsp;
        <span><FontAwesomeIcon
          fixedWidth
          icon={faCircle}
          style={selectedType.color?{ color: selectedType.color }:undefined}
        />
        &nbsp;{selectedType.label}</span> from space&nbsp;{appStore.currentSpace.name}
      </div>
    </div>
  );
});
RemoveTypeFromSpace.displayName = 'RemoveTypeFromSpace';

export default RemoveTypeFromSpace;