import { observable, action, computed } from "mobx";
import { uniqueId, remove } from "lodash";

export default class PaneStore {
  @observable selectedPane;
  @observable panes = [];

  @computed get selectedIndex(){
    return this.panes.indexOf(this.selectedPane);
  }
  @action registerPane(){
    let id = uniqueId("pane");
    this.panes.push(id);
    if(this.selectedPane === undefined){
      this.selectedPane = id;
    }
    return id;
  }
  @action selectPane(id){
    this.selectedPane = id;
  }
  @action unregisterPane(id){
    remove(this.panes, paneId => paneId === id);
  }
}