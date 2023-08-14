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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';
import useStores from '../../../Hooks/useStores';
import CreateFirstInstance from './CreateFirstInstance';
import RemoveTypeFromSpace from './RemoveTypeFromSpace';
import type { StructureOfType } from '../../../types';

const useStyles = createUseStyles({
  noInstancesPanel: {
    position: 'absolute !important',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-200px)',
    textAlign: 'center'
  },
  noInstancesText: {
    fontWeight: '300',
    fontSize: '1.2em'
  }
});

const NoInstance = observer(({ onCreateInstance }: {onCreateInstance: () => void}) => {

  const classes = useStyles();

  const { appStore, browseStore } = useStores();

  const selectedType = browseStore.selectedType as StructureOfType;

  const canCreate =
    appStore.currentSpacePermissions.canCreate &&
    selectedType.canCreate !== false &&
    selectedType.isSupported; // We are allowed to create unless canCreate is explicitly set to false and there are fields

  return (
    <div className={classes.noInstancesPanel}>
      <div className={classes.noInstancesText}>
        <p>
          No&nbsp;
          <FontAwesomeIcon
            fixedWidth
            icon={faCircle}
            style={selectedType.color?{ color: selectedType.color }:undefined}
          />
          &nbsp;{selectedType.label}&nbsp;
          {browseStore.instancesFilter
            ? `could be found with the search term "${browseStore.instancesFilter}"`
            : 'exists yet'}
          !
        </p>
        {!canCreate && (
          <p>
            You are currently not granted permission to create a&nbsp;{selectedType.label} in space&nbsp;{appStore.currentSpaceName}.
          </p>
        )}
      </div>
      <CreateFirstInstance onCreateInstance={onCreateInstance} />
      <RemoveTypeFromSpace />
    </div>
  );
});
NoInstance.displayName = 'NoInstance';

export default NoInstance;