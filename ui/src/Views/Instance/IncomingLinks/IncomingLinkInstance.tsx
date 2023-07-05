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
import React from 'react';
import Badge from 'react-bootstrap/Badge';
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from 'react-router-dom';

import useStores from '../../../Hooks/useStores';
import type { InstanceLabel } from '../../../types';

const useStyles = createUseStyles({
  pill: {
    cursor: 'pointer',
    '& > .rounded-pill': {
      whiteSpace: 'break-spaces'
    }
  },
  isForbidden: {
    cursor: 'not-allowed'
  }
});

interface IncomingLinkInstanceProps {
  instance: InstanceLabel;
  readMode: boolean;
}


const IncomingLinkInstance = observer(({instance, readMode }: IncomingLinkInstanceProps) => {

  const classes = useStyles();

  const { userProfileStore, appStore, instanceStore } = useStores();

  const location = useLocation();
  const navigate = useNavigate();

  let label = instance.label?instance.label:instance.id; // TODO: Fix this one. Where is the label calculated ?

  if (instance.space === appStore.currentSpace?.id && instanceStore.instances.has(instance.id)) {
    label = instanceStore.instances.get(instance.id)?.name;
  }

  const isForbidden = !userProfileStore.hasSpace(instance.space);

  if (readMode || isForbidden) {
    return (
      <span className={isForbidden?classes.isForbidden:''} title={isForbidden?'You don\'t have the permission to access this instance!': undefined}>
        <Badge pill bg="secondary" >
          {label}
        </Badge>
      </span>
    );
  }

  const handleOpenInstance = () => {
    if(appStore.currentSpace?.id !== instance.space) {
      appStore.switchSpace(location, navigate, instance.space);
    }
    navigate(`/instances/${instance.id}`);
  };

  return (
    <span className={classes.pill} title={instance.space}>
      <Badge pill bg="secondary" onClick={handleOpenInstance} >
        {label}
      </Badge>
    </span>
  );

});
IncomingLinkInstance.displayName = 'IncomingLinkInstance';

export default IncomingLinkInstance;