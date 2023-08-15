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

import {faCircleNotch} from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import ErrorModal from '../../Components/ErrorModal';
import Modal from '../../Components/Modal';
import SpinnerModal from '../../Components/SpinnerModal';
import useAddTypesToSpaceMutation from '../../Hooks/useAddTypesToSpaceMutation';
import useListAvailableTypesQuery from '../../Hooks/useListAvailableTypesQuery';
import useStores from '../../Hooks/useStores';
import Matomo from '../../Services/Matomo';
import TypeSelection from '../Instance/TypeSelection';
import type { Space as SpaceType, StructureOfType } from '../../types';

const useStyles = createUseStyles({
  errorPnl: {
    display: 'inline-block',
    marginLeft: '4px',
    textTransform: 'none'
  },
  error: {
    display: 'flex'
  },
  errorIcon: {
    color: 'var(--ft-color-error)'
  },
  errorText: {
    display: 'inline-block',
    marginLeft: '4px',
    color: 'var(--ft-color-error)'
  },
  retryButton: {
    alignSelf: 'flex-start',
    display: 'inline-block',
    fontSize: '0.9em',
    lineHeight: '27px',
    textAlign: 'center',
    borderRadius: '4px',
    padding: '0 8px',
    marginLeft: '4px',
    background: 'var(--bg-color-ui-contrast2)',
    color: 'var(--ft-color-normal)',
    border: '1px solid var(--border-color-ui-contrast1)',
    transition: 'border 0.25s ease',
    '&:hover': {
      background: 'var(--list-bg-hover)',
      borderColor: 'transparent',
      '& $retryIcon path': {
        fill: 'rgba(255,255,255,0.6)'
      }
    }
  },
  retryIcon: {},
  spinner: {
    display: 'inline-block',
    marginLeft: '4px'
  },
  info: {
    display: 'inline-block',
    marginLeft: '4px'
  },
  addTypeButton: {
    display: 'inline-block',
    fontSize: '0.9em',
    lineHeight: '27px',
    textAlign: 'center',
    borderRadius: '4px',
    padding: '0 8px',
    marginLeft: '4px',
    background: 'var(--bg-color-ui-contrast2)',
    color: 'var(--ft-color-normal)',
    border: '1px solid var(--border-color-ui-contrast1)',
    transition: 'border 0.25s ease',
    cursor: 'pointer',
    '&:hover': {
      background: 'var(--list-bg-hover)',
      borderColor: 'transparent',
      '& $addTypeIcon path': {
        fill: 'rgba(255,255,255,0.6)'
      }
    }
  },
  addTypeIcon: {}
});

const AvaiableTypes = observer(() => {

  const classes = useStyles();

  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [selectedType, setSelectedType] = useState<undefined|StructureOfType>(undefined);

  const { appStore, typeStore,  browseStore } = useStores();

  const canManageSpace = !!appStore.currentSpace?.permissions.canManageSpace;

  const space = (appStore.currentSpace as SpaceType|null)?.id??'';

  const isTypesReady = !!space && typeStore.space === space;

  const isAvailableTypesEnabled = canManageSpace && isTypesReady && typeStore.isAvailableTypesEnabled;

  const listAvailableTypes = useListAvailableTypesQuery(space, isAvailableTypesEnabled);

  const [addTypesToSpaceTrigger, addTypesToSpaceResult] = useAddTypesToSpaceMutation();

  useEffect(() => {
    if (listAvailableTypes.isSuccess && listAvailableTypes.data) {
      typeStore.setAvailableTypes(space, listAvailableTypes.data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space, listAvailableTypes.isSuccess, listAvailableTypes.data]);


  const addTypesToSpace = async (types: string[], space: string) => {
    const {data: relatedTypes, error: addTypeError} = await addTypesToSpaceTrigger({
      types: types,
      space: space
    });
    if (relatedTypes && !addTypeError) {
      typeStore.addTypes(space, types, relatedTypes);
      const type = relatedTypes.find(t => t.name === types[0]);
      if (type) {
        browseStore.selectType(type);
      }
      setSelectedType(undefined);
    }
  };

  const handleAddType = () => {
    setShowTypeSelection(true);
  };

  const handleTypeSelection = (type: StructureOfType) => {
    setShowTypeSelection(false);
    setSelectedType(type);
    Matomo.trackEvent('Space', 'AddType', `add type "${type.name}" to space "${space}"`);
    addTypesToSpace([type.name], space);
  };

  const handleCloseTypeSelection = () => setShowTypeSelection(false);

  const handleCancelAddTypeToSpace = () => {
    setSelectedType(undefined);
    addTypesToSpaceResult.reset();
  };

  const handleRetryAddTypeToSpace = () => {
    addTypesToSpace([selectedType?.name as string], space);
  };

  if (addTypesToSpaceResult.isError) {
    return (
      <ErrorModal show={true} text={`Failed to add type "${selectedType?.label}" to space "${space}" ("${addTypesToSpaceResult.error}")!`} onCancel={handleCancelAddTypeToSpace} onRetry={handleRetryAddTypeToSpace} />
    );
  }

  if (addTypesToSpaceResult.isTriggering) {
    return (
      <SpinnerModal text={`Adding type "${selectedType?.label}" to space "${space}"...`} />
    );
  }

  if (listAvailableTypes.isError) {
    return (
      <div className={classes.errorPnl}>
        <div className={classes.error}>
          <span className={classes.errorIcon} >
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </span>
          <span className={classes.errorText}>Failed to retrieve types that could be added for space &quot;{space}&quot; (&quot;{listAvailableTypes.error}&quot;)!</span>
          <div className={classes.retryButton} onClick={listAvailableTypes.refetch} title="retry" >
            <FontAwesomeIcon icon={faRedoAlt} className={classes.retryIcon} />
          </div>
        </div>
      </div>
    );
  }

  if (canManageSpace && space && listAvailableTypes.isFetching) {
    return (
      <span className={classes.spinner} title={`Retrieving types that could be added for space "${space}"...`}>
        <FontAwesomeIcon icon={faCircleNotch} spin />
      </span>
    );
  }

  if (typeStore.availableTypes.length === 0) {
    return (
      <span className={classes.info} title={`space "${space}" contains the full list of available types.`}>
        <FontAwesomeIcon icon={faInfoCircle} />
      </span>
    );
  }

  if (isAvailableTypesEnabled) {
    return (
      <>
        <div className={classes.addTypeButton} onClick={handleAddType} title={`add a type to space "${appStore.currentSpaceName}"`}>
          <FontAwesomeIcon icon={faPlus} className={classes.addTypeIcon} />
        </div>
        <Modal show={showTypeSelection} onHide={handleCloseTypeSelection} >
          <Modal.Header title={`Add a type to space "${appStore.currentSpaceName}"`} closeButton={false} />
          <Modal.Body>
            <TypeSelection types={typeStore.availableTypes} onSelect={handleTypeSelection} />
          </Modal.Body>
        </Modal>
      </>
    );
  }

  return null;
});
AvaiableTypes.displayName = 'AvaiableTypes';

export default AvaiableTypes;