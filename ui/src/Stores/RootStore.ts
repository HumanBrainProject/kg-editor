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
import API from "../Services/API";
import { AppStore } from "./AppStore";
import { UserProfileStore } from "./UserProfileStore";
import { HistoryStore } from "./HistoryStore";
import { TypeStore } from "./TypeStore";
import { BrowseStore } from "./BrowseStore";
import { InstanceStore } from "./InstanceStore";
import { StatusStore } from "./StatusStore";
import { ViewStore } from "./ViewStore";
import { GraphStore } from "./GraphStore";
import { ReleaseStore } from "./ReleaseStore";
import { UserStore } from "./UserStore";
import { InvitedUsersStore } from "./InvitedUsersStore";

class RootStore {

  userProfileStore: UserProfileStore;
  historyStore: HistoryStore;
  typeStore: TypeStore;
  browseStore: BrowseStore;
  instanceStore: InstanceStore;
  statusStore: StatusStore;
  viewStore: ViewStore;
  graphStore: GraphStore;
  releaseStore: ReleaseStore;
  userStore: UserStore;
  invitedUsersStore: InvitedUsersStore;
  appStore: AppStore;

  constructor(api: API) {

    if (!api) {
      throw new Error("no api provided!");
    }

    // Domain stores
    this.historyStore = new HistoryStore(api, this);
    this.typeStore = new TypeStore(api, this);
    this.browseStore = new BrowseStore(api, this);
    this.instanceStore = new InstanceStore(api, this);
    this.statusStore = new StatusStore(api);
    this.viewStore = new ViewStore(api, this);
    this.graphStore = new GraphStore(api);
    this.releaseStore = new ReleaseStore(api, this);
    this.userStore = new UserStore(api);
    this.userProfileStore = new UserProfileStore();
    this.invitedUsersStore = new InvitedUsersStore(api)

    // UI stores
    this.appStore = new AppStore(api, this);
  }
}

export default RootStore;