import { observable, computed,action } from "mobx";
import API from "../Services/API";
import toMaterialStyle from 'material-color-hash';
import ColorScheme from 'color-scheme'

const GROUP_THRESHOLD = 2;
const COLOR_ARRAY_SIZE = 12;
const getColorID = function(s){
    let id = 0;
    for(let i = 0; i < s.length; i ++ ){
        id += s.charCodeAt(i);
    }
    return id % COLOR_ARRAY_SIZE;
};

const colors = new ColorScheme()
    .from_hex('bfffd6')
    .scheme('tetrade')
    .distance(0.75)
    .web_safe(true)
    .colors();

export default class GraphStore {
  @observable colorMap = {};
  @observable graph = {};
  
  @action async fetchGraph(id){
        try {
            let edgesMap = {};
            const { data } = await API.axios.get(API.endpoints.graph(id));
            let cluster = {};
            let clusterComp = {};
            data.vertices.forEach( (v) => {
                if(!cluster[v.dataType]){
                    cluster[v.dataType] = [];
                }
                v.color = {background: '#' + colors[getColorID(v.dataType)] }
                cluster[v.dataType].push(v);
            });
            // Nodes that should be clustered
            let compound = [];
            for(var key in cluster){
                if(cluster[key].length > GROUP_THRESHOLD){
                    let compoundNode = {id: key, label:`${cluster[key][0].label} (${cluster[key].length})`, subnodes:cluster[key], dataType:key, isCompound: true};
                    compound.push(compoundNode);
                    clusterComp[key] = compoundNode;
                }
            }
            let compoundOutEdges = [];
            //Setting links to target compound nodes
            data.edges.forEach( (e) => {
                //If multiple edges: apply more curvature (not to compound)
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
                            e.prevTo = e.to;
                            e.to = el.id;
                        }
                        //Creating edge from compund to single node
                        if(subnode.id == e.from){
                            compoundOutEdges.push({from: el.id, to: e.to, id:el.id + Math.random() + e.to, prevFrom: e.from });
                        }
                    });
                });

            });

            data.edges = data.edges.concat(compoundOutEdges);
            //Removing nodes and adding compund
            data.vertices = data.vertices.filter( (v) => {
                return !cluster[v.dataType] || (cluster[v.dataType] && cluster[v.dataType].length <= GROUP_THRESHOLD);
            }).concat(compound);
            data.vertices = data.vertices.map( (v) => {
                v.color = {
                    background:'#' + colors[getColorID(v.dataType)]
                };
                return v;
            });
            data.edges.forEach( (edge) => {
                if(clusterComp[edge.to] && clusterComp[edge.to].subnodes.length > GROUP_THRESHOLD){
                    for(var g in clusterComp){
                        clusterComp[g].subnodes.forEach( (v) => {
                            if(v.id == edge.from){
                                edge.prevFrom = edge.from;
                                edge.from = g;
                            }
                        });
                    }
                }else if(clusterComp[edge.from] && clusterComp[edge.from].subnodes.length > GROUP_THRESHOLD ){
                    for(var gr in clusterComp){
                        clusterComp[gr].subnodes.forEach( (v) => {
                            if(v.id == edge.to){
                                edge.prevTo = edge.to;
                                edge.to = gr;
                            }
                        });
                    }
                }
            });
            this.setGraph(data);
        }catch(e){
            console.log(e);
        }
  }

  @action explodeNode(id, data, vertex){
    let verticesToAdd = vertex.subnodes;
    //Removing the compound nodes
    data.vertices = data.vertices.filter( (v) => v.id !== id); 
    //Adding the sub nodes
    data.vertices = data.vertices.concat(verticesToAdd);
    //Restoring links
    data.edges.map( (e) => {
        if(e.to === id){
            e.to = e.prevTo;
        }
        if(e.from === id ){
            e.from = e.prevFrom;
        }
    });
    this.setGraph(data);
    return this.graph;
  }

  @action setGraph(g){
    this.graph.edges = g.edges;
    this.graph.vertices = g.vertices;
  }


}