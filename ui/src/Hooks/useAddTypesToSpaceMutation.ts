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

import { useMemo } from 'react';
import useAPI from './useAPI';
import useGenericMutation from './useGenericMutation';
import type { UseMutationTrigger, UseMutationResult } from './useGenericMutation';
import type { APIError } from '../Services/API';
import type { StructureOfType } from '../types';

export interface UseAddTypesToSpaceTriggerParams {
  types: string[];
  space: string;
}

export interface UseAddTypesToSpaceTrigger extends UseMutationTrigger<UseAddTypesToSpaceTriggerParams, StructureOfType[]> {}

export interface UseAddTypesToSpaceResult extends UseMutationResult<StructureOfType[]> {}

const useAddTypesToSpaceMutation = (): [UseAddTypesToSpaceTrigger, UseAddTypesToSpaceResult] => {

  const API = useAPI();

  const trigger = useMemo(() => async ({types, space}: UseAddTypesToSpaceTriggerParams) => {
    try {
      const { data } = await API.addTypesToSpace(types, space);
      data.forEach(type => {
        type.isSupported = type.fields instanceof Object && !!Object.keys(type.fields).length;
      });
      return data;
    } catch (e) {
      const error = e as APIError;
      const { response } = error;
      const status = response?.status;
      const message = error?.message;
      switch (status) {
      case 401: // Unauthorized
      case 403: { // Forbidden
        throw new Error(`You do not have permission to add types to space "${space}".`);
      }
      default: {
        const errorMessage = error.response && error.response.status !== 500 ? error.response.data:'';
        throw new Error(`Failed to add types to space "${space}" (${message}) ${errorMessage}`);
      }
      }
    }
  }, [API]);

  return useGenericMutation<UseAddTypesToSpaceTriggerParams, StructureOfType[]>(trigger);
};

export default useAddTypesToSpaceMutation;