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
import { useParams, useSearchParams, Navigate, Link } from 'react-router-dom';


import ErrorPanel from '../Components/ErrorPanel';
import SpinnerPanel from '../Components/SpinnerPanel';
import useAPI from '../Hooks/useAPI';
import useCheckInstanceQuery from '../Hooks/useCheckInstanceQuery';
import useStores from '../Hooks/useStores';
import type { ReactNode } from 'react';

interface InstanceCreationProps {
  children?: ReactNode;
}

const InstanceCreation = observer(({ children }: InstanceCreationProps) => {

  const [isReady, setReady] = useState(false);
  const [spaceForbidCreation, setSpaceForbidCreation] = useState(false);
  const [isTypeNotSupported, setTypeNotSupported] = useState(false);
  const [isTypeUnresolved, setTypeUnresolved] = useState(false);

  const params = useParams();
  const [searchParams] = useSearchParams();

  const instanceId = params.id;
  const typeName = searchParams.get('type');

  const {
    data,
    error,
    resolvedId,
    isAvailable,
    isUninitialized,
    isFetching,
    isError,
  } = useCheckInstanceQuery(instanceId as string, !instanceId && !typeName);

  const api = useAPI();

  const rootStore = useStores();
  const { appStore, viewStore, typeStore, instanceStore } = rootStore;

  useEffect(() => {
    if (isAvailable) {
      if (appStore.currentSpacePermissions.canCreate) {
        const type = typeName?typeStore.typesMap.get(typeName):undefined;
        if (type) {
          if (type.canCreate !== false && type.isSupported && !type.embeddedOnly) {
            if(instanceId) {
              instanceStore.createNewInstance(type, instanceId);
              setReady(true);
            }
          } else {
            setTypeNotSupported(true);
          }
        } else {
          setTypeUnresolved(true);
        }
      } else {
        setSpaceForbidCreation(true);
      }
    } else if (resolvedId && data) {
      if (data.space !== appStore.currentSpaceName) {
        viewStore.clearViews();
      } else {
        const instance = instanceStore.createInstanceOrGet(resolvedId);
        if(instance){
          instance.initializeData(api, rootStore, data);
        }
      }
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable, resolvedId, data]);

  if (!typeName) {
    return (
      <ErrorPanel>
        query parameter &quot;type&quot; is missing!<br /><br />
        <Link className="btn btn-primary" to={'/browse'}>Go to browse</Link>
      </ErrorPanel>
    );
  }

  if (spaceForbidCreation) {
    return (
      <ErrorPanel>
        Your current space credentials does not allow you to create instances in space &quot;{appStore.currentSpaceName}&quot;<br /><br />
        <Link className="btn btn-primary" to={'/browse'}>Go to browse</Link>
      </ErrorPanel>
    );
  }

  if (isTypeNotSupported) {
    return (
      <ErrorPanel>
        Creation of instance of type &quot;{typeName}&quot; is not supported<br /><br />
        <Link className="btn btn-primary" to={'/browse'}>Go to browse</Link>
      </ErrorPanel>
    );
  }

  if (isTypeUnresolved) {
    return (
      <ErrorPanel>
        Creating an instance of type &quot;{typeName}&quot; is currently not allowed in space &quot;{appStore.currentSpaceName}&quot;<br /><br />
        <Link className="btn btn-primary" to={'/browse'}>Go to browse</Link>
      </ErrorPanel>
    );
  }

  if (isError) {
    return (
      <ErrorPanel>
        {error}<br /><br />
        <Link className="btn btn-primary" to={'/browse'}>Go to browse</Link>
      </ErrorPanel>
    );
  }

  if (isUninitialized || isFetching) {
    return <SpinnerPanel text={`Retrieving instance ${instanceId}...`} />;
  }

  if (isReady && isAvailable) {
    return (
      <>
        {children}
      </>
    );
  }

  if (isReady && resolvedId) {
    return (
      <Navigate to={`/instances/${resolvedId}`} />
    );
  }

  return null;
});
InstanceCreation.displayName = 'InstanceCreation';

export default InstanceCreation;
