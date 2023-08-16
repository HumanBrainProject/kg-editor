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

import {faAngleDoubleRight} from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight';
import {faCircleNotch} from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { createUseStyles } from 'react-jss';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorModal from '../../../Components/ErrorModal';
import SpinnerModal from '../../../Components/SpinnerModal';
import useMoveInstanceMutation from '../../../Hooks/useMoveInstanceMutation';
import useStores from '../../../Hooks/useStores';
import Matomo from '../../../Services/Matomo';
import { ReleaseStatus } from '../../../types';
import type Instance from '../../../Stores/Instance';
import type { Status as StatusProp } from '../../../Stores/StatusStore';
import type { ChangeEvent } from 'react';

const useStyles = createUseStyles({
  title: {
    display: 'inline'
  },
  selector: {
    display: 'inline-block',
    position: 'relative',
    margin: '0 4px 12px 10px',
    background: 'var(--bg-color-ui-contrast4)',
    '& select': {
      background: 'transparent',
      border: 0,
      margin: 0,
      padding: '4px 25px 4px 6px',
      lineHeight: '1.2',
      fontSize: '1.5rem',
      '-webkit-appearance': 'none',
      cursor: 'pointer',
      color: 'inherit',
      '&[disabled]': {
        cursor: 'not-allowed'
      }
    },
    '&:before': {
      content: '" "',
      display: 'block',
      position: 'absolute',
      top: '50%',
      right: '10px',
      transform: 'translateY(-3px)',
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid var(--ft-color-normal)',
      cursor: 'pointer',
      pointerEvents: 'none'
    }
  },
  error: {
    color: 'var(--ft-color-error)'
  },
  btn: {
    '&[disabled]': {
      cursor: 'not-allowed'
    }
  }
});

interface StatusProps {
  status?: StatusProp;
  fetchStatus: () => void;
  onClick: () => void;
  classes: any;
  variant: string;
  isDisabled: boolean;
}

const Status = observer(({
  status,
  fetchStatus,
  onClick,
  classes,
  variant,
  isDisabled
}: StatusProps) => {
  if (status?.hasFetchError) {
    return (
      <div className={classes.error}>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        &nbsp;&nbsp;{status.fetchError}&nbsp;&nbsp;
        <Button variant="primary" onClick={fetchStatus}>
          <FontAwesomeIcon icon={faRedoAlt} />
          &nbsp;Retry
        </Button>
      </div>
    );
  }
  if (!status?.isFetched) {
    return (
      <>
        <FontAwesomeIcon icon={faCircleNotch} spin />
        &nbsp;&nbsp;Retrieving instance release status
      </>
    );
  }
  return (
    <>
      {status.data !== ReleaseStatus.UNRELEASED && (
        <ul>
          <li>
            This instance has been released and therefore cannot be moved.
          </li>
          <li>If you still want to move it you first have to unrelease it.</li>
        </ul>
      )}
      <Button
        variant={variant}
        disabled={isDisabled}
        className={classes.btn}
        onClick={onClick}
      >
        <FontAwesomeIcon icon={faAngleDoubleRight} /> &nbsp; Move this
        instance
      </Button>
    </>
  );
});

interface MoveInstanceProps {
  instance: Instance;
  className: string;
}

const MoveInstance = observer(({ instance, className }: MoveInstanceProps) => {

  const classes = useStyles();

  const { appStore, statusStore, browseStore, viewStore, userProfileStore } = useStores();

  const navigate = useNavigate();
  const location = useLocation();

  const [moveInstanceTrigger, moveInstanceResult] = useMoveInstanceMutation();

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance.id]);

  const fetchStatus = () => {
    if(instance.id) {
      statusStore.fetchStatus(instance.id);
    }
  };

  const [spaceId, setSpaceId] = useState(appStore.currentSpace?.id as string);

  const permissions = instance.permissions;
  const status = statusStore.getInstance(instance.id);

  if (!status) {
    return null;
  }

  const spaces = userProfileStore.spaces?.filter((s) => {
    if (s.id === appStore.currentSpace?.id) {
      return true;
    }
    if (
      !s.id.startsWith('private-') ||
      appStore.currentSpace?.id.startsWith('private-')
    ) {
      // only instance in a private space can be moved to another private space
      return s.permissions.canCreate;
    }
    return false;
  });

  const handleSetSpaceId = (e: ChangeEvent<HTMLSelectElement>) => setSpaceId(e.target.value);

  const handleMoveInstance = () => {
    Matomo.trackEvent('Instance', 'Move', instance.id);
    moveInstance();
  };

  const moveInstance = async () => {
    const payload = instance.payload;
    const labelField = instance.labelField;
    if(labelField) {
      payload[labelField] = `${payload[labelField]} (Copy)`;
    }
    const { error } = await moveInstanceTrigger({
      instanceId: instance.id,
      space: spaceId
    });
    if (!error) {
      browseStore.refreshFilter();
      viewStore.unregisterViewByInstanceId(instance.id);
      appStore.flush();
      await appStore.switchSpace(location, navigate, spaceId);
      navigate(`/instances/${instance.id}`);
    }
  };

  const variant = spaceId === appStore.currentSpace?.id ? 'secondary' : 'warning';
  const isDisabled = status.data !== ReleaseStatus.UNRELEASED || spaceId === appStore.currentSpace?.id;

  return (
    <>
      {permissions?.canDelete && spaces && spaces.length > 1 && (
        <div className={className}>
          <div>
            <h4 className={classes.title}>Move this instance to space</h4>
            <div className={classes.selector}>
              <select
                title="space"
                value={spaceId}
                onChange={handleSetSpaceId}
                disabled={!status || status.data !== ReleaseStatus.UNRELEASED}
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Status
            status={status}
            fetchStatus={fetchStatus}
            onClick={handleMoveInstance}
            classes={classes}
            variant={variant}
            isDisabled={isDisabled}
          />
        </div>
      )}
      <ErrorModal show={moveInstanceResult.isError} text={moveInstanceResult.error as string} onCancel={moveInstanceResult.reset} onRetry={moveInstance} />
      <SpinnerModal show={moveInstanceResult.isTriggering} text={`Moving instance "${instance.id}" to space "${spaceId}" ...`} />
    </>
  );
});

export default MoveInstance;
