import { observable, action, computed } from "mobx";
import { uniqueId, remove } from "lodash";

export default class PaneStore {
  @observable selectedPane;
  @observable panes = [];

  @computed get selectedIndex(){
    return this.panes.indexOf(this.selectedPane);
  }
  @action registerPane(id){
    let paneId = id || uniqueId("pane");
    this.panes.push(paneId);
    if(this.selectedPane === undefined){
      this.selectedPane = paneId;
    }
    return paneId;
  }
  @action selectPane(id){
    this.selectedPane = id;
  }
  @action selectNextPane(){
    if (this.selectedPane) {
      const idx = this.selectedIndex + 1;
      if (idx > 0 & idx < this.panes.length) {
        this.selectPane(this.panes[idx]);
      }
    }
  }
  @action unregisterPane(id){
    remove(this.panes, paneId => paneId === id);
  }
}