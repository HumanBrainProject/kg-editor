/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import Color from 'color';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useRef } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from 'react-router-dom';
import useStores from '../../../Hooks/useStores';

import type { GraphGroup, GraphLink, GraphNode } from '../../../types';
import type { ForceGraphInstance, LinkObject, NodeObject } from 'force-graph';

const useStyles = createUseStyles({
  graph: {
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    overflow: 'hidden',
    zIndex: '2',
    position: 'relative'
  },
  slider: {
    width: '5%',
    height: '20%',
    position: 'absolute',
    bottom: '10px',
    right: '0px'
  },
  settings: {
    position: 'absolute',
    top: '20px',
    right: '20px'
  },
  edit: {
    position: 'absolute',
    top: '20px',
    right: '74px'
  }
});

const GraphViz = observer(() => {

  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphInstance>();

  const classes = useStyles();

  const { appStore, graphStore, userProfileStore } = useStores();

  const location = useLocation();
  const navigate = useNavigate();

  const [dimensions, setDimensions] = useState({width: 0, height: 0});

  useEffect(() => {
    const updateDimensions = debounce(() => {
      if(wrapperRef.current) {
        setDimensions({width: wrapperRef.current.offsetWidth, height: wrapperRef.current.offsetHeight});
      }
    }, 250);
    updateDimensions();
    graphRef.current?.zoom(Math.round(Math.min(window.innerWidth / 365, window.innerHeight / 205)));
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleNodeClick = async (node: NodeObject) => {
    const graphNode = node as GraphNode;
    if (graphNode.isGroup) {
      graphStore.setGrouping(graphNode as GraphGroup, false);
    } else if (node.id !== graphStore.mainId) {
      graphStore.reset();
      if(graphNode.space && graphNode.space !== appStore.currentSpace?.id) {
        const space = userProfileStore.getSpaceInfo(graphNode.space);
        if(space.permissions.canRead) {
          const changeSpace = await appStore.switchSpace(location, navigate, graphNode.space);
          if (changeSpace) {
            navigate(`/instances/${node.id}/graph`);
          }
        }
      } else {
        navigate(`/instances/${node.id}/graph`);
      }
    }
  };

  const handleNodeHover = (node: NodeObject | null) => graphStore.setHighlightNodeConnections(node as GraphNode, true);

  const getNodeName = (node: GraphNode) => {
    if(node.isGroup) {
      const group = node as GraphGroup;
      return `Group of ${group.types.length > 1?('(' + group.name + ')'):group.name} (${group.nodes.length})`;
    }
    return `(${graphStore.groups[node.groupId]?.name}) ${node.name}`;
  };

  const getNodeLabel = (node: NodeObject) =>  {
    const graphNode  = node as GraphNode;
    const nodeName = getNodeName(graphNode);
    let space = '';
    if(graphNode.space && graphNode.space !== appStore.currentSpace?.id) {
      space = `(Space: ${graphNode.space})`;
    }
    return `${nodeName} ${space}`;
  };

  const getNodeAutoColorBy = (node: NodeObject) => (node as GraphNode).color;

  const wrapText = (context: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number, node: GraphNode) => {
    if (node.labelLines === undefined) {
      const words = text.split(/( |_|-|\.)/gi); //NOSONAR
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
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

  const getNodeCanvasObject = (node: NodeObject, ctx: any, scale: number) => {
    const graphNode = node as GraphNode;
    ctx.beginPath();
    if (graphNode.isGroup) {
      if(graphNode.x && graphNode.y) {
        ctx.rect(graphNode.x - 6, graphNode.y - 6, 12, 12);
      }
    } else {
      ctx.arc(graphNode.x, graphNode.y, graphNode.isMainNode ? 10 : 6, 0, 2 * Math.PI);
    }

    if (graphStore.highlightedNode) {
      if (!graphNode.highlighted) {
        ctx.globalAlpha = 0.1;
      }
    }
    const color = graphNode.color;
    ctx.strokeStyle = new Color(color).darken(0.25).hex();
    ctx.fillStyle = color;

    if (graphNode.isMainNode) {
      ctx.setLineDash([2, 0.5]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.fill();
    if (scale > 3) {
      ctx.beginPath();
      ctx.font = '1.2px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';

      const label = getNodeName(graphNode);
      if(graphNode.x && graphNode.y) {
        wrapText(ctx, label, graphNode.x, graphNode.y, 10, 1.3, graphNode);
      }
    }

    ctx.globalAlpha = 1;
  };

  const getLinkColor = (link: LinkObject) => {
    if (graphStore.highlightedNode) {
      if (link.target === graphStore.highlightedNode) {
        return new Color('#f39c12').alpha(1).rgb().toString();
      } else if (link.source === graphStore.highlightedNode) {
        return new Color('#1abc9c').alpha(1).rgb().toString();
      } else {
        return new Color('#ccc').alpha(0.1).rgb().toString();
      }
    } else {
      return new Color('#ccc').alpha(1).rgb().toString();
    }
  };

  const getLinkWidth = (link: LinkObject) => (graphStore.highlightedNode && (link as GraphLink).highlighted)?2:1;

  return (
    <div className={classes.graph} ref={wrapperRef}>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={{nodes: graphStore.graphDataNodes, links: graphStore.graphDataLinks}}
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
    </div>
  );
});
GraphViz.displayName = 'GraphViz';

export default GraphViz;