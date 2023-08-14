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

import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';
import useStores from '../../../Hooks/useStores';
import Matomo from '../../../Services/Matomo';
import { ViewMode } from '../../../types';
import InstanceRow from '../../Instance/InstanceRow';
import type { Instance } from '../../../Stores/Instance';

const useStyles = createUseStyles({
  list: {
    '& ul': {
      listStyleType: 'none',
      padding: '1px 11px 1px 11px'
    }
  }
});

const InstancesList = observer(() => {

  const classes = useStyles();

  const navigate = useNavigate();

  const { appStore, browseStore, instanceStore, typeStore } = useStores();

  const handleInstanceClick = (instance: Instance) => {
    Matomo.trackEvent('Browse', 'InstancePreview', instance.id);
    browseStore.selectInstance(instance);
  };

  const handleInstanceCtrlClick = (instance: Instance) => {
    if (instance?.id) {
      Matomo.trackEvent('Browse', 'InstanceOpenTabInBackground', instance.id);
      const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);
      appStore.openInstance(
        instance.id,
        instance.name,
        instance.primaryType,
        isTypesSupported ? ViewMode.VIEW : ViewMode.RAW
      );
    }
  };

  const handleInstanceActionClick = (
    instance: Instance,
    mode: string
  ) => {
    const id = instance.id;
    if (!instanceStore.instances.has(id)) {
      const instance = instanceStore.createInstanceOrGet(id);
      if (instance) {
        instance.initializeLabelData(toJS(instance));
      }
    }
    Matomo.trackEvent(
      'Browse',
      `InstanceOpenTabIn${mode[0].toUpperCase() + mode.substring(1)}Mode`,
      id
    );
    if (mode === 'view') {
      navigate(`/instances/${id}`);
    } else {
      navigate(`/instances/${id}/${mode}`);
    }
  };

  return (
    <div className={classes.list}>
      <ul>
        {browseStore.instances.map(instance => (
          <li key={instance.id}>
            <InstanceRow
              instance={instance}
              selected={instance === browseStore.selectedInstance}
              onClick={handleInstanceClick}
              onCtrlClick={handleInstanceCtrlClick}
              onActionClick={handleInstanceActionClick}
            />
          </li>
        ))}
      </ul>
    </div>
  );
});
InstancesList.displayName = 'InstancesList';

export default InstancesList;
