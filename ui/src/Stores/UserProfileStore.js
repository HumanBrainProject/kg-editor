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

import { observable, computed, action, makeObservable, toJS } from "mobx";

export class UserProfileStore {
  user = null;

  constructor() {
    makeObservable(this, {
      user: observable,
      isAuthorized: computed,
      hasSpaces: computed,
      spaces: computed,
      firstName: computed,
      setUserProfile: action,
      defaultSpace: computed
    });
  }

  filterSpaces(term) {
    term = term?.trim().toLowerCase();
    if(term) {
      return this.spaces.filter(t => t.id.toLowerCase().includes(term));
    }
    return this.spaces;
  }

  get isAuthorized() {
    return !!this.user;
  }

  get hasSpaces() {
    return this.user && this.user.spaces instanceof Array && !!this.user.spaces.length;
  }

  get spaces() {
    return this.hasSpaces ? this.user.spaces: [];
  }

  hasSpace(id) {
    return !!this.spaces.find(s => s.id === id);
  }

  getSpace(id) {
    return id?this.spaces.find(s => s.id === id):undefined;
  }

  getSpaceOrDefault(id) {
    const space = this.getSpace(id);
    if (space) {
      return space;
    }
    return this.defaultSpaces;
  }

  get defaultSpace() {
    return this.hasSpaces?this.spaces[0]:undefined;
  }

  getSpaceInfo(id) {
    const space = this.spaces.find(us => us.id === id);
    if (space) {
      return toJS(space);
    }
    return {id: id, name: id, permissions: {}};
  }

  get firstName() {
    const firstNameReg = /^([^ ]+) .*$/;
    if (this.isAuthorized && this.user) {
      if (this.user.givenName) {
        return this.user.givenName;
      }
      if (this.user.name) {
        if (firstNameReg.test(this.user.name)) {
          return this.user.name.match(firstNameReg)[1];
        }
        return this.user.name;
      }
      if (this.user.username) {
        return this.user.username;
      }
    }
    return "";
  }

  setUserProfile(user) {
    this.user = user
  }
}

export default UserProfileStore;