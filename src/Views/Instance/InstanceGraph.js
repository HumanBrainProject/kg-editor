import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";

import graphStore from "../../Stores/GraphStore";
import GraphViz from "./InstanceGraph/GraphViz";
import GraphSettings from "./InstanceGraph/GraphSettings";

const styles = {
  container:{
    position:"relative",
    width:"100%",
    height:"100%",
    display:"grid",
    gridGap:"20px",
    gridTemplateRows:"1fr",
    gridTemplateColumns:"1fr 450px",
    padding:"20px"
  },

  graph:{
    background:"white",
    borderRadius:"4px",
    overflow:"hidden"
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
          <GraphViz />
        </div>
        <div className={classes.settings}>
          <GraphSettings/>
        </div>
      </div>
    );
  }
}