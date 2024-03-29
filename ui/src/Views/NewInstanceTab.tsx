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

import {faFile} from '@fortawesome/free-solid-svg-icons/faFile';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import Modal from '../Components/Modal';
import Tab from '../Components/Tab';
import useStores from '../Hooks/useStores';
import Matomo from '../Services/Matomo';
import TypeSelection from './Instance/TypeSelection';
import type { StructureOfType } from '../types';


const NewInstanceTab = observer(() => {
  const [showTypeSelection, setShowTypeSelection] = useState(false);

  const { appStore, typeStore } = useStores();
  const navigate = useNavigate();

  const handleCreateInstance = () => {
    Matomo.trackEvent('Tab', 'CreateInstance');
    setShowTypeSelection(true);
  };

  const handleTypeSelection = (type: StructureOfType) => {
    setShowTypeSelection(false);
    const uuid = uuidv4();
    navigate(`/instances/${uuid}/create?space=${appStore.currentSpaceName}&type=${encodeURIComponent(type.name)}`);
  };

  const handleClose = () => setShowTypeSelection(false);

  const canCreate = appStore.currentSpacePermissions.canCreate && typeStore.hasCanCreateTypes;

  if (!canCreate) {
    return null;
  }

  const types: StructureOfType[] = appStore.currentSpacePermissions.canCreate?typeStore.canCreateTypes:[];

  return (
    <>
      <Tab icon={faFile} onClick={handleCreateInstance} hideLabel label="New instance" />
      <Modal show={showTypeSelection} onHide={handleClose}>
        <Modal.Header title="Create a new instance" />
        <Modal.Body>
          <TypeSelection types={types} onSelect={handleTypeSelection} />
        </Modal.Body>
      </Modal>
    </>
  );
});
NewInstanceTab.displayName = 'NewInstanceTab';

export default NewInstanceTab;

