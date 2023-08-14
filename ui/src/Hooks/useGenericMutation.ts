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
import { useState } from 'react';

import type { APIError } from '../Services/API';

export interface UseMutationTriggerResult<T> {
  data?: T;
  error?: string;
}

export type UseMutationTrigger<P,T> = (params: P) => Promise<UseMutationTriggerResult<T>>;

export interface UseMutationResult<T> {
  data?: T;
  isUninitialized: boolean;
  isTriggering: boolean;
  error?: string;
  isError: boolean;
  isSuccess?: boolean;
  reset: () => void;
}

function useGenericMutation<P,T>(triggerT: (params: P) => Promise<T>): [UseMutationTrigger<P,T>, UseMutationResult<T>] {

  const [isUninitialized, setUninitialized] = useState(true);
  const [isTriggering, setTriggering] = useState(false);
  const [error, setError] = useState<string|undefined>(undefined);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setSuccess] = useState<boolean|undefined>(undefined);
  const [data, setData] = useState<T|undefined>(undefined);

  const reset = (): void => {
    setUninitialized(true);
    setError(undefined);
    setIsError(false);
    setTriggering(false);
    setSuccess(false);
    setData(undefined);
  };

  const trigger = async (params: P): Promise<UseMutationTriggerResult<T>> => {
    setUninitialized(false);
    setTriggering(true);
    setError(undefined);
    setIsError(false);
    setSuccess(undefined);
    setData(undefined);
    try {
      const data = await triggerT(params);
      setData(data);
      setSuccess(true);
      setTriggering(false);
      return { data: data };
    } catch (e) {
      const err = e as APIError;
      setError(err.message);
      setIsError(true);
      setTriggering(false);
      return { error: err.message };
    }
  };

  return [
    trigger,
    {
      data: data,
      isUninitialized: isUninitialized,
      isTriggering: isTriggering,
      error: error,
      isError: isError,
      isSuccess: isSuccess,
      reset: reset
    }
  ];
}

export default useGenericMutation;