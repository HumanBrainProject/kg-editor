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
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';

import ErrorPanel from '../Components/ErrorPanel';
import GridSelector from '../Components/GridSelector';
import Modal from '../Components/Modal';
import useAuth from '../Hooks/useAuth';
import useStores from '../Hooks/useStores';
import type { Space as SpaceType } from '../types';
import type { JSX } from 'react';


const hasSpace = (spaces: SpaceType[], name?: string|null) => !!name && spaces.find(s => s.id === name);

const getSpace = (spaces: SpaceType[], name?: string|null) => {
  if (name) {
    if (hasSpace(spaces, name)) {
      return name;
    }
  } else {
    const savedSpaceName = localStorage.getItem('space');
    if (hasSpace(spaces, savedSpaceName)) {
      return savedSpaceName;
    }
  }
  return null;
};

const SpaceItem = ({ item: space }: { item: SpaceType }) => <>{space.name??space.id}</>;

interface SpaceProps {
  space?: string|null;
  skipHistory?: boolean;
  children?: string|JSX.Element|(null|undefined|string|JSX.Element)[];
}

const Space = observer(({ space, skipHistory, children }: SpaceProps) => {

  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useAuth();

  const [isInitialized, setInitialized] = useState(false);

  const { appStore, userProfileStore, viewStore } = useStores();

  const handleSpaceSelection = (space: SpaceType) => appStore.switchSpace(location, navigate, space.id);

  useEffect(() => {
    const selectedSpace = getSpace(userProfileStore.spaces as SpaceType[], space);
    if(selectedSpace) {
      appStore.setSpace(selectedSpace);
    }
    if (skipHistory) {
      viewStore.flushStoredViewsforSpace();
      setInitialized(true);
    } else {
      if (!viewStore.views.size) {
        const path = viewStore.restoreViews();
        const noRoute = !!matchPath({path:'/'}, location.pathname);
        if (noRoute && path) {
          navigate(path);
        } else {
          setInitialized(true);
        }
      } else {
        setInitialized(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space, skipHistory]);

  if (!userProfileStore.hasSpaces) {
    return (
      <ErrorPanel>
        <h1>Welcome <span title={userProfileStore.firstName}>{userProfileStore.firstName}</span></h1>
        <p>You are currently not granted permission to acccess any spaces.</p>
        <p>Please contact our team by email at : <a href={'mailto:kg@ebrains.eu'}>kg@ebrains.eu</a></p>
        <Button onClick={logout}>Logout</Button>
      </ErrorPanel>
    );
  }

  if (!isInitialized) {
    return null;
  }

  if (!appStore.currentSpace) {
    if (!space) {
      const Component = GridSelector<SpaceType>;

      const list = userProfileStore.spaces as SpaceType[];

      const handleSpaceFilter = (list: SpaceType[], term: string) => list.filter(space => space.id.toLowerCase().includes(term));

      return (
        <Modal show={true} >
          <Modal.Header title={`Welcome ${userProfileStore.firstName}, please select a space:`} closeButton={false} />
          <Modal.Body>
            <Component list={list} itemComponent={SpaceItem} getKey={space => space.id} onSelect={handleSpaceSelection} onFilter={handleSpaceFilter} filterPlaceholder="Filter spaces" />
          </Modal.Body>
        </Modal>
      );
    }
    return (
      <ErrorPanel>
        <p>You are currently not granted permission to acccess the space  &quot;<i>{space}&quot;</i>.</p>
        <p>Please contact our team by email at : <a href={'mailto:kg@ebrains.eu'}>kg@ebrains.eu</a></p>
      </ErrorPanel>
    );
  }

  return (
    <>
      {children}
    </>
  );
});
Space.displayName = 'Space';

export default Space;