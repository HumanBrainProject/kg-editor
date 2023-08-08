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

import {faCopy} from '@fortawesome/free-solid-svg-icons/faCopy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import Button from 'react-bootstrap/Button';

import { useNavigate } from 'react-router-dom';
import useStores from '../../../Hooks/useStores';
import Matomo from '../../../Services/Matomo';
import type Instance from '../../../Stores/Instance';

interface DuplicateInstanceProps {
  instance: Instance;
  className: string;
}

const DuplicateInstance = observer(({ instance, className }: DuplicateInstanceProps) => {

  const { appStore, typeStore } = useStores();
  const navigate = useNavigate();

  const handleDuplicateInstance = () => {
    if(instance.id) {
      Matomo.trackEvent('Instance', 'Duplicate', instance.id);
      appStore.duplicateInstance(instance.id, navigate);
    }
  };

  const permissions = instance.permissions;


  const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);

  if (!permissions?.canCreate || !isTypesSupported) {
    return null;
  }

  return (
    <div className={className}>
      <h4>Duplicate this instance</h4>
      <ul>
        <li>Be careful. After duplication both instances will look the same.</li>
        <li>After duplication you should update the name &amp; description fields.</li>
      </ul>
      <Button variant={'primary'} onClick={handleDuplicateInstance}>
        <FontAwesomeIcon icon={faCopy} /> &nbsp; Duplicate this instance
      </Button>
    </div>
  );
});
DuplicateInstance.displayName = 'DuplicateInstance';

export default DuplicateInstance;