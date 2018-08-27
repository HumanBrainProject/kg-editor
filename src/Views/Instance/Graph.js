import React from "react";
import injectStyles from "react-jss";
import GraphContextMenu from "./GraphContextMenu";
import GraphNavigation from "./GraphNavigation";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { observer } from "mobx-react";
import { ForceGraph2D } from "react-force-graph";

const styles = {
  graph: {
    width: "60%",
    height: "90%",
    position: "absolute",
    "background-color": "white",
    "z-index": "10",
    transition: "all 0.5s ease",
    "& .vis-tooltip": {
      "z-index": "11",
      backgroundColor: "#1496bb",
      color: "#fff",
      display: "block",
      "margin-bottom": "15px",
      padding: "20px",
      "pointer-events": "none",
      position: "absolute",
      transform: "opacity  0s linear 1s",
      "box-shadow": "2px 2px 6px rgba(0, 0, 0, 0.28)",
      "&:before": {
        bottom: "-20px",
        content: " ",
        display: "block",
        height: "20px",
        opacity: 0,
        left: 0,
        position: "absolute",
        width: "100%"
      },
      "&:after": {
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
  },
  container: {
    width: "35%",
    height: "100%",
    marginLeft: "auto",
    overflow: "visible",
    transition: "all 0.5s ease"
  },
  slider: {
    width: "5%",
    height: "20%",
    position: "absolute",
    bottom: "10px",
    right: "0px"
  }
};


@injectStyles(styles)
@observer
export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    // this.graphRef = React.createRef();
    this.divRef= React.createRef();
    this.handleSelectNode = this.handleSelectNode.bind(this);
    this.handleOnContext = this.handleOnContext.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleBlurNode = this.handleBlurNode.bind(this);
    this.handleHoverNode = this.handleHoverNode.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  componentDidMount() {

    this.props.graphStore.initGraph(this.props.instanceStore.mainInstanceId).then(() => {
      // this.props.graphStore.network.on("selectNode", this.handleSelectNode);
      // this.props.graphStore.network.on("doubleClick", this.handleDoubleClick);
      // this.props.graphStore.network.on("hoverNode", this.handleHoverNode);
      // this.props.graphStore.network.on("blurNode", this.handleBlurNode);
      // this.props.graphStore.network.on("oncontext", this.handleOnContext);
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.show !== prevProps.show && this.props.graphStore.network) {
      this.props.graphStore.network.fit();
    }
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.props.graphStore.updateGraph(newProps.instanceStore.mainInstanceId);
  }

  handleDoubleClick() {
    if (this.props.graphStore.network) {
      this.props.graphStore.network.fit();
    }
  }

  handleBlurNode(params) {
    this.props.instanceStore.setInstanceHighlight(params.node, null);
  }

  handleHoverNode(params) {
    this.props.instanceStore.setInstanceHighlight(params.node, "Project");
  }

  handleMenuClick(event) {
    let action = event.currentTarget.dataset.action;
    switch (action) {
    case "regroup":
      break;
    }
    this.props.graphStore.hideContextMenu();
  }

  handleSelectNode(params){
    this.props.graphStore.handleSelectNode(params);
  }

  handleOnContext(params){
    this.props.graphStore.handleOnContext(params);
  }

  handlePrevious(){
    this.props.graphStore.handlePrevious();
  }

  changeValue(e) {
    this.props.graphStore.setStep(e);
    this.props.graphStore.updateGraph(this.props.instanceStore.mainInstanceId);
  }

  handleNavigationClick(index){
    this.props.graphStore.handleNavigationClick(index);
  }



  render() {
    const { classes } = this.props;
    return (
      <div className={classes.graph} ref={this.divRef}>
        {/* <div style={{ width: "100%", height: "100%" }} ref={this.graphRef}></div> */}
        <ForceGraph2D
          graphData={this.props.graphStore._graph}
          nodeAutoColorBy={d => d.dataType}
        />
        <Slider className={classes.slider} vertical min={1} step={1} max={5} onAfterChange={this.changeValue.bind(this)} defaultValue={2} />
        <GraphContextMenu style={this.props.graphStore.menuDisplay} handleMenuClick={this.handleMenuClick} />
        <GraphNavigation handleNavigationClick={this.handleNavigationClick.bind(this)} breadCrumbs={this.props.graphStore.breadCrumbs} />
      </div>
    );
  }
}