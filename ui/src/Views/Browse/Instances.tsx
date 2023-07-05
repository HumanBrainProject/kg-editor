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
import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { Scrollbars } from 'react-custom-scrollbars-2';
import InfiniteScroll from 'react-infinite-scroller';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';


import BGMessage from '../../Components/BGMessage';
import Filter from '../../Components/Filter';
import Spinner from '../../Components/Spinner';
import useStores from '../../Hooks/useStores';
import Matomo from '../../Services/Matomo';
import InstanceRow from '../Instance/InstanceRow';
import Preview from '../Preview';
import type { Instance } from '../../Stores/InstanceStore';
import type { InstanceSummary } from '../../types';

const useStyles = createUseStyles({
  container: {
    color: 'var(--ft-color-loud)',
    overflow: 'hidden',
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 33%',
    gridTemplateRows: 'auto 1fr'
  },
  preview: {
    position: 'relative',
    gridRow: '1 / span 2',
    gridColumn: '2',
    background: 'var(--bg-color-ui-contrast2)',
    borderLeft: '1px solid var(--border-color-ui-contrast1)',
    overflow: 'auto',
    color: 'var(--ft-color-loud)'
  },
  loader: {
    textAlign: 'center',
    margin: '20px 0 30px',
    fontSize: '1.25em',
    fontWeight: '300'
  },
  list: {
    '& ul': {
      listStyleType: 'none',
      padding: '1px 11px 1px 11px'
    }
  },
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridGap: '10px',
    padding: '5px 10px 0 0',
    position: 'relative'
  },
  instanceCount: {
    color: 'var(--ft-color-normal)',
    lineHeight: '34px',
    background: 'var(--bg-color-ui-contrast2)',
    padding: '0 10px',
    margin: '10px 0 10px -10px'
  },
  noInstancesPanel:{
    position:'absolute !important',
    top:'50%',
    left:'50%',
    transform:'translate(-50%,-200px)',
    textAlign:'center'
  },
  noInstancesText:{
    fontWeight:'300',
    fontSize:'1.2em'
  },
  createFirstInstanceButton:{
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    //border: "1px solid rgba(0, 0, 0, 0.4)",
    border: '1px solid var(--ft-color-normal)',
    borderRadius: '10px',
    padding: '0 20px',
    //background: "rgba(0, 0, 0, 0.4)",
    background: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'border 0.25s ease',
    '&:hover': {
      border: '1px solid var(--ft-color-loud)',
      '& $createFirstInstanceIcon path': {
        fill: 'rgba(255,255,255,0.6)'
      },
      '& $createFirstInstanceText': {
        color: 'var(--ft-color-loud)'
      }
    }
  },
  createFirstInstanceIcon:{
    fontSize:'5em',
    '& path':{
      //fill:"var(--bg-color-blend-contrast1)",
      fill: 'rgba(255,255,255,0.4)',
      stroke:'rgba(200,200,200,.1)',
      strokeWidth:'3px',
      transition: 'fill 0.25s ease'
    }
  },
  createFirstInstanceText:{
    fontSize: '1.5em',
    whiteSpace: 'nowrap',
    paddingLeft: '10px',
    //color: "rgba(0,0,0,0.4)",
    color: 'var(--ft-color-normal)',
    fontWeight: '800',
    transition: 'color 0.25s ease'
  },
  createInstanceButton:{
    padding: '5px 20px',
    background: 'var(--bg-color-ui-contrast2)',
    color: 'var(--ft-color-normal)',
    margin: '-16px 10px 0 10px',
    display: 'inline-block',
    border: '1px solid var(--border-color-ui-contrast1)',
    cursor: 'pointer',
    transition: 'border 0.25s ease',
    '&:hover': {
      background: 'var(--list-bg-hover)',
      borderColor: 'transparent',
      '& $createInstanceIcon path': {
        fill: 'rgba(255,255,255,0.6)'
      },
      '& $createInstanceText': {
        color: 'var(--ft-color-loud)'
      }
    }
  },
  createInstanceIcon:{
    display: 'inline-block',
    fontSize: '2em',
    '& path':{
      fill: 'rgba(255,255,255,0.4)',
      stroke:'rgba(200,200,200,.1)',
      strokeWidth:'3px',
      transition: 'fill 0.25s ease'
    }
  },
  createInstanceText:{
    display: 'inline-block',
    fontSize: '1.2em',
    whiteSpace: 'nowrap',
    paddingLeft: '10px',
    color: 'var(--ft-color-normal)',
    transform: 'translateY(-5px)',
    transition: 'color 0.25s ease'
  },
  typeIcon: {
    position: 'absolute',
    top: '8px',
    '& + span': {
      display: 'inline-block',
      marginLeft: '22px'
    }
  },
});

