/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React, { useEffect, useState, useRef } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react";
import ForceGraph2D from "react-force-graph-2d";
import { debounce } from "lodash";
import Color from "color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import graphStore from "../../../Stores/GraphStore";
import routerStore from "../../../Stores/RouterStore";
import appStore from "../../../Stores/AppStore";

const handleNodeClick = node => {
  if (node.isGroup) {
    graphStore.setGrouping(node, false);
  } else if (node.id !== graphStore.mainId) {
    if(node.workspace === appStore.currentWorkspace.id){
      graphStore.reset();
      routerStore.history.push("/instance/graph/" + node.id);
    }
  }
};

const handleCapture = e => {
  e.target.href = this.graphWrapper.querySelector("canvas").toDataURL("image/png");
  e.target.download = "test.png";
};

const handleNodeHover = node => graphStore.setHighlightNodeConnections(node, true);

const getNodeName = node => {
  if(node.isGroup) {
    return `Group of ${node.types.length > 1?("(" + node.name + ")"):node.name} (${node.nodes.length})`;
  }
  return `(${graphStore.groups[node.groupId].name}) ${node.name}`;
};

const getNodeLabel = node => `${getNodeName(node)} ${node.workspace !== appStore.currentWorkspace.id?`(Workspace: ${node.workspace})`:""}`;

const getNodeAutoColorBy = node => node.color;

const wrapText = (context, text, x, y, maxWidth, lineHeight, node) => {
  if (node.labelLines === undefined) {
    let words = text.split(/( |_|-|\.)/gi);
    let line = "";
    let lines = [];

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n];
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n];
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    node.labelLines = lines;
  }

  y = y - (lineHeight * (node.labelLines.length - 2) / 2);
  node.labelLines.forEach(line => {
    context.fillText(line, x, y);
    y += lineHeight;
  });
};

const getNodeCanvasObject = (node, ctx, scale) => {
  ctx.beginPath();
  if (node.isGroup) {
    ctx.rect(node.x - 6, node.y - 6, 12, 12);
  } else {
    ctx.arc(node.x, node.y, node.isMainNode ? 10 : 6, 0, 2 * Math.PI);
  }

  if (graphStore.highlightedNode) {
    if (!node.highlighted) {
      ctx.globalAlpha = 0.1;
    }
  }
  const color = node.color;
  ctx.strokeStyle = new Color(color).darken(0.25).hex();
  ctx.fillStyle = color;

  if (node.isMainNode) {
    ctx.setLineDash([2, 0.5]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.stroke();
  ctx.fill();
  if (scale > 3) {
    ctx.beginPath();
    ctx.font = "1.2px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";

    const label = getNodeName(node);

    wrapText(ctx, label, node.x, node.y, 10, 1.3, node);
  }

  ctx.globalAlpha = 1;
};

const getLinkColor = link => {
  if (graphStore.highlightedNode) {
    if (!link.highlighted) {
      return new Color("#ccc").alpha(0.1).rgb();
    } else if (link.target === graphStore.highlightedNode) {
      return new Color("#f39c12").alpha(1).rgb();
    } else if (link.source === graphStore.highlightedNode) {
      return new Color("#1abc9c").alpha(1).rgb();
    }
  } else {
    return new Color("#ccc").alpha(1).rgb();
  }
};

const getLinkWidth = link => (graphStore.highlightedNode && link.highlighted)?2:1;

const useStyles = createUseStyles({
  graph: {
    width: "100%",
    height: "100%",
    borderRadius: "4px",
    overflow: "hidden",
    zIndex: "2",
    position: "relative"
  },
  slider: {
    width: "5%",
    height: "20%",
    position: "absolute",
    bottom: "10px",
    right: "0px"
  },
  capture: {
    position: "absolute",
    top: "10px",
    right: "10px"
  },
  settings: {
    position: "absolute",
    top: "20px",
    right: "20px"
  },
  edit: {
    position: "absolute",
    top: "20px",
    right: "74px"
  }
});

const Graph = observer(() => {

  const wrapperRef = useRef();
  const graphRef = useRef();

  const classes = useStyles();

  const [dimensions, setDimensions] = useState({width: 0, height: 0});

  useEffect(() => {

    const updateDimensions = debounce(() => {
      setDimensions({width: wrapperRef.current.offsetWidth, height: wrapperRef.current.offsetHeight});
    }, 250);

    updateDimensions();
    wrapperRef.current.zoom(Math.round(Math.min(window.innerWidth / 365, window.innerHeight / 205)));
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      graphRef.current.stopAnimation();
    };
  }, []);

  return (
    <div className={classes.graph} ref={wrapperRef}>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphStore.graphData}
        nodeAutoColorBy={getNodeAutoColorBy}
        nodeLabel={getNodeLabel}
        nodeCanvasObject={getNodeCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTime={4000}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        nodeRelSize={7}
        linkDirectionalArrowLength={3}
      />
      <a className={`${classes.capture} btn btn-primary`} onClick={handleCapture}><FontAwesomeIcon icon="camera" /></a>
    </div>
  );
});

export default Graph;