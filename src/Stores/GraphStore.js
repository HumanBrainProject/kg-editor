import { observable, action } from "mobx";
import API from "../Services/API";
// import ColorScheme from "color-scheme";
import console from "../Services/Logger";

// const GROUP_THRESHOLD = 2;
// const COLOR_ARRAY_SIZE = 12;
// const getColorID = function (s) {
//   let id = 0;
//   for (let i = 0; i < s.length; i++) {
//     id += s.charCodeAt(i);
//   }
//   return id % COLOR_ARRAY_SIZE;
// };

// const colors = new ColorScheme()
//   .from_hex("bfffd6")
//   .scheme("tetrade")
//   .distance(0.75)
//   .web_safe(true)
//   .colors();

export default class GraphStore {
  @observable colorMap = {};
  @observable breadCrumbs = [];
  @observable network;
  @observable step = 2;
  @observable selectedNode;
  @observable history = [];
  @observable menuDisplay = {
    display: "none",
    left: "-1000px",
    top: "-1000px"
  };
  @observable graph = {
    nodes:[],
    links:[]
  };



  constructor(instanceStore){
    this.instanceStore = instanceStore;
    this._graph = {
      nodes: [],
      links: []
    };
  }


  options = {
    physics: { enabled: false },
    layout: {
      hierarchical: {
        enabled: true,
        direction: "UD",
        sortMethod: "directed",
        nodeSpacing: 150
      }
    },
    edges: {
      arrows: {
        to: { enabled: true, scaleFactor: 1, type: "arrow" },
        middle: { enabled: false, scaleFactor: 1, type: "arrow" },
        from: { enabled: false, scaleFactor: 1, type: "arrow" }
      },
      smooth: true
    },
    nodes: {
      shape: "box",
      widthConstraint: {
        maximum: 100
      },
      font: {
        size: 20
      }
    },
    interaction: {
      dragNodes: false,
      hover: true,
    }
  };

  @action async initGraph(id){
    const g = await this.fetchGraph(id);
    let node = g.nodes.filter(( v) => v.id === id)[0];
    this.setGraph(g);
    this.setSelectedNode(node);
  }

  @action async fetchGraph(id) {
    try {
      // let edgesMap = {};
      const { data } = await API.axios.get(API.endpoints.graph(id, this.step));
      // let cluster = {};
      // let clusterComp = {};
      // data.nodes.forEach((v) => {
      //   if (!cluster[v.dataType]) {
      //     cluster[v.dataType] = [];
      //   }
      //   v.color = { background: "#" + colors[getColorID(v.dataType)] };
      //   if(this.previousNode && v.id === this.previousNode.id){
      //     v.isPrevious = true;
      //   }else{
      //     cluster[v.dataType].push(v);
      //   }
      // });
      // // Nodes that should be clustered
      // let compound = [];
      // for (var key in cluster) {
      //   if (cluster[key].length > GROUP_THRESHOLD) {
      //     let compoundNode = { id: key, label: `${cluster[key][0].label} (${cluster[key].length})`, subnodes: cluster[key], dataType: key, isCompound: true };
      //     compound.push(compoundNode);
      //     clusterComp[key] = compoundNode;
      //   }
      // }
      // let compoundOutEdges = [];
      // //Setting links to target compound nodes
      // data.links.forEach((e) => {
      //   //If multiple edges: apply more curvature (not to compound)
      //   let id = "" + e.source + e.target;
      //   if (edgesMap.hasOwnProperty(id)) {
      //     edgesMap[id] += 1;
      //   } else {
      //     edgesMap[id] = 1;
      //   }
      //   if(this.previousNode && (e.target === this.previousNode.id || e.source == this.previousNode.id)){
      //     e.dashes = true;
      //   }
      //   let curve = edgesMap[id] / 10;
      //   e.smooth = { type: "curvedCCW", roundness: curve };
      //   compound.forEach((el) => {
      //     el.subnodes.forEach((subnode) => {
      //       //Moving edge from single node to compound
      //       if (subnode.id == e.target) {
      //         e.prevTo = e.target;
      //         e.target = el.id;
      //       }
      //       //Creating edge from compund to single node
      //       if (subnode.id == e.source) {
      //         compoundOutEdges.push({ from: el.id, to: e.target, prevFrom: e.source });
      //       }
      //     });
      //   });

      // });

      // data.links = data.links.concat(compoundOutEdges);
      // //Removing nodes and adding compund
      // data.nodes = data.nodes.filter((v) => {
      //   return !cluster[v.dataType] || (cluster[v.dataType] && cluster[v.dataType].length <= GROUP_THRESHOLD);
      // }).concat(compound);
      // //Adding color
      // data.nodes = data.nodes.map((v) => {
      //   v.color = {
      //     background: "#" + colors[getColorID(v.dataType)]
      //   };
      //   return v;
      // });
      // data.links.filter( (edge) => !edge.deleteMe);
      // // Recreating edges from and to compound nodes
      // data.links.forEach((edge) => {
      //   if (clusterComp[edge.target] && clusterComp[edge.target].subnodes.length > GROUP_THRESHOLD) {
      //     for (var g in clusterComp) {
      //       clusterComp[g].subnodes.forEach((v) => {
      //         if (v.id == edge.source) {
      //           edge.prevFrom = edge.source;
      //           edge.source = g;
      //         }
      //       });
      //     }
      //   } else if (clusterComp[edge.source] && clusterComp[edge.source].subnodes.length > GROUP_THRESHOLD) {
      //     for (var gr in clusterComp) {
      //       clusterComp[gr].subnodes.forEach((v) => {
      //         if (v.id == edge.target) {
      //           edge.prevTo = edge.target;
      //           edge.target = gr;
      //         }
      //       });
      //     }
      //   }
      // });
      // data.links.filter( (edge) =>{
      //   return data.nodes.findIndex( (node) => {
      //     return edge.to == node.id || edge.from == node.id;
      //   }) > -1;
      // });
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  @action updateGraph(id){
    this.fetchGraph(id).then((data) => {
      this.setGraph(data);
    });
  }

  @action explodeNode(id, vertex) {
    let verticesToAdd = vertex.subnodes;
    // let g = this.graph;
    //Removing the compound nodes
    this._graph.nodes.filter((v) => v.id !== id);
    //Adding the sub nodes
    this._graph.nodes.concat(verticesToAdd);
    //Restoring links
    this._graph.links = this._graph.links.map((e) => {
      if (e.target === id) {
        e.target = e.prevTo;
      }
      if (e.source === id) {
        e.source = e.prevFrom;
      }
      return e;
    });
    this.setGraph(this._graph);
  }

  @action handleSelectNode(params){
    this.hideContextMenu();
    if (params.nodes.length == 1) {
      let id = params.nodes[0];
      let node =  this._graph.nodes.filter((el) => { return el.id == id; });
      if (node && node[0] && node[0].isCompound) {
        this.explodeNode(id, node[0]);
      } else {
        this.network.focus(id, {
          scale: 1.3,
          animation: {
            duration: 300,
            easingFunction: "easeInOutQuad"
          }
        });
        if (id !== this.instanceStore.mainInstanceId) {
          this.instanceStore.history.push(`/instance/${id}`);
          this.instanceStore.mainInstanceId = id;
          this.instanceStore.fetchInstanceData(this.instanceStore.mainInstanceId);
          this.instanceStore.setCurrentInstanceId(this.instanceStore.mainInstanceId, 0);
          this.fetchGraph(id).then( (data) => {
            this.setGraph(data);
            this.setSelectedNode(node[0]);
          });
        }
      }
    }
  }

  @action handleOnContext(params){
    params.event.preventDefault();
    this.hideContextMenu();
    // let node = this.network.getNodeAt(params.pointer.DOM);
    // if (node) {
    //   this.menuDisplay = { display: "block", left: params.pointer.DOM.x, top: params.pointer.DOM.y };
    // }
  }

  @action hideContextMenu(){
    this.menuDisplay = {
      display: "none",
      left: "-1000px",
      top: "-1000px"
    };
  }

  get menuDisplay(){
    return this.menuDisplay;
  }

  @action setStep(step){
    this.step = step;
  }

  @action setSelectedNode(node){
    let arr = this.breadCrumbs.peek();
    arr.push(node);
    this.setBreadCrumbs(arr);
    this.selectedNode = node;
  }

  get breadCrumbs(){
    return this.breadCrumbs.peek();
  }

  @action setBreadCrumbs(b){
    this.breadCrumbs = b;
  }

  @action handleNavigationClick(index){
    if(this.breadCrumbs && this.breadCrumbs.length > 0){
      let temp = [];
      for(let i = 0; i < index + 1; i++){
        temp.push(this.breadCrumbs[i]);
      }
      let node = temp[temp.length -1];
      this.setBreadCrumbs(temp);
      this.updateGraph(node.id);
    }
  }

  get graph(){
    return this._graph;
  }

  @action setGraph(g){
    this.graph = g;
    this._graph = g;
  }
}