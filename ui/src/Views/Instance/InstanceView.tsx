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

import {observer} from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';

import useStores from '../../Hooks/useStores';
import { ViewContext} from '../../Stores/ViewStore';

import InstanceForm from './InstanceForm';
import Links from './Links';
import Pane from './Pane';
import type { CSSProperties } from 'react';

const useStyles = createUseStyles({
  container: {
    height: '100%',
    width: '100%',
    display: 'grid',
    position:'relative',
    overflow: 'hidden',
    '--selected-index':'0'
  }
});

const InstanceView = observer(({ instance }: { instance: any}) => {

  const classes = useStyles();

  const { viewStore } = useStores();

  if (!viewStore.selectedView ||  viewStore.selectedView.instanceId !== instance.id) {
    return null;
  }

  const indexStyle: CSSProperties = {
    '--selected-index': viewStore.selectedView.selectedPaneIndex,
  } as CSSProperties;

  return (
    <ViewContext.Provider value={viewStore.selectedView} >
      <div className={classes.container} style={indexStyle}>
        <Pane paneId={instance.id} >
          <InstanceForm view={viewStore.selectedView} pane={instance.id} id={instance.id} />
        </Pane>
        <Links instanceId={instance.id} />
      </div>
    </ViewContext.Provider>
  );
});
InstanceView.displayName = 'InstanceView';

export default InstanceView;