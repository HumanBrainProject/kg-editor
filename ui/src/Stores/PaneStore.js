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

import { observable, action, computed } from "mobx";
import { uniqueId, remove } from "lodash";

export default class PaneStore {
  @observable selectedPane;
  @observable panes = [];

  @computed
  get selectedIndex(){
    return this.panes.indexOf(this.selectedPane);
  }

  @action
  registerPane(id){
    let paneId = id || uniqueId("pane");
    this.panes.push(paneId);
    if(this.selectedPane === undefined){
      this.selectedPane = paneId;
    }
    return paneId;
  }

  @action
  selectPane(id){
    this.selectedPane = id;
  }

  @action
  unregisterPane(id){
    remove(this.panes, paneId => paneId === id);
  }
}