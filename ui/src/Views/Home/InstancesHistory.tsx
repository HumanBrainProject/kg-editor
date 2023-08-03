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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';

import { useNavigate } from 'react-router-dom';
import PopOverButton from '../../Components/PopOverButton';
import useStores from '../../Hooks/useStores';
import Matomo from '../../Services/Matomo';
import InstanceRow from '../Instance/InstanceRow';

import type { Instance } from '../../Stores/Instance';
import type { ViewMode } from '../../types';
import type { ChangeEvent} from 'react';

const useStyles = createUseStyles({
  container: {
    color:'var(--ft-color-normal)',
    '& .header': {
      display: 'flex',
      margin: '25px 0 10px 0',
      '& h3': {
        flex: 1,
        margin: 0,
        '& .selector': {
          display: 'inline-block',
          position: 'relative',
          marginRight: '4px',
          '& select': {
            background: 'transparent',
            border: 0,
            margin: '0',
            padding: '0 25px 0 0',
            '-webkit-appearance': 'none',
            cursor: 'pointer',
            color: 'inherit'
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
        }
      },
      '& ul': {
        display: 'inline-block',
        margin: '6px 0 0 0',
        '& li': {
          display: 'inline-block',
          margin: '0 0 0 10px',
          '& input': {
            marginRight: '4px'
          }
        }
      }
    },
    '& ul': {
      listStyleType: 'none',
      paddingLeft: 0,
      '& li': {
      }
    }
  },
  message: {
    position: 'relative',
    width: '100%',
    padding: '15px',
    border: '1px solid var(--border-color-ui-contrast1)',
    background: 'var(--bg-color-ui-contrast2)',
    color: 'var(--ft-color-normal)'
  },
  noHistory: {
    extend: 'message'
  },
  retrieving: {
    extend: 'message',
    '& span': {
      paddingLeft: '10px'
    }
  },
  fetchError: {
    extend: 'message',
    '& span': {
      paddingLeft: '10px'
    }
  },
  textError: {
    margin: 0,
    wordBreak: 'keep-all',
    padding: '5px'
  }
});

interface InstancesHistoryBodyProps {
  onError: () => void;
}

const InstancesHistoryBody = observer(({ onError }: InstancesHistoryBodyProps) => {

  const classes = useStyles();

  const { appStore, historyStore, instanceStore } = useStores();
  const navigate = useNavigate();

  const handleInstanceClick = (instance: Instance) => {
    const id = instance && instance.id;
    if (id) {
      Matomo.trackEvent('Home', 'InstanceOpenTab', instance.id);
      navigate(`/instances/${id}`);
    }
  };

  const handleInstanceCtrlClick = (instance: Instance) => {
    const id = instance?.id;
    if (id) {
      Matomo.trackEvent('Home', 'InstanceOpenTabInBackground', instance.id);
      appStore.openInstance(id, instance.name, instance.primaryType);
    }
  };

  const handleInstanceActionClick = (historyInstance: Instance, mode: ViewMode) => {
    const id = historyInstance.id;
    if (!instanceStore.instances.has(id)) {
      const instance = instanceStore.createInstanceOrGet(id);
      if(instance) {
        instance.initializeLabelData(toJS(historyInstance));
      }
    }
    Matomo.trackEvent('Home', `InstanceOpenTabIn${mode[0].toUpperCase() + mode.substr(1)}Mode`, id);
    if(mode === 'view') {
      navigate(`/instances/${id}`);
    } else {
      navigate(`/instances/${id}/${mode}`);
    }
  };

  if (historyStore.isFetching) {
    return (
      <div className={classes.retrieving}><FontAwesomeIcon icon="circle-notch" spin/><span>Retrieving history instances...</span></div>
    );
  }

  if (historyStore.fetchError) {
    return (
      <div className={classes.fetchError}>
        <PopOverButton
          buttonTitle="retrieving history instances failed, click for more information"
          onOk={onError}
        >
          <h5 className={classes.textError}>{historyStore.fetchError}</h5>
        </PopOverButton>
        <span>retrieving history instances failed.</span>
      </div>
    );
  }

  if (!historyStore.instances.length) {
    return (
      <div className={classes.noHistory}>No instances matches your filters in your history.</div>
    );
  }

  return (
    <ul>
      {historyStore.instances.map(instance => (
        <li key={instance.id}>
          <InstanceRow instance={instance} selected={false} onClick={handleInstanceClick}  onCtrlClick={handleInstanceCtrlClick}  onActionClick={handleInstanceActionClick} />
        </li>
      ))}
    </ul>
  );
});
InstancesHistoryBody.displayName = 'InstancesHistoryBody';

interface InstancesHistoryHeaderProps {
  onChange: () => void;
}

const InstancesHistoryHeader = observer(({ onChange }: InstancesHistoryHeaderProps) => {

  const { appStore } = useStores();

  const handleHistorySizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    appStore.setSizeHistorySetting(e.target.value);
    onChange();
  };

  const handleHistoryViewedFlagChange = (e: ChangeEvent<HTMLInputElement>) => {
    appStore.toggleViewedFlagHistorySetting(e.target.checked);
    onChange();
  };

  const handleHistoryEditedFlagChange = (e: ChangeEvent<HTMLInputElement>) => {
    appStore.toggleEditedFlagHistorySetting(e.target.checked);
    onChange();
  };

  const handleHistoryReleasedFlagChange = (e: ChangeEvent<HTMLInputElement>) => {
    appStore.toggleReleasedFlagHistorySetting(e.target.checked);
    onChange();
  };

  return(
    <div className="header">
      <h3>
        <span>Your last </span>
        <div className="selector">
          <select title="number of instances" value={appStore.historySettings?.size} onChange={handleHistorySizeChange} >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
          instances in {appStore.currentSpaceName}
      </h3>
      <ul className="config">
        <li><input title="Viewed" type="checkbox" checked={appStore.historySettings?.eventTypes.view} onChange={handleHistoryViewedFlagChange} />Viewed</li>
        <li><input title="Edited" type="checkbox" checked={appStore.historySettings?.eventTypes.edit} onChange={handleHistoryEditedFlagChange} />Edited</li>
        <li><input title="Released" type="checkbox" checked={appStore.historySettings?.eventTypes.release} onChange={handleHistoryReleasedFlagChange} />Released</li>
      </ul>
    </div>
  );
});
InstancesHistoryHeader.displayName = 'InstancesHistoryHeader';

const InstancesHistory = observer(() => {

  const initializedRef = useRef<string|undefined>(undefined);

  const classes = useStyles();

  const { appStore, historyStore } = useStores();

  useEffect(() => {
    if (appStore.currentSpace && (!initializedRef.current || initializedRef.current !== appStore.currentSpace.id)) {
      initializedRef.current = appStore.currentSpace.id;
      fetchInstances(appStore.currentSpace.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appStore.currentSpace?.id]);

  const fetchInstances = (space?: string) => {
    const eventTypes = appStore.historySettings && Object.entries(appStore.historySettings.eventTypes).reduce((acc, [eventType, eventValue]) => {
      if (eventValue) {
        acc.push(eventType);
      }
      return acc;
    }, [] as string[]);
    const history = eventTypes && historyStore.getFileredInstancesHistory(space, eventTypes, appStore.historySettings?.size);
    if(history) {
      historyStore.fetchInstances(history);
    }
  };

  const fetch = () => fetchInstances(appStore.currentSpace?.id);

  return(
    <div className={classes.container}>
      <InstancesHistoryHeader onChange={fetch} />
      <InstancesHistoryBody onError={fetch} />
    </div>
  );
});
InstancesHistory.displayName = 'InstancesHistory';

export default InstancesHistory;