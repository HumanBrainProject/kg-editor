/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import { createBrowserHistory } from "history";

import { AppStore } from "./AppStore";
import { AuthStore } from "./AuthStore";
import { HistoryStore } from "./HistoryStore";
import { TypeStore } from "./TypeStore";
import { BrowseStore } from "./BrowseStore";
import { InstanceStore } from "./InstanceStore";
import { StatusStore } from "./StatusStore";
import { ViewStore } from "./ViewStore";
import { GraphStore } from "./GraphStore";
import { ReleaseStore } from "./ReleaseStore";
import { UserStore } from "./UserStore";
//import { BookmarkStore } from "./BookmarkStore";
//import { BookmarkStatusStore } from "./BookmarkStatusStore";
import { FeaturesStore } from "./FeaturesStore";

export class RootStore  {

  history= null

  authStore= null
  historyStore= null
  typeStore= null
  browseStore= null
  instanceStore= null
  statusStore= null
  viewStore= null
  graphStore= null
  releaseStore= null
  userStore= null
  //bookmarkStore= null
  //bookmarkStatusStore= null
  featuresStore= null

  constructor(transportLayer) {

    if (!transportLayer) {
      throw new Error("no transport layer provided!");
    }

    this.history = createBrowserHistory({basename:window.rootPath});

    // Domain stores
    this.historyStore = new HistoryStore(transportLayer, this);
    this.typeStore = new TypeStore(transportLayer, this);
    this.browseStore = new BrowseStore(transportLayer, this);
    this.instanceStore = new InstanceStore(transportLayer, this);
    this.statusStore = new StatusStore(transportLayer, this);
    this.viewStore = new ViewStore(transportLayer, this);
    this.graphStore = new GraphStore(transportLayer, this);
    this.releaseStore = new ReleaseStore(transportLayer, this);
    this.userStore = new UserStore(transportLayer, this);
    //this.bookmarkStore = new BookmarkStore(transportLayer, this);
    //this.bookmarkStatusStore = new BookmarkStatusStore(transportLayer, this);
    this.featuresStore = new FeaturesStore(transportLayer, this);
    this.authStore = new AuthStore(transportLayer, this);
    transportLayer.setAuthStore(this.authStore);

    // UI stores
    this.appStore = new AppStore(transportLayer, this);
  }
}