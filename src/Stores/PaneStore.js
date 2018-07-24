import { observable, action, computed } from "mobx";
import { uniqueId, remove } from "lodash";

export default class PaneStore {
  @observable selectedPane;
  @observable panes = [];
  @observable selectionChanged = false;

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
    this.selectionChanged = true;
  }
  @action selectNextPane(){
    if (this.selectedPane) {
      const idx = this.selectedIndex + 1;
      if (idx > 0 & idx < this.panes.length) {
        this.selectPane(this.panes[idx]);
      }
    }
  }
  @action resetSelectionChanged() {
    if (this.selectionChanged) {
      setTimeout(() => this.selectionChanged = false, 1000);
    }
  }
  @action unregisterPane(id){
    remove(this.panes, paneId => paneId === id);
  }
}