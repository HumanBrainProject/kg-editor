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
import useGenericQuery from './useGenericQuery';
import type { GenericQuery } from './useGenericQuery';
import type { APIError } from '../Services/API';
import type { UserProfile, Space } from '../types';

const spaceComparer = (a: Space, b: Space) => a.name.localeCompare(b.name);

const sortSpaces = (spaces?: Space[]) => {
  if (Array.isArray(spaces)) {
    return spaces.sort(spaceComparer);
  }
  return [];
};

export type GetUserProfileQuery = GenericQuery<UserProfile|undefined>;

const useGetUserProfileQuery = (): GetUserProfileQuery => {

  const API = useAPI();

  const fetch = useMemo(() => async () => {
    try {
      const userProfile = await API.getUserProfile();
      userProfile.spaces = sortSpaces(userProfile.spaces);
      return userProfile;
    } catch (e) {
      const err = e as APIError;
      if (err.response && err.response.status === 403) {
        return undefined;
      } else {
        throw e;
      }
    }
  }, [API]);

  return useGenericQuery<UserProfile|undefined>(fetch);
};

export default useGetUserProfileQuery;