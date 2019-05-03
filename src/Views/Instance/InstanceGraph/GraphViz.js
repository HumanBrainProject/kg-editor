import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import ForceGraph2D from "react-force-graph-2d";
import { debounce } from "lodash";
import Color from "color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import graphStore from "../../../Stores/GraphStore";
import routerStore from "../../../Stores/RouterStore";


const styles = {
  graph: {
    width: "100%",
    height: "100%",
    borderRadius: "4px",
    overflow:"hidden",
    zIndex: "2",
    position:"relative"
  },
  slider: {
    width: "5%",
    height: "20%",
    position: "absolute",
    bottom: "10px",
    right: "0px"
  },
  capture:{
    position:"absolute",
    top:"10px",
    right:"10px"
  },
  settings:{
    position:"absolute",
    top:"20px",
    right:"20px"
  },
  edit:{
    position:"absolute",
    top:"20px",
    right:"74px"
  }
};


@injectStyles(styles)
@observer
export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graphWidth:0,
      graphHeight:0
    };
    this.initialZoom = false;
  }

  UNSAFE_componentWillReceiveProps(){
    this.initialZoom = false;
  }

  componentDidMount(){
    this.resizeDebounceFn = debounce(this.resizeWrapper, 250);
    window.addEventListener("resize", this.resizeDebounceFn);
    this.resizeWrapper();
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.resizeDebounceFn);
    this.graphRef && this.graphRef.stopAnimation();
  }

  componentDidUpdate(){
    if(!this.initialZoom && this.graphRef){
      this.graphRef.zoom(Math.round(Math.min(window.innerWidth/365, window.innerHeight/205)));
      this.initialZoom = true;
    }
  }

  resizeWrapper = () => {
    this.setState({
      graphWidth: this.graphWrapper.offsetWidth,
      graphHeight: this.graphWrapper.offsetHeight
    });
  }

  handleNodeClick = (node) => {
    if(node.isGroup){
      graphStore.explodeNode(node);
    } else if(node.id !== graphStore.mainId){
      graphStore.reset();
      routerStore.history.push("/instance/graph/"+node.id);
    }
  }

  handleCapture = (e) => {
    e.target.href = this.graphWrapper.querySelector("canvas").toDataURL("image/png");
    e.target.download = "test.png";
  }

  handleToggleSettings = () => {
    graphStore.toggleSettingsPanel();
  }

  handleNodeHover = (node) => {
    graphStore.hlNode(node);
  }

  _wrapText(context, text, x, y, maxWidth, lineHeight, node) {
    if(node.labelLines === undefined){
      let words = text.split(/( |_|-|\.)/gi);
      let line = "";
      let lines = [];

      for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n];
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n];
        }  else {
          line = testLine;
        }
      }
      lines.push(line);

      node.labelLines = lines;
    }

    y = y-(lineHeight*(node.labelLines.length-2)/2);
    node.labelLines.forEach(line => {
      context.fillText(line, x, y);
      y+=lineHeight;
    });
  }

  _paintNode = (node, ctx, scale) => {
    ctx.beginPath();
    if(node.isGroup){
      ctx.rect(node.x-6, node.y-6, 12, 12);
    } else {
      ctx.arc(node.x, node.y, node.isMainNode?10:6, 0, 2*Math.PI);
    }

    if(graphStore.highlightedNode){
      if(node !== graphStore.highlightedNode && graphStore.connectedNodes.indexOf(node) === -1){
        ctx.globalAlpha = 0.1;
      }
    }
    const color = graphStore.colorScheme[node.dataTypeLabel];
    ctx.strokeStyle = new Color(color).darken(0.25).hex();
    ctx.fillStyle = color;

    if(node.isMainNode){
      ctx.setLineDash([2, 0.5]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.fill();
    if(scale > 3){
      ctx.beginPath();
      ctx.font = "1.2px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "black";

      let label = node.title && node.title.split?node.title:"";
      if(!node.isGroup){
        label = `(${node.dataTypeLabel}) ${label}`;
      }

      this._wrapText(ctx, label, node.x, node.y, 10, 1.3, node);
    }

    ctx.globalAlpha = 1;
  };

  linkColor = (link) => {
    if(graphStore.highlightedNode){
      if(graphStore.connectedLinks.indexOf(link) === -1){
        return new Color("#ccc").alpha(0.1).rgb();
      } else if(link.target === graphStore.highlightedNode){
        return new Color("#f39c12").alpha(1).rgb();
      } else if(link.source === graphStore.highlightedNode){
        return new Color("#1abc9c").alpha(1).rgb();
      }
    } else {
      return new Color("#ccc").alpha(1).rgb();
    }
  }

  linkWidth = (link) => {
    if(graphStore.highlightedNode){
      if(graphStore.connectedLinks.indexOf(link) === -1){
        return 1;
      } else {
        return 2;
      }
    } else {
      return 1;
    }
  }

  render() {
    const { classes } = this.props;

    let data = graphStore.graphData;

    return (
      <div className={classes.graph} ref={ref => this.graphWrapper = ref}>
        {graphStore.isFetched && data !== null &&
        <ForceGraph2D
          ref={ref => this.graphRef = ref}
          width={this.state.graphWidth}
          height={this.state.graphHeight}
          graphData={data}
          nodeAutoColorBy={d => d.dataType}
          nodeLabel={node => node.dataType}
          nodeCanvasObject={this._paintNode}
          onNodeClick={this.handleNodeClick}
          onNodeHover={this.handleNodeHover}
          cooldownTime={4000}
          linkColor={this.linkColor}
          linkWidth={this.linkWidth}
          nodeRelSize={7}
          linkDirectionalArrowLength={3}
        />
        }
        <a className={`${classes.capture} btn btn-primary`} onClick={this.handleCapture}><FontAwesomeIcon icon="camera"/></a>
      </div>
    );
  }
}