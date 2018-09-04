import React from "react";
import { observer, inject, Provider } from "mobx-react";
import injectStyles from "react-jss";

import InstanceStore from "../Stores/InstanceStore";
import GraphStore from "../Stores/GraphStore";
import PaneStore from "../Stores/PaneStore";
import InstanceForm from "./Instance/InstanceForm/index";
import Graph from "./Instance/Graph";
import GraphSettings from "./Instance/GraphSettings";
import GraphHistory from "./Instance/GraphHistory";

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
  },

  settings:{
    extend:"form"
  },

  history:{
    extend:"form"
  }
};

@injectStyles(styles)
@inject("navigationStore", "routerHistory")
@observer
export default class GraphInstance extends React.Component {
  constructor(props) {
    super(props);
    this.instanceStore = new InstanceStore(this.props.history, this.props.match.params.id);
    this.props.navigationStore.setInstanceStore(this.instanceStore);
    this.graphStore = new GraphStore(this.instanceStore);
    this.graphStore.registerRouter(props.routerHistory);
    this.paneStore = new PaneStore();
  }

  componentWillUnmount() {
    this.props.navigationStore.setInstanceStore(null);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    this.instanceStore.setMainInstance(newProps.match.params.id);
    this.graphStore.fetchGraph(newProps.match.params.id);
  }

  render() {
    const { classes } = this.props;

    return (
      <Provider instanceStore={this.instanceStore} graphStore={this.graphStore} paneStore={this.paneStore}>
        <div className={classes.container}>
          <div className={classes.graph}>
            <Graph />
          </div>
          {this.graphStore.sidePanel === "settings"?
            <div className={classes.settings}>
              <GraphSettings/>
            </div>
            :this.graphStore.sidePanel === "history"?
              <div className={classes.history}>
                <GraphHistory/>
              </div>
              :
              <div className={classes.form}>
                <InstanceForm level={0} id={this.instanceStore.mainInstanceId} />
              </div>
          }
        </div>
      </Provider>
    );
  }
}