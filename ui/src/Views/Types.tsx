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

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button"

import useStores from "../Hooks/useStores";
import { Space as SpaceType } from "../types";

import SpinnerPanel from "../Components/SpinnerPanel";
import ErrorPanel from "../Components/ErrorPanel";
import useListTypesQuery from "../Hooks/useListTypesQuery";

interface TypesProps {
  children?: string|JSX.Element|(null|undefined|string|JSX.Element)[];
}

const Types = observer(({ children }: TypesProps) => {

  const { appStore, typeStore } = useStores();

  const space = (appStore.currentSpace as SpaceType|null)?.id??"";

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
      typeStore.setTypes(space, types);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space, isFetching, isSuccess, types]);


  if (isReady) {
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
        <Button variant={"primary"} onClick={refetch}>
          <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
        </Button>
      </ErrorPanel>
    );
  }

  if (space && (isUninitialized || isFetching)) {
    return <SpinnerPanel text={`Retrieving types for space "${space}"...`} />;
  }

  return null;
});
Types.displayName = "Types";

export default Types;