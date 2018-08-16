import { observable, flow, computed,action } from "mobx";
import API from "../Services/API";

export default class GraphStore {
  @observable colorMap = {};
  @observable graph = {};

  @action async fetchGraph(id){
        try {
            let edgesMap = {};
            const { data } = await API.axios.get(API.endpoints.graph(id));
            let groups = {};
            data.vertices.forEach( (v) => {
                if(!groups[v.label]){
                    groups[v.label] = {
                    color:{background:this.groupColor(v.label)}
                    };
                }
                v.group = v.label;
            });
            data.edges.forEach( (e) => {
                let id = ""+e.from + e.to;  
                if(edgesMap.hasOwnProperty(id)){
                    edgesMap[id] += 1;
                }else{
                    edgesMap[id] = 1;
                }
                let curve = edgesMap[id] / 10;
                e.smooth = {type: "curvedCCW", roundness:curve};
            });
            this.setGraph(data);
        }catch(e){
            console.log(e);
        }
  }

  @action setGraph(g){
    this.graph.edges = g.edges;
    this.graph.vertices = g.vertices;
  }

   groupColor(group){
    const getRandomColor = function() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
    if(!this.colorMap[group]){
      let color = getRandomColor();
      this.colorMap[group] = color;
    }
    return this.colorMap[group];
  }
}