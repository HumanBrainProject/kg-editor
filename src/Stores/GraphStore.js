import { observable, flow, computed,action } from "mobx";
import API from "../Services/API";

const GROUP_THRESHOLD = 5;

export default class GraphStore {
  @observable colorMap = {};
  @observable graph = {};

  @action async fetchGraph(id){
        try {
            let edgesMap = {};
            const { data } = await API.axios.get(API.endpoints.graph(id));
            let groups = {};
            let cluster = {};
            let clusterComp = {}
            data.vertices.forEach( (v) => {
                if(!groups[v.label]){
                    groups[v.label] = {
                    color:{background:this.groupColor(v.label)}
                    };
                }
                if(!cluster[v.label]){
                    cluster[v.label] = [];
                }
                cluster[v.label].push(v);
                v.group = v.label;
            });
            // Nodes that should be clustered
            let compound = [];
            for(var key in cluster){
                if(cluster[key].length > GROUP_THRESHOLD){
                    compound.push({id: key, label:`${key} (${cluster[key].length})`, subnodes:cluster[key], group:key});
                    clusterComp[key] = {id: key, label:`${key} (${cluster[key].length})`, subnodes:cluster[key], group:key};
                }
            }
            let compoundOutEdges = [];
            //Setting links to target compound nodes
            data.edges.forEach( (e) => {
                //If multiple edges apply more curve (not to compound)
                let id = ""+e.from + e.to;  
                if(edgesMap.hasOwnProperty(id)){
                    edgesMap[id] += 1;
                }else{
                    edgesMap[id] = 1;
                }
                let curve = edgesMap[id] / 10;
                e.smooth = {type: "curvedCCW", roundness:curve};
                compound.forEach( (el) => {
                    el.subnodes.forEach( (subnode) => {
                        //Moving edge from single node to compound 
                        if(subnode.id == e.to){
                            e.prev = e.to;
                            e.to = el.id;
                        }
                        //Creating edge from compund to single node
                        if(subnode.id == e.from){
                            compoundOutEdges.push({from: el.id, to: e.to, id:el.id + Math.random() + e.to });
                        }
                    });
                });

            });

            data.edges = data.edges.concat(compoundOutEdges);
            console.log(data.edges);
            //Removing nodes and adding compund
            data.vertices = data.vertices.filter( (v) => {
                return !cluster[v.label] || (cluster[v.label] && cluster[v.label].length <= GROUP_THRESHOLD);
            }).concat(compound);
            data.edges.forEach( (edge) => {
                if(clusterComp[edge.to] && clusterComp[edge.to].subnodes.length > GROUP_THRESHOLD){
                    for(var g in clusterComp){
                        clusterComp[g].subnodes.forEach( (v) => {
                            if(v.id == edge.from){
                                edge.prev = edge.from;
                                edge.from = g;
                            }
                        });
                    }
                }else if(clusterComp[edge.from] && clusterComp[edge.from].subnodes.length > GROUP_THRESHOLD ){
                    for(var gr in clusterComp){
                        clusterComp[gr].subnodes.forEach( (v) => {
                            if(v.id == edge.to){
                                edge.prev = edge.to;
                                edge.to = gr;
                            }
                        });
                    }
                }
            });
            console.log(data.vertices);

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