interface InstancesResultProps {
  onRetry: () => void;
  onClick: (i: Instance) => void;
  onActionClick: (summaryInstance: InstanceSummary, mode: string) => void;
  onCtrlClick: (i: Instance) => void;
  loadMore: () => void;
  classes: any;
}

const InstancesResult = observer(({
  onRetry,
  onClick,
  onActionClick,
  onCtrlClick,
  loadMore,
  classes
}: InstancesResultProps) => {

  const navigate = useNavigate();

  const { appStore, browseStore } = useStores();

  const handleCreateInstance = () => {
    Matomo.trackEvent('Browse', 'CreateInstance', browseStore.selectedType.name);
    const uuid = uuidv4();
    navigate(`/instances/${uuid}/create?space=${appStore.currentSpaceName}&type=${encodeURIComponent(browseStore.selectedType.name)}`);
  };

  if (!browseStore.selectedType) {
    return (
      <BGMessage icon={'code-branch'} transform={'flip-h rotate--90'}>
        Select a instance type in the left panel
      </BGMessage>
    );
  }
  if (browseStore.fetchError) {
    return (
      <BGMessage icon={'ban'}>
        There was a network problem retrieving {browseStore.selectedType.label} instances.
        <br />
        If the problem persists, please contact the support.
        <br />
        <br />
        <Button variant={'primary'} onClick={onRetry}>
          <FontAwesomeIcon icon={'redo-alt'} /> &nbsp; Retry
        </Button>
      </BGMessage>
    );
  }
  if (browseStore.isFetching) {
    return (
      <Spinner text={`Retrieving ${browseStore.selectedType.label} instances...`} />
    );
  }

  const canCreate = appStore.currentSpacePermissions.canCreate && browseStore.selectedType.canCreate !== false && browseStore.selectedType.isSupported;  // We are allowed to create unless canCreate is explicitly set to false and there are fields

  if (!browseStore.instances.length) {
    return (
      <div className={classes.noInstancesPanel}>
        <div className={classes.noInstancesText}>
          <p>No&nbsp;
            <FontAwesomeIcon
              fixedWidth
              icon="circle"
              className={classes.typIcon}
              style={browseStore.selectedType.color?{ color: browseStore.selectedType.color }:undefined}
            />
          &nbsp;{browseStore.selectedType.label}&nbsp;
            {browseStore.instancesFilter?`could be found with the search term "${browseStore.instancesFilter}"`:'exists yet'}!</p>
          {!canCreate && (
            <p>You are currently not granted permission to create a {browseStore.selectedType.label} in space {appStore.currentSpaceName}.</p>
          )}
        </div>
        {canCreate && (
          <div className={classes.createFirstInstanceButton} onClick={handleCreateInstance}>
            <div className={classes.createFirstInstanceIcon}>
              <FontAwesomeIcon icon="plus" />
            </div>
            <div className={classes.createFirstInstanceText}>
              Create a new&nbsp;
              <FontAwesomeIcon
                fixedWidth
                icon="circle"
                className={classes.typIcon}
                style={browseStore.selectedType.color?{ color: browseStore.selectedType.color }:undefined}
              />
              &nbsp;{browseStore.selectedType.label}
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <InfiniteScroll
      threshold={400}
      pageStart={0}
      loadMore={loadMore}
      hasMore={browseStore.canLoadMoreInstances}
      loader={
        <div className={classes.loader} key={0}>
          <FontAwesomeIcon icon={'circle-notch'} spin />
          &nbsp;&nbsp;<span>Loading more  {browseStore.selectedType.label} instances...</span>
        </div>
      }
      useWindow={false}
    >
      <div className={classes.list}>
        <ul>
          {browseStore.instances.map((instance) => (
            <li key={instance.id}>
              <InstanceRow
                instance={instance}
                selected={instance === browseStore.selectedInstance}
                onClick={onClick}
                onCtrlClick={onCtrlClick}
                onActionClick={onActionClick}
              />
            </li>
          ))}
        </ul>
      </div>
      {canCreate && !browseStore.canLoadMoreInstances && (
        <div className={classes.createInstanceButton} onClick={handleCreateInstance}>
          <div className={classes.createInstanceIcon}>
            <FontAwesomeIcon icon="plus" />
          </div>
          <div className={classes.createInstanceText}>
            Create a new&nbsp;
            <FontAwesomeIcon
              fixedWidth
              icon="circle"
              className={classes.typIcon}
              style={browseStore.selectedType.color?{ color: browseStore.selectedType.color }:undefined}
            />
            &nbsp;{browseStore.selectedType.label}
          </div>
        </div>
      )}
    </InfiniteScroll>
  );
});

const Instances = observer(() => {
  const classes = useStyles();

  const { appStore, browseStore, typeStore, instanceStore } = useStores();

  const navigate = useNavigate();

  useEffect(() => {
    if (browseStore.selectedType && browseStore.instancesFilter) {
      browseStore.refreshFilter();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browseStore.selectedType, browseStore.instancesFilter]);

  const handleFilterChange = (value: string) => {
    Matomo.trackEvent('Browse', 'FilterInstance', value);
    browseStore.setInstancesFilter(value);
  };

  const handleInstanceClick = (instance: Instance) => {
    Matomo.trackEvent('Browse', 'InstancePreview', instance.id);
    browseStore.selectInstance(instance);
  };

  const handleInstanceCtrlClick = (instance: Instance) => {
    if (instance && instance.id) {
      Matomo.trackEvent( 'Browse', 'InstanceOpenTabInBackground', instance.id);
      const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);
      appStore.openInstance(instance.id, instance.name, instance.primaryType, isTypesSupported?'view':'raw');
    }
  };

  const handleInstanceActionClick = (summaryInstance: InstanceSummary, mode: string) => {
    const id = summaryInstance && summaryInstance.id;
    if (id) {
      if (!instanceStore.instances.has(id)) {
        const instance = instanceStore.createInstanceOrGet(id);
        if(instance) {
          instance.initializeLabelData(toJS(summaryInstance));
        }
      }
      Matomo.trackEvent('Browse', `InstanceOpenTabIn${mode[0].toUpperCase() + mode.substr(1)}Mode`, id);
      if (mode === 'view') {
        navigate(`/instances/${id}`);
      } else {
        navigate(`/instances/${id}/${mode}`);
      }
    }
  };

  const handleLoadMore = () => browseStore.fetchInstances(true);

  const handleRetry = () => browseStore.fetchInstances();

  const isTypeOfSelectedInstanceSupported = browseStore.selectedInstance?typeStore.isTypesSupported(browseStore.selectedInstance.typeNames):false;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        {browseStore.selectedType && (browseStore.isFetching || !!browseStore.instances.length || browseStore.instancesFilter) && (
          <>
            <Filter
              value={browseStore.instancesFilter}
              placeholder={`Filter instances of ${browseStore.selectedType.label}`}
              onChange={handleFilterChange}
            />
            <div className={classes.instanceCount}>
              {browseStore.totalInstances} Result
              {`${browseStore.totalInstances !== 0 ? 's' : ''}`}
            </div>
          </>
        )}
      </div>
      <Scrollbars autoHide>
        <InstancesResult
          onRetry={handleRetry}
          onClick={handleInstanceClick}
          onCtrlClick={handleInstanceCtrlClick}
          onActionClick={handleInstanceActionClick}
          loadMore={handleLoadMore}
          classes={classes}
        />
      </Scrollbars>
      <div className={classes.preview}>
        {browseStore.selectedInstance ?
          isTypeOfSelectedInstanceSupported?
            <Preview
              instanceId={browseStore.selectedInstance.id}
              instanceName={browseStore.selectedInstance.name}
            />
            :
            <BGMessage icon={'code'}>
              This instance doesn&apos;t support preview.
            </BGMessage>
          :
          <BGMessage icon={'money-check'}>
            Select an instance to display its preview here.
          </BGMessage>
        }
      </div>
    </div>
  );
});
Instances.displayName = 'Instances';

export default Instances;
