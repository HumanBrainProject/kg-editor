import React from "react";
import injectStyles from "react-jss";
import PaneStore from "../../Stores/PaneStore";
import GraphStore from "../../Stores/GraphStore";
import { observer, Provider, inject } from "mobx-react";
import Graph from "./Graph";


const styles = {
  graphContainer: {
    padding: "80px 20px 20px 20px",
    transition: "all 0.5s ease"
  },
  container:{
    width: "35%",
    float: "right"
  }
};



@injectStyles(styles)
@inject("instanceStore")
@observer
export default class GraphContainer extends React.Component {

  constructor(props) {
    super(props);
    this.graphStore = new GraphStore(this.props.instanceStore);
    this.paneStore = new PaneStore();
    this.events = {};
  }

  render() {
    const { classes } = this.props;
    return (
      <div >
        <div className={classes.graphContainer}>
          <Graph graphStore={this.graphStore} instanceStore={this.props.instanceStore}/>
          <Provider paneStore={this.paneStore}>
            <div className={classes.container}>
              {this.props.children}
            </div>
          </Provider>
        </div>
      </div>
    );
  }
}
