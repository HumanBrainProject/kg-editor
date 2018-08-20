import React from "react";
import injectStyles from "react-jss";
import PaneStore from "../../Stores/PaneStore";
import GraphStore from "../../Stores/GraphStore";
import { observer, Provider, inject } from "mobx-react";
import VIS from "vis";
import cytoscape from "cytoscape";
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import toMaterialStyle from 'material-color-hash';

const styles = {
  container: {
    height: "calc(100vh - 90px)",
    width: "auto",
    paddingTop:"0",
    paddingLeft:"10vw",
    margin: "80px 0 10px 0",
    display:"grid",
    gridTemplateRows:"100%",
    gridTemplateColumns:"repeat(100, 80vw)",
    overflow:"visible",
    transition:"all 0.5s ease",
    "@media screen and (min-width:992px)": {
      height: "calc(100vh - 85px)",
      paddingLeft:"25vw",
      margin: "65px 0 20px 0",
      gridTemplateColumns:"repeat(100, 50vw)"
    },
    "@media screen and (min-width:1500px)": {
      height: "calc(100vh - 60px)",
      margin: "40px 0 20px",
    }
  },
  graph:{
    width: "40%",
    height: "90%",
    position: "absolute",
    "background-color": "white",
    "z-index": "10"
  }
};

var layoutOptions = {
  name: 'dagre',

  // animate: true, // whether to show the layout as it's running
  // refresh: 1, // number of ticks per frame; higher is faster but more jerky
  // maxSimulationTime: 4000, // max length in ms to run the layout
  // ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  // fit: true, // on every layout reposition of nodes, fit the viewport
  // padding: 30, // padding around the simulation
  // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  // nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

  // // layout event callbacks
  // ready: function(){}, // on layoutready
  // stop: function(){}, // on layoutstop

  // // positioning options
  // randomize: false, // use random node positions at beginning of layout
  // avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  // handleDisconnected: true, // if true, avoids disconnected components from overlapping
  // nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
  // flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  // alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
  // gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]. The constraint in the example says that the center of node1 must be at least 25 pixels above the center of node2. In other words, it is an inequality constraint that requires "node1.y + gap <= node2.y". You can set the extra "equality" attribute as "true" to convert it into an equality constraint.

  // // different methods of specifying edge length
  // // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  // edgeLength: undefined, // sets edge length directly in simulation
  // edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  // edgeJaccardLength: undefined, // jaccard edge length in simulation

  // // iterations of cola algorithm; uses default values on undefined
  // unconstrIter: undefined, // unconstrained initial layout iterations
  // userConstIter: undefined, // initial layout iterations with user-specified constraints
  // allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

  // // infinite layout options
  // infinite: false // overrides all other options for a forces-all-the-time mode
};

@injectStyles(styles)
@inject("instanceStore")
@observer
export default class PaneContainer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      vertices: [],
      edges: []
    }
    this.paneStore = new PaneStore();
    this.graphStore = new GraphStore();
    this.fetchGraph(this.props.instanceStore.mainInstanceId);
  }

  async fetchGraph(id){
    await this.graphStore.fetchGraph(id);
    const graph = this.graphStore.graph;
    this.setState({vertices: graph.vertices, edges:graph.edges});
  }

 
  render(){
    var data = {
      nodes: new VIS.DataSet(this.state.vertices),
      edges: new VIS.DataSet(this.state.edges)
    };

    if(this.state.vertices.length > 1){
      
      var options = {
        physics:{enabled:false},
        layout:{
          hierarchical:{
            enabled:true, 
            direction:'LR',
            sortMethod: 'directed',
            nodeSpacing: 200
          }
        },
        edges:{
          arrows: {
            to:     {enabled: true, scaleFactor:1, type:'arrow'},
            middle: {enabled: false, scaleFactor:1, type:'arrow'},
            from:   {enabled: false, scaleFactor:1, type:'arrow'}
          },
          smooth: true
        },
        nodes:{
          shape:'circle',
          widthConstraint:{
            maximum: 100
          }
        },
        interaction: {
          dragNodes: false,
          hover: true,
        }
      };
      var network = new VIS.Network(this.refs.Graph, data, options);
      network.fit();

      network.on("selectNode", (params) => {
        if(params.nodes.length == 1){
          let id = params.nodes[0];
          let node = this.state.vertices.filter( (el) =>{ return el.id == id});
          if(node && node[0] && node[0].isCompound){
            let g = this.graphStore.explodeNode(id, {edges:this.state.edges, vertices:this.state.vertices}, node[0]);
            this.setState(g);
          }else{
            network.focus(id, {
              scale:1.3, 
              animation:{
                duration:300,
                easingFunction: "easeInOutQuad"
              }
            });
            if(id !== this.props.instanceStore.mainInstanceId){
              this.props.instanceStore.setCurrentInstanceId(id, this.props.level + 1);
              this.paneStore.selectNextPane();
            }
            this.fetchGraph(id);
          }
        }
      }).on("doubleClick", () => {
        network.fit();
      }).on("hoverNode", (params) => {
        this.props.instanceStore.setInstanceHighlight(params.node, "Project");
      }).on("blurNode", (params) => {
        this.props.instanceStore.setInstanceHighlight(params.node, null);
      })
    //   cytoscape.use( dagre );

    //   var cy = cytoscape({
    //     container: this.refs.Graph, // container to render in
    //     elements: this.state.vertices.concat(this.state.edges),
    //     style: [ // the stylesheet for the graph
    //       {
    //         selector: 'node',
    //         style: {
    //           'background-color': '#666',
    //           'label': 'data(label)'
    //         }
    //       },
      
    //       {
    //         selector: 'edge',
    //         style: {
    //           'curve-style': 'bezier',
    //           'width': 4,
    //           'target-arrow-shape': 'triangle',
    //           'line-color': '#9dbaea',
    //           'target-arrow-color': '#9dbaea'
    //         }
    //       }
    //     ],
    //     layout: layoutOptions
    //   });
      
    }
    const {classes} =  this.props;
    let selectedIndex = this.paneStore.selectedIndex;
    const step = document.documentElement.clientWidth >= 992?50:80;
    return (
      <div>
        <div className={classes.graph} > <div style={{width:"100%", height:"100%"}} ref="Graph"></div> </div>
        <Provider paneStore={this.paneStore}>
          <div className={classes.container} style={{transform:`translateX(${selectedIndex*-step}vw)`}}>
            {this.props.children}
          </div>
        </Provider>
      </div>
    );
  }
}
