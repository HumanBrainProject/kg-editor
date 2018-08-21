import React from "react";
import injectStyles from "react-jss";
import PaneStore from "../../Stores/PaneStore";
import GraphStore from "../../Stores/GraphStore";
import { observer, Provider, inject } from "mobx-react";
import VIS from "vis";

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
    "z-index": "10",
    '& .vis-tooltip': {
      "z-index":"11",
      backgroundColor: "#1496bb",
      color: "#fff",
      display: "block",
      "margin-bottom": "15px",
      padding: "20px",
      "pointer-events": "none",
      position: "absolute",
      transform:"opacity  0s linear 1s",
      "box-shadow": "2px 2px 6px rgba(0, 0, 0, 0.28)",
      '&:before':{
        bottom: "-20px",
        content: " ",
        display: "block",
        height: "20px",
        opacity: 0,
        left: 0,
        position: "absolute",
        width: "100%"
      },
      '&:after': {
        "border-left": "solid transparent 10px",
        "border-right": "solid transparent 10px",
        "border-top": "solid #1496bb 10px",
        "bottom": "-10px",
        content: " ",
        height: 0,
        left: "50%",
        marginLeft: "-13px",
        position: "absolute",
        width: 0
      }

    }
  }
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
              this.props.instanceStore.setCurrentInstanceId(id, 0);
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
      }).on("oncontext", (params) => {
        // params.event.preventDefault();
        console.log("Params", params);
        let node = network.getNodeAt(params.pointer.DOM);
        console.log("Node", node);
      });
     
    }
    const {classes} =  this.props;
    let selectedIndex = this.paneStore.selectedIndex;
    const step = document.documentElement.clientWidth >= 992?50:80;
    return (
      <div>
        <div className={classes.graph} > 
          <div style={{width:"100%", height:"100%"}} ref="Graph"></div> 
        </div>
        <Provider paneStore={this.paneStore}>
          <div className={classes.container} style={{transform:`translateX(${selectedIndex*-step}vw)`}}>
            {this.props.children}
          </div>
        </Provider>
      </div>
    );
  }
}
