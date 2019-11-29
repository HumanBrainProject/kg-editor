import { observable, action, computed } from "mobx";
import { uniqueId, remove } from "lodash";

class PaneStore {
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
  @action unregisterPane(id){
    remove(this.panes, paneId => paneId === id);
  }
}

export default PaneStore;