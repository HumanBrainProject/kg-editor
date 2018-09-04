import { observable, action, runInAction } from "mobx";
import API from "../Services/API";
import console from "../Services/Logger";

import {find, remove, clone, pullAll, uniqueId, uniq, flatten, slice} from "lodash";

import palette from "google-palette";

const nodeTypeWhitelist = [
  "Dataset",
  "SpecimenGroup",
  "ExperimentSubject",
  "Activity",
  "Person",
  "PLAComponent",
  "Publication",
  "FileAssociation",
  "DatasetDOI",
  "ExperimentMethod",
  "ReferenceSpace",
  "ParcellationRegion",
  "ParcellationAtlas",
  "EmbargoStatus",
  "EthicsApproval",
  "ExperimentProtocol",
  "Preparation",
  "EthicsAuthority",
  "Format",
  "LicenseInformation",
  "ExperimentSample"
];

const colorScheme = {};

let colorTable = palette("mpn65", nodeTypeWhitelist.length).map(color => "#"+color);
nodeTypeWhitelist.forEach((type, index) => {colorScheme[type] = colorTable[index];});

export default class GraphStore {
  @observable step = 2;
  @observable selectedNode;
  @observable sidePanel = false;
  @observable typeStates = null;
  @observable expandedTypes = [];

  @observable.shallow nodeHistory = [];

  originalData = null;
  groupNodes = null;
  highlightedNode = null;
  connectedNodes = null;
  connectedLinks = null;

  routerHistory = null;

  constructor(instanceStore){
    this.instanceStore = instanceStore;
  }

  registerRouter(routerHistory){
    this.routerHistory = routerHistory;
  }

  get colorScheme(){
    return colorScheme;
  }

  findNodesByType(type){
    return this.originalData.nodes.filter(node => node.dataType === type);
  }

  findLinksBySourceType(type){
    return this.originalData.links.filter(link => link.source.dataType === type);
  }

  findLinksByTargetType(type){
    return this.originalData.links.filter(link => link.target.dataType === type);
  }

  findLinksByType(type){
    return this.originalData.links.filter(link => link.source.dataType === type || link.target.dataType === type);
  }

  findLinksBySourceAndTarget(sourceNode, targetNode){
    return this.originalData.links.filter(link => link.source === sourceNode && link.target === targetNode);
  }

  findLinksByNode(node){
    return this.originalData.links.filter(link => link.source === node || link.target === node);
  }

  findConnectedNodes(node){
    return uniq(flatten(this.findLinksByNode(node).map(link => [link.target, link.source])));
  }

  @action hlNode(node){
    if(node !== null && this.typeStates.get(node.dataType) === "group"){
      node = this.groupNodes.get(node.dataType);
    }
    this.highlightedNode = node;
    this.connectedNodes = node !== null? this.findConnectedNodes(node): [];
    this.connectedLinks = node !== null? this.findLinksByNode(node): [];
  }

  @action async fetchGraph(id) {
    try {
      const { data } = await API.axios.get(API.endpoints.graph(id, this.step));
      runInAction( ()=>{
        this.originalData = data;
        this.filterOriginalData();
        this.expandedTypes = [];
      } );
    } catch (e) {
      console.log(e);
    }
  }

  @action filterOriginalData(){
    //Remove nodes that are not whitelisted
    remove(this.originalData.nodes, node => nodeTypeWhitelist.indexOf(node.dataType) === -1);
    remove(this.originalData.links, link => !find(this.originalData.nodes, node => node.id === link.source) || !find(this.originalData.nodes, node => node.id === link.target));

    //Transform links source and target reference to actual node objects
    this.originalData.links.forEach(link => {
      link.source = find(this.originalData.nodes, node => node.id === link.source);
      link.target = find(this.originalData.nodes, node => node.id === link.target);
    });

    this.groupNodes = new Map();
    this.typeStates = new Map();
    //Create group nodes
    nodeTypeWhitelist.forEach(nodeType => {
      let nodesOfType = this.findNodesByType(nodeType);
      if(nodesOfType.length <= 1){
        this.typeStates.set(nodeType, nodesOfType.length===1?"show":"none");
        return;
      }

      let groupNode = {
        id:"Group_"+nodeType,
        dataType:"Group_"+nodeType,
        name:"Group_"+nodeType,
        title:"Group of "+nodeType+" ("+nodesOfType.length+")",
        original_dataType:nodeType,
        isGroup:true,
        groupSize: nodesOfType.length
      };

      this.groupNodes.set(nodeType, groupNode);
      this.typeStates.set(nodeType, "group");
      this.originalData.nodes.push(groupNode);
    });

    this.originalData.links.forEach(link => {
      let sourceGroupNode = this.groupNodes.get(link.source.dataType);
      let targetGroupNode = this.groupNodes.get(link.target.dataType);

      if(sourceGroupNode && this.findLinksBySourceAndTarget(sourceGroupNode, link.target).length === 0){
        let newLink = clone(link);
        newLink.source =  sourceGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
      if(targetGroupNode && this.findLinksBySourceAndTarget(link.source, targetGroupNode).length === 0){
        let newLink = clone(link);
        newLink.target =  targetGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
      if(sourceGroupNode && targetGroupNode && this.findLinksBySourceAndTarget(sourceGroupNode, targetGroupNode).length === 0){
        let newLink = clone(link);
        newLink.source =  sourceGroupNode;
        newLink.target =  targetGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
    });
  }

  get graphData(){
    if(this.typeStates === null || this.originalData === null){
      return null;
    }

    let graphData = {
      nodes:[...this.originalData.nodes],
      links:[...this.originalData.links]
    };

    this.typeStates.forEach((state, type)=>{
      if(state === "group" || state === "hide"){
        pullAll(graphData.nodes, this.findNodesByType(type));
        pullAll(graphData.links, this.findLinksByType(type));
      }
      if(state === "show" || state === "hide"){
        pullAll(graphData.nodes, this.findNodesByType("Group_"+type));
        pullAll(graphData.links, this.findLinksByType("Group_"+type));
      }
    });

    return graphData;
  }

  @action explodeNode(clickedNode) {
    if(clickedNode.isGroup){
      this.typeStates.set(clickedNode.original_dataType, "show");
    }
  }

  @action setStep(step){
    this.step = step;
  }

  @action toggleSettingsPanel(state){
    if(state === undefined){
      this.sidePanel = this.sidePanel === "settings"?"":"settings";
    } else {
      if(state){
        this.sidePanel = "settings";
      } else {
        this.sidePanel = "";
      }
    }
  }

  @action toggleHistoryPanel(state){
    if(state === undefined){
      this.sidePanel = this.sidePanel === "history"?"":"history";
    } else {
      if(state){
        this.sidePanel = "history";
      } else {
        this.sidePanel = "";
      }
    }
  }

  @action setTypeState(nodeType, state){
    this.typeStates.set(nodeType, state);
  }

  get nodeTypeWhitelist(){
    return nodeTypeWhitelist;
  }

  @action expandType(typeToExpand){
    this.expandedTypes.push(typeToExpand);
  }

  @action collapseType(typeToCollapse){
    remove(this.expandedTypes, type => typeToCollapse === type);
  }

  @action toggleType(typeToToggle){
    if(find(this.expandedTypes, type => typeToToggle === type)){
      this.collapseType(typeToToggle);
    } else {
      this.expandType(typeToToggle);
    }
  }

  @action historyPush(nextNode){
    this.nodeHistory.push(find(this.originalData.nodes, node => node.id === this.instanceStore.mainInstanceId));
    this.routerHistory.push("/graph/"+nextNode.id);
  }
  @action historyBack(level = 0){
    level = this.nodeHistory.length - 1 - level;
    let targetNode = this.nodeHistory[level];
    this.nodeHistory = slice(this.nodeHistory, 0, level);
    this.routerHistory.push("/graph/"+targetNode.id);
  }

  getCurrentNode(){
    return find(this.originalData.nodes, node => node.id === this.instanceStore.mainInstanceId);
  }
}