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
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons/faQuestionCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';

import ReleaseStatus from '../../Components/ReleaseStatus';
import useStores from '../../Hooks/useStores';
import type { Status as StatusProp } from '../../Stores/StatusStore';

const useStyles = createUseStyles({
  container: {
    fontSize: '0.75em',
    display: 'inline-block',
    '& > div:only-child': {
      display: 'block',
      position: 'relative',
      zIndex: '5'
    },
    '& > div:first-child:not(:only-of-type)': {
      display: 'block',
      position: 'relative',
      zIndex: '5',
      boxShadow: '0.2em 0.2em 0.1em var(--release-status-box-shadow)'
    },
    '& > div:not(:first-child)': {
      position: 'relative',
      top: '-0.3em',
      left: '0.6em',
      display: 'block',
      zIndex: '3'
    }
  },
  loader: {
    borderRadius: '0.14em',
    width: '2.5em',
    background: 'var(--bg-color-ui-contrast2)',
    textAlign: 'center',
    color: 'var(--ft-color-loud)',
    border: '1px solid var(--ft-color-loud)',
    '& .svg-inline--fa': {
      fontSize: '0.8em',
      verticalAlign: 'baseline'
    }
  }
});

interface InstanceStatusProps {
  instanceStatus?: StatusProp;
  classes: any;
  darkmode: boolean;
}

const InstanceStatus = observer(({ instanceStatus, classes, darkmode }: InstanceStatusProps) => {
  if (instanceStatus?.hasFetchError) {
    return (
      <div className={classes.loader}>
        <FontAwesomeIcon icon={faQuestionCircle} />
      </div>
    );
  }
  if (!instanceStatus?.isFetched) {
    return (
      <div className={classes.loader}>
        <FontAwesomeIcon icon={faCircleNotch} spin />
      </div>
    );
  }
  return (
    <ReleaseStatus darkmode={darkmode} instanceStatus={instanceStatus.data} />
  );
});

interface  InstanceChildrenStatusProps {
  instanceStatus?: StatusProp;
  classes: any;
  darkmode: boolean;
}

const InstanceChildrenStatus = observer(({ instanceStatus, classes, darkmode }: InstanceChildrenStatusProps) => {
  if (instanceStatus?.hasFetchErrorChildren) {
    return (
      <div className={classes.loader}>
        <FontAwesomeIcon icon={faQuestionCircle} />
      </div>
    );
  }

  if (!instanceStatus?.isFetchedChildren) {
    return (
      <div className={classes.loader}>
        <FontAwesomeIcon icon={faCircleNotch} spin />
      </div>
    );
  }
  return (
    <ReleaseStatus
      darkmode={darkmode}
      instanceStatus={instanceStatus.childrenData}
    />
  );
});

interface StatusProps {
  id?: string;
  darkmode: boolean;
}

const Status = observer(({ id, darkmode }: StatusProps) => {
  const classes = useStyles();

  const { statusStore } = useStores();

  useEffect(() => {
    if(id) {
      statusStore.fetchStatus(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const instanceStatus: StatusProp|undefined = id ? statusStore.getInstance(id): undefined;

  if (!instanceStatus) {
    return null;
  }

  return (
    <div className={`${classes.container} status`}>
      <InstanceStatus
        instanceStatus={instanceStatus}
        classes={classes}
        darkmode={darkmode}
      />
      <InstanceChildrenStatus
        instanceStatus={instanceStatus}
        classes={classes}
        darkmode={darkmode}
      />
    </div>
  );
});

export default Status;
