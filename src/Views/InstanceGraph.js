import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";

import graphStore from "../Stores/GraphStore";
import Graph from "./Instance/Graph";
import GraphSettings from "./Instance/GraphSettings";
//import GraphHistory from "./Instance/GraphHistory";

const styles = {
  container:{
    position:"relative",
    width:"100%",
    height:"100%",
    display:"grid",
    gridGap:"20px",
    gridTemplateRows:"1fr 300px",
    gridTemplateColumns:"1fr 600px",
    padding:"20px"
  },

  graph:{
    background:"white",
    borderRadius:"4px",
    overflow:"hidden",
    gridRow:"1/span 2"
  },

  form:{
    background:"white",
    overflow:"auto",
    borderRadius:"4px",
    padding:"20px",
    position:"relative"
  },

  settings:{
    extend:"form"
  },

  history:{
    extend:"form"
  },

  editInstance:{
    position:"fixed",
    background:"rgba(0,0,0,0.75)",
    top:0,
    left:0,
    zIndex:100,
    width:"100vw",
    height:"100vh"
  },
  closeEdit:{
    position:"absolute",
    top:20,
    right:20
  }
};

@injectStyles(styles)
@observer
export default class GraphInstance extends React.Component {
  constructor(props) {
    super(props);
    graphStore.fetchGraph(props.id);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    graphStore.fetchGraph(newProps.id);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <div className={classes.graph}>
          <Graph />
        </div>
        {graphStore.sidePanel === "settings"?
          <div className={classes.settings}>
            <GraphSettings/>
          </div>
          :null/*<div className={classes.form}>
            <InstanceForm level={0} id={this.props.id} mainInstanceId={this.props.id}/>
          </div>*/
        }
        {/*<div className={classes.history}>
          <GraphHistory/>
        </div>*/}
      </div>
    );
  }
}