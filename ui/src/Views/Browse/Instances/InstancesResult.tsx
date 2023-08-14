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

import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons/faCodeBranch';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import Button from 'react-bootstrap/esm/Button';
import InfiniteScroll from 'react-infinite-scroller';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import BGMessage from '../../../Components/BGMessage';
import Spinner from '../../../Components/Spinner';
import useStores from '../../../Hooks/useStores';
import Matomo from '../../../Services/Matomo';
import CreateInstance from './CreateInstance';
import InstancesList from './InstancesList';
import NoInstance from './NoInstance';

const useStyles = createUseStyles({
  loader: {
    textAlign: 'center',
    margin: '20px 0 30px',
    fontSize: '1.25em',
    fontWeight: '300'
  }
});

const InstancesResult = observer(() => {

  const classes = useStyles();

  const navigate = useNavigate();

  const { appStore, browseStore } = useStores();

  const selectedType = browseStore.selectedType;

  const handleCreateInstance = () => {
    Matomo.trackEvent(
      'Browse',
      'CreateInstance',
      browseStore.selectedType?.name
    );
    const uuid = uuidv4();
    const typeName = browseStore.selectedType?.name;
    if (typeName) {
      navigate(
        `/instances/${uuid}/create?space=${
          appStore.currentSpaceName
        }&type=${encodeURIComponent(typeName)}`
      );
    }
  };

  const handleLoadMore = () => browseStore.fetchInstances(true);

  const handleRetry = () => browseStore.fetchInstances();

  if (!selectedType) {
    return (
      <BGMessage icon={faCodeBranch} transform={'flip-h rotate--90'}>
        Select a instance type in the left panel
      </BGMessage>
    );
  }

  if (browseStore.fetchError) {
    return (
      <BGMessage icon={faBan}>
        There was a network problem retrieving{' '}
        {selectedType.label} instances.
        <br />
        If the problem persists, please contact the support.
        <br />
        <br />
        <Button variant={'primary'} onClick={handleRetry}>
          <FontAwesomeIcon icon={faRedoAlt} /> &nbsp; Retry
        </Button>
      </BGMessage>
    );
  }

  if (browseStore.isFetching) {
    return (
      <Spinner text={`Retrieving ${selectedType.label} instances...`} />
    );
  }

  if (browseStore.instances.length === 0) {
    return (
      <NoInstance onCreateInstance={handleCreateInstance } />
    );
  }

  return (
    <InfiniteScroll
      threshold={400}
      pageStart={0}
      loadMore={handleLoadMore}
      hasMore={browseStore.canLoadMoreInstances}
      loader={
        <div className={classes.loader} key={0}>
          <FontAwesomeIcon icon={faCircleNotch} spin />
          &nbsp;&nbsp;
          <span>
            Loading more {selectedType.label} instances...
          </span>
        </div>
      }
      useWindow={false}
    >
      <InstancesList />
      {!browseStore.canLoadMoreInstances && (
        <CreateInstance onCreateInstance={handleCreateInstance } />
      )}
    </InfiniteScroll>
  );
});
InstancesResult.displayName = 'InstancesResult';

export default InstancesResult;
