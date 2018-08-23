import React from "react";
import injectStyles from "react-jss";
import { withRouter } from "react-router";
import PaneStore from "../../Stores/PaneStore";
import GraphStore from "../../Stores/GraphStore";
import { observer, Provider, inject } from "mobx-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import VIS from "vis";

const styles = {
  graphContainer: {
    padding: "80px 20px 20px 20px",
    transition: "all 0.5s ease"
  },
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
  menu: {
    display: "none",
    zIndex: 1000,
    position: "absolute",
    overflow: "hidden",
    border: "1px solid #CCC",
    whiteSpace: "nowrap",
    fontFamily: "sans-serif",
    background: " #FFF",
    color: "#333",
    borderRadius: "5px",
    padding: 0,
    "& li": {
      padding: " 8px 12px",
      cursor: "pointer",
      "list-style-type": "none",
      transition: "all .3s ease",
      "user-select": "none",
      "&:hover": {
        backgroundColor: "#DEF"
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

const options = {
  physics: { enabled: false },
  layout: {
    hierarchical: {
      enabled: true,
      direction: "UD",
      sortMethod: "directed",
      nodeSpacing: 150
    }
  },
  edges: {
    arrows: {
      to: { enabled: true, scaleFactor: 1, type: "arrow" },
      middle: { enabled: false, scaleFactor: 1, type: "arrow" },
      from: { enabled: false, scaleFactor: 1, type: "arrow" }
    },
    smooth: true
  },
  nodes: {
    shape: "box",
    widthConstraint: {
      maximum: 100
    },
    font: {
      size: 20
    }
  },
  interaction: {
    dragNodes: false,
    hover: true,
  }
};

@injectStyles(styles)
@inject("instanceStore")
@observer
class GraphContainer extends React.Component {

  constructor(props) {
    super(props);
    this.graphRef = React.createRef();
    this.state = {
      vertices: [],
      edges: [],
      menuDisplay: {
        display: "none",
        left: "-1000px",
        top: "-1000px"
      },
      step: 2
    };
    this.graphStore = new GraphStore();
    this.paneStore = new PaneStore();
    this.handleSelectNode = this.handleSelectNode.bind(this);
    this.handleOnContext = this.handleOnContext.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleBlurNode = this.handleBlurNode.bind(this);
    this.handleHoverNode = this.handleHoverNode.bind(this);
  }

  componentDidMount() {
    this.fetchGraph(this.props.instanceStore.mainInstanceId, this.state.step);
  }

  componentDidUpdate(prevProps) {
    if (this.props.show !== prevProps.show) {
      this.network.fit();
    }
  }

  handleSelectNode(params) {
    if (params.nodes.length == 1) {
      let id = params.nodes[0];
      let node = this.state.vertices.filter((el) => { return el.id == id; });
      if (node && node[0] && node[0].isCompound) {
        let g = this.graphStore.explodeNode(id, { edges: this.state.edges, vertices: this.state.vertices }, node[0]);
        this.setState({ vertices: g.vertices, edges: g.edges });
        var data = {
          nodes: new VIS.DataSet(this.state.vertices),
          edges: new VIS.DataSet(this.state.edges)
        };
        this.network.setData(data);
      } else {
        this.network.focus(id, {
          scale: 1.3,
          animation: {
            duration: 300,
            easingFunction: "easeInOutQuad"
          }
        });
        if (id !== this.props.instanceStore.mainInstanceId) {
          this.props.history.push(`/instance/${id}`);
          this.props.instanceStore.history = this.props.history;
          this.props.instanceStore.mainInstanceId = id;
          this.props.instanceStore.fetchInstanceData(this.props.instanceStore.mainInstanceId);
          this.props.instanceStore.setCurrentInstanceId(this.props.instanceStore.mainInstanceId, 0);
          this.fetchGraph(id, this.state.step);
        }
      }
    }
  }

  handleOnContext(params) {
    params.event.preventDefault();
    let node = this.network.getNodeAt(params.pointer.DOM);
    if (node) {
      this.setState({ menuDisplay: { display: "block", left: params.pointer.DOM.x, top: params.pointer.DOM.y } });
    }
  }

  handleDoubleClick() {
    if (this.network) {
      this.network.fit();
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
    this.setState({
      menuDisplay: {
        display: "none"
      }
    });
  }

  changeValue(e) {
    this.setState({ step: e });
    this.network.destroy();
    this.fetchGraph(this.props.instanceStore.mainInstanceId, e);
  }

  async fetchGraph(id, step) {
    await this.graphStore.fetchGraph(id, step);
    const graph = this.graphStore.graph;
    this.setState({ vertices: graph.vertices, edges: graph.edges });
    var data = {
      nodes: new VIS.DataSet(graph.vertices),
      edges: new VIS.DataSet(graph.edges)
    };
    this.network = new VIS.Network(this.graphRef.current, data, options);
    this.network.on("selectNode", this.handleSelectNode);
    this.network.on("doubleClick", this.handleDoubleClick);
    this.network.on("hoverNode", this.handleHoverNode);
    this.network.on("blurNode", this.handleBlurNode);
    this.network.on("oncontext", this.handleOnContext);
    this.network.selectNodes([id]);
  }
  render() {
    const { classes } = this.props;
    return (
      <div >
        <div className={classes.graphContainer}>
          <div className={classes.graph}>
            <div style={{ width: "100%", height: "100%" }} ref={this.graphRef}></div>
            <Slider className={classes.slider} vertical min={1} step={1} max={5} onAfterChange={this.changeValue.bind(this)} defaultValue={2} />
            <div>
              <ul style={this.state.menuDisplay} className={classes.menu}>
                <li onClick={this.handleMenuClick.bind(this)} data-action="regroup">Regroup nodes</li>
                <li onClick={this.handleMenuClick.bind(this)} data-action="delete">Delete node </li>
                <li onClick={this.handleMenuClick.bind(this)} data-action="third">Third thing </li>
              </ul>
            </div>
          </div>
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

const GraphContainerWithRouter = withRouter(GraphContainer);
export default GraphContainerWithRouter;