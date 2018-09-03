import React from "react";
import { observer, inject, Provider } from "mobx-react";
import injectStyles from "react-jss";

import InstanceStore from "../Stores/InstanceStore";
import GraphStore from "../Stores/GraphStore";
import PaneStore from "../Stores/PaneStore";
import InstanceForm from "./Instance/InstanceForm/index";
import Graph from "./Instance/Graph";

const styles = {
  container:{
    position:"absolute",
    top:"100px",
    left:"20px",
    width:"calc(100vw - 40px)",
    height:"calc(100vh - 120px)",
    display:"grid",
    gridGap:"20px",
    gridTemplateRows:"1fr",
    gridTemplateColumns:"1fr 600px"
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
  }
};

@injectStyles(styles)
@inject("navigationStore")
@observer
export default class GraphInstance extends React.Component {
  constructor(props) {
    super(props);
    this.instanceStore = new InstanceStore(this.props.history, this.props.match.params.id);
    this.props.navigationStore.setInstanceStore(this.instanceStore);
    this.graphStore = new GraphStore(this.instanceStore);
    this.paneStore = new PaneStore();
  }

  componentWillUnmount() {
    this.props.navigationStore.setInstanceStore(null);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    this.store.setMainInstance(newProps.match.params.id);
  }

  render() {
    const { classes } = this.props;

    return (
      <Provider instanceStore={this.instanceStore} graphStore={this.graphStore} paneStore={this.paneStore}>
        <div className={classes.container}>
          <div className={classes.graph}>
            <Graph />
          </div>
          <div className={classes.form}>
            <InstanceForm level={0} id={this.instanceStore.mainInstanceId} />
          </div>
        </div>
      </Provider>
    );
  }
}