import { observable, action, runInAction } from "mobx";
import { find, remove, clone, pullAll, uniqueId, uniq, flatten } from "lodash";

import API from "../Services/API";
import console from "../Services/Logger";

import dataTypesStore from "../Stores/DataTypesStore";
import structureStore from "../Stores/StructureStore";

class GraphStore {
  @observable sidePanel = false;
  @observable typeStates = null;
  @observable expandedTypes = [];
  @observable isFetching = false;
  @observable isFetched = false;
  @observable mainId = null;

  originalData = null;
  groupNodes = null;
  highlightedNode = null;
  connectedNodes = null;
  connectedLinks = null;

  findNodesBySchema(schema) {
    return this.originalData.nodes.filter(node => node.schemas === schema);
  }

  findNodesByLabel(label) {
    return this.originalData.nodes.filter(node => structureStore.findLabelBySchema(node.schemas) === label);
  }

  findLinksByLabel(label) {
    return this.originalData.links.filter(link => structureStore.findLabelBySchema(link.source.schemas) === label || structureStore.findLabelBySchema(link.target.schemas) === label);
  }

  findLinksBySourceSchema(schema) {
    return this.originalData.links.filter(link => link.source.schemas === schema);
  }

  findLinksByTargetSchema(schema) {
    return this.originalData.links.filter(link => link.target.schemas === schema);
  }

  findLinksBySchema(schema) {
    return this.originalData.links.filter(link => link.source.schemas === schema || link.target.schemas === schema);
  }

  findLinksBySourceAndTarget(sourceNode, targetNode) {
    return this.originalData.links.filter(link => link.source === sourceNode && link.target === targetNode);
  }

  findLinksByNode(node) {
    return this.originalData.links.filter(link => link.source === node || link.target === node);
  }

  findConnectedNodes(node) {
    return uniq(flatten(this.findLinksByNode(node).map(link => [link.target, link.source])));
  }

  @action hlNode(node) {
    console.log("HLNODE", node);
    if (node !== null && this.typeStates.get(structureStore.findLabelBySchema(node.schemas)) === "group") {
      node = this.groupNodes.get(structureStore.findLabelBySchema(node.schemas));
    }
    this.highlightedNode = node;
    this.connectedNodes = node !== null ? this.findConnectedNodes(node) : [];
    this.connectedLinks = node !== null ? this.findLinksByNode(node) : [];
  }

  @action async fetchGraph(id) {
    this.isFetched = false;
    this.isFetching = true;
    try {
      const { data } = await API.axios.get(API.endpoints.graph(id));
      runInAction(() => {
        this.mainId = id;
        this.originalData = data;
        this.filterOriginalData();
        this.expandedTypes = [];
        this.isFetched = true;
        this.isFetching = false;
      });
    } catch (e) {
      console.log(e);
    }
  }

  @action reset() {
    this.isFetched = false;
    this.isFetching = false;
    this.expandedTypes = [];
    this.originalData = null;
    this.groupNodes = null;
    this.highlightedNode = null;
    this.connectedNodes = null;
    this.connectedLinks = null;
    this.mainId = null;
  }

  @action filterOriginalData() {
    //Remove nodes that are not whitelisted
    remove(this.originalData.nodes, node => !dataTypesStore.dataTypes.some(nodeType => nodeType.label === structureStore.findLabelBySchema(node.schemas)));
    remove(this.originalData.links, link => !find(this.originalData.nodes, node => node.id === link.source) || !find(this.originalData.nodes, node => node.id === link.target));
    //Transform links source and target reference to actual node objects
    this.originalData.links.forEach(link => {
      link.source = find(this.originalData.nodes, node => node.id === link.source);
      link.target = find(this.originalData.nodes, node => node.id === link.target);
    });
    this.originalData.nodes.forEach(node => {
      node.dataTypeLabel = structureStore.findLabelBySchema(node.schemas); //node.dataType.replace("https://schema.hbp.eu/minds/","");
      node.isMainNode = node.id.includes(this.mainId);
    });

    this.groupNodes = new Map();
    this.typeStates = new Map();
    //Create group nodes
    dataTypesStore.dataTypes.forEach(nodeType => {
      let nodesOfType = this.findNodesByLabel(nodeType.label);
      if (nodesOfType.length <= 1) {
        this.typeStates.set(nodeType.label, nodesOfType.length === 1 ? "show" : "none");
        return;
      }

      let groupNode = {
        id: "Group_" + nodeType.label,
        dataType: "Group_" + nodeType.label,
        name: "Group_" + nodeType.label,
        title: "Group of " + nodeType.label + " (" + nodesOfType.length + ")",
        original_dataType: nodeType.label,
        dataTypeLabel: nodeType.label,
        isGroup: true,
        groupSize: nodesOfType.length
      };

      this.groupNodes.set(nodeType.label, groupNode);
      this.typeStates.set(nodeType.label, "group");
      this.originalData.nodes.push(groupNode);
    });

    this.originalData.links.forEach(link => {
      let sourceGroupNode = this.groupNodes.get(structureStore.findLabelBySchema(link.source.schemas));
      let targetGroupNode = this.groupNodes.get(structureStore.findLabelBySchema(link.target.schemas));

      if (sourceGroupNode && this.findLinksBySourceAndTarget(sourceGroupNode, link.target).length === 0) {
        let newLink = clone(link);
        newLink.source = sourceGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
      if (targetGroupNode && this.findLinksBySourceAndTarget(link.source, targetGroupNode).length === 0) {
        let newLink = clone(link);
        newLink.target = targetGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
      if (sourceGroupNode && targetGroupNode && this.findLinksBySourceAndTarget(sourceGroupNode, targetGroupNode).length === 0) {
        let newLink = clone(link);
        newLink.source = sourceGroupNode;
        newLink.target = targetGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
    });
  }

  get graphData() {
    if (this.typeStates === null || this.originalData === null) {
      return null;
    }

    let graphData = {
      nodes: [...this.originalData.nodes],
      links: [...this.originalData.links]
    };

    this.typeStates.forEach((state, type) => {
      if (state === "group" || state === "hide") {
        pullAll(graphData.nodes, this.findNodesByLabel(type));
        pullAll(graphData.links, this.findLinksByLabel(type));
      }
      if (state === "show" || state === "hide") {
        pullAll(graphData.nodes, this.findNodesByLabel("Group_" + type));
        pullAll(graphData.links, this.findLinksByLabel("Group_" + type));
      }
    });

    return graphData;
  }

  @action explodeNode(clickedNode) {
    if (clickedNode.isGroup) {
      this.typeStates.set(clickedNode.original_dataType, "show");
    }
  }

  @action toggleSettingsPanel(state) {
    if (state === undefined) {
      this.sidePanel = this.sidePanel === "settings" ? "" : "settings";
    } else {
      if (state) {
        this.sidePanel = "settings";
      } else {
        this.sidePanel = "";
      }
    }
  }

  @action setTypeState(nodeType, state) {
    this.typeStates.set(nodeType, state);
  }

  @action expandType(typeToExpand) {
    this.expandedTypes.push(typeToExpand);
  }

  @action collapseType(typeToCollapse) {
    remove(this.expandedTypes, type => typeToCollapse === type);
  }

  @action toggleType(typeToToggle) {
    if (find(this.expandedTypes, type => typeToToggle === type)) {
      this.collapseType(typeToToggle);
    } else {
      this.expandType(typeToToggle);
    }
  }

  getCurrentNode() {
    return find(this.originalData.nodes, node => node.id === this.instanceStore.mainInstanceId);
  }
}

export default new GraphStore();