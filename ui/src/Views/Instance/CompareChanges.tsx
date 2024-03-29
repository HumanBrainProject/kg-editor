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

import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';

import useStores from '../../Hooks/useStores';
import { createInstanceStore } from '../../Stores/InstanceStore';
import CompareFieldsChanges from './CompareFieldsChanges';
import type InstanceStore from '../../Stores/InstanceStore';

const useStyles = createUseStyles({
  container: {
    padding: '12px 15px'
  }
});

interface CompareChangesProps {
  instanceId?: string;
  onClose: () => void;
}

const CompareChanges = observer(({ instanceId, onClose }: CompareChangesProps) => {

  const classes = useStyles();

  const [savedInstanceStore, setSavedInstanceStore] = useState<InstanceStore>();

  const rootStore = useStores();
  const { instanceStore } = rootStore;

  useEffect(() => {
    if(!savedInstanceStore){
      const store = createInstanceStore(instanceStore.api, rootStore);
      setSavedInstanceStore(store);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(savedInstanceStore) {
      const savedInst = instanceId ? savedInstanceStore.createInstanceOrGet(instanceId): undefined;
      const inst = instanceId ? instanceStore.instances.get(instanceId): undefined;
      const data = inst?.cloneInitialData;
      savedInst && inst && savedInst.initializeData(savedInstanceStore.api, inst.store.rootStore, data);
    }
    return () => {
      savedInstanceStore && savedInstanceStore.flush();
    };
  }, [instanceStore.api, instanceStore.instances, savedInstanceStore, instanceId]);


  const instance = instanceId ? instanceStore.instances.get(instanceId): undefined;
  const savedInstance = savedInstanceStore && instanceId && savedInstanceStore.instances.get(instanceId);
  if (!instance || !savedInstance) {
    return null;
  }

  return(
    <div className={classes.container}>
      <CompareFieldsChanges
        instanceId={instanceId}
        leftInstance={savedInstance}
        rightInstance={instance}
        leftInstanceStore={instanceStore}
        rightInstanceStore={instanceStore}
        leftChildrenIds={savedInstance.childrenIds}
        rightChildrenIds={instance.childrenIds}
        onClose={onClose}
      />
    </div>
  );
});
CompareChanges.displayName = 'CompareChanges';

export default CompareChanges;