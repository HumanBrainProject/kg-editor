import React from "react";
import injectStyles from "react-jss";
import PaneStore from "../../Stores/PaneStore";
import { observer, Provider, inject } from "mobx-react";
import API from "../../Services/API";
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
    "z-index": "10"
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
    this.fetchGraph(this.props.instanceStore.mainInstanceId);
    this.paneStore = new PaneStore();
  }

  async fetchGraph(id) {
  
    const getRandomColor = function() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
    
    const { data } = await API.axios.get(API.endpoints.graph(id));
    var groups = {};
    data.vertices.forEach( (v) => {
      if(!groups[v.label]){
        groups[v.label] = {
          color:{background:getRandomColor()}
        }
      }
      v.group = v.label;
    });
    let e = data.edges.concat(this.state.edges);
    var unique = {};
    var distinct = [];
    data.vertices.concat(this.state.vertices).forEach(function (x) {
      if (!unique[x.id]) {
        distinct.push(x);
        unique[x.id] = true;
      }
    });
    console.log("V", distinct);
    this.setState({edges:e, vertices:distinct})
  }
  
  render(){
    
  
    var data = {
      nodes: new VIS.DataSet(this.state.vertices),
      edges: new VIS.DataSet(this.state.edges)
    };
    
    // provide the data in the vis format
    if(this.state.vertices.length > 1){
      
      var options = {
        physics:{enabled:false},
        layout:{hierarchical:{enabled:true, direction:"LR"}},
        edges:{
          arrows: {
            to:     {enabled: true, scaleFactor:1, type:'arrow'},
            middle: {enabled: false, scaleFactor:1, type:'arrow'},
            from:   {enabled: false, scaleFactor:1, type:'arrow'}
          },
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
          network.focus(id, {
            scale:1.3, 
            animation:{
              duration:300,
              easingFunction: "easeInOutQuad"
            }
          });
          setTimeout(() => {
            if(id !== this.props.instanceStore.mainInstanceId){
              this.props.instanceStore.setCurrentInstanceId(id, this.props.level + 1);
              this.paneStore.selectNextPane();
            }
          });
          this.fetchGraph(id);
        }
      }).on("doubleClick", () => {
        network.fit();
      }).on("hoverNode", (params) => {
        this.props.instanceStore.setInstanceHighlight(params.node, "Project");


      }).on("blurNode", (params) => {
        this.props.instanceStore.setInstanceHighlight(params.node, null);
      })
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
