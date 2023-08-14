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

import {faCode} from '@fortawesome/free-solid-svg-icons/faCode';
import {faMoneyCheck} from '@fortawesome/free-solid-svg-icons/faMoneyCheck';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { createUseStyles } from 'react-jss';

import BGMessage from '../../Components/BGMessage';
import Filter from '../../Components/Filter';
import useStores from '../../Hooks/useStores';
import Matomo from '../../Services/Matomo';
import Preview from '../Preview';
import InstancesResult from './Instances/InstancesResult';

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
  }
});

const Instances = observer(() => {

  const classes = useStyles();

  const { browseStore, typeStore } = useStores();

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

  const isTypeOfSelectedInstanceSupported = browseStore.selectedInstance
    ? typeStore.isTypesSupported(browseStore.selectedInstance.typeNames)
    : false;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        {browseStore.selectedType &&
          (browseStore.isFetching ||
            !!browseStore.instances.length ||
            browseStore.instancesFilter) && (
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
        <InstancesResult />
      </Scrollbars>
      <div className={classes.preview}>
        {browseStore.selectedInstance ? (
          isTypeOfSelectedInstanceSupported && browseStore.selectedInstance.id ? (
            <Preview
              instanceId={browseStore.selectedInstance.id}
              instanceName={browseStore.selectedInstance.name}
            />
          ) : (
            <BGMessage icon={faCode}>
              This instance doesn&apos;t support preview.
            </BGMessage>
          )
        ) : (
          <BGMessage icon={faMoneyCheck}>
            Select an instance to display its preview here.
          </BGMessage>
        )}
      </div>
    </div>
  );
});
Instances.displayName = 'Instances';

export default Instances;
