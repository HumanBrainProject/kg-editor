import React from "react";
import { observer, inject, Provider } from "mobx-react";
import injectStyles from "react-jss";
import { Button, Glyphicon } from "react-bootstrap";

import InstanceStore from "../Stores/InstanceStore";
import GraphStore from "../Stores/GraphStore";
import PaneStore from "../Stores/PaneStore";
import InstanceForm from "./Instance/InstanceForm.js";
import Graph from "./Instance/Graph";
import GraphSettings from "./Instance/GraphSettings";
import GraphHistory from "./Instance/GraphHistory";
import Instance from "./Instance";

const styles = {
  container:{
    position:"absolute",
    top:"100px",
    left:"20px",
    width:"calc(100vw - 40px)",
    height:"calc(100vh - 120px)",
    display:"grid",
    gridGap:"20px",
    gridTemplateRows:"1fr 300px",
    gridTemplateColumns:"1fr 600px"
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
@inject("navigationStore", "routerHistory")
@observer
export default class GraphInstance extends React.Component {
  constructor(props) {
    super(props);
    this.instanceStore = new InstanceStore(this.props.history, this.props.match.params.id);
    this.instanceStore.readOnlyMode = true;
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

  handleCloseEdit = () => {
    this.graphStore.toggleEditModal();
  }

  render() {
    const { classes } = this.props;

    return (
      <Provider instanceStore={this.instanceStore} graphStore={this.graphStore} paneStore={this.paneStore}>
        <div className={classes.container}>
          <div className={classes.graph}>
            {!this.graphStore.editModal && <Graph />}
          </div>
          {this.graphStore.sidePanel === "settings"?
            <div className={classes.settings}>
              <GraphSettings/>
            </div>
            :<div className={classes.form}>
              <InstanceForm level={0} id={this.instanceStore.mainInstanceId} />
            </div>
          }
          <div className={classes.history}>
            <GraphHistory/>
          </div>
          {this.graphStore.editModal &&
            <div className={classes.editInstance}>
              <Instance history={this.props.routerHistory} match={{params:{id:this.instanceStore.mainInstanceId}}}/>
              <Button className={`btn ${classes.closeEdit}`} onClick={this.handleCloseEdit}><Glyphicon glyph={"remove"}/></Button>
            </div>
          }
        </div>
      </Provider>
    );
  }
}