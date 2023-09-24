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

import {faRedoAlt} from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';

import ErrorPanel from '../Components/ErrorPanel';
import SpinnerPanel from '../Components/SpinnerPanel';
import useListTypesQuery from '../Hooks/useListTypesQuery';
import useStores from '../Hooks/useStores';
import type { Space as SpaceType } from '../types';
import type { ReactNode } from 'react';


interface TypesProps {
  children?: ReactNode;
}

const Types = observer(({ children }: TypesProps) => {

  const { appStore, typeStore } = useStores();

  const space = (appStore.currentSpace as SpaceType|null)?.id??'';

  const isReady = !!space && typeStore.space === space;

  const {
    data: types,
    error,
    isUninitialized,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useListTypesQuery(space, !space || isReady);

  //console.log("Types.tsx", space, typeStore.space, isUninitialized, isFetching);

  useEffect(() => {
    if (isFetching) {
      typeStore.clear();
    } else if (isSuccess) {
      if(types) {
        typeStore.setTypes(space, types);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space, isFetching, isSuccess, types]);

  const canManageSpace = !!appStore.currentSpace?.permissions.canManageSpace;

  if (isReady) {
    if (types && types.length === 0 && !canManageSpace) {
      return (
        <ErrorPanel>
          <p>space &quot;{space}&quot; does not currently have any types in its specifications.<br />Your are not entitled to add types to space &quot;{space}&quot;.</p>
          <p>Please contact our team by email at : <a href={'mailto:kg@ebrains.eu'}>kg@ebrains.eu</a></p>
        </ErrorPanel>
      );
    }
    return (
      <>
        {children}
      </>
    );
  }

  if (isError) {
    return (
      <ErrorPanel>
        {error}<br /><br />
        <Button variant={'primary'} onClick={refetch}>
          <FontAwesomeIcon icon={faRedoAlt} /> &nbsp; Retry
        </Button>
      </ErrorPanel>
    );
  }

  if (space && (isUninitialized || isFetching)) {
    return <SpinnerPanel text={`Retrieving types for space "${space}"...`} />;
  }

  return null;
});
Types.displayName = 'Types';

export default Types